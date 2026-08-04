import type { UserDocument } from '@models/user.model';
import type {
    ActivateUserParams,
    AuthUser,
    CreateUserParams,
    DeleteUserParams,
    GetUserOptions,
    PaginatedUsers,
    PublicUser,
    UpdateUserParams,
    UpdateUserPasswordParams,
} from '@interfaces/user.interface';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@lib/constants/pagination.constant';
import { comparePassword, generatePassword, hashPassword } from '@utils/password.util';
import { UserModel } from '@models/user.model';
import { sendEmail } from '@services/mailing.service';
import { createLog } from '@services/log.service';

import * as err from '@lib/utils/errors.util';

const toPublicUser = (user: UserDocument): PublicUser => {
    const publicUser = user.toObject();
    delete (publicUser as Partial<typeof publicUser>).passwordHash;
    delete (publicUser as Partial<typeof publicUser>).passwordResetTokenHash;
    delete (publicUser as Partial<typeof publicUser>).passwordResetExpiresAt;
    return publicUser as PublicUser;
};

const assertAdmin = (authUser: AuthUser): void => {
    if (authUser.role !== 'admin') {
        throw new err.ForbiddenError('Only administrators can manage users');
    }
};

const buildUserQuery = (
    idOrEmail: { id?: string; email?: string },
    options: GetUserOptions = {},
): Record<string, unknown> => {
    const { activeOnly = false } = options;
    const query: Record<string, unknown> = {};

    if (idOrEmail.id) {
        query['_id'] = idOrEmail.id;
    }

    if (idOrEmail.email) {
        query['email'] = idOrEmail.email.toLowerCase().trim();
    }

    if (activeOnly) {
        query['active'] = true;
    }

    return query;
};

export const getUserById = async (
    id: string,
    options: GetUserOptions = {},
): Promise<(PublicUser & { passwordHash?: string }) | null> => {
    const { includePassword = false } = options;

    let query = UserModel.findOne(buildUserQuery({ id }, options));

    if (includePassword) {
        query = query.select('+passwordHash');
    }

    const user = await query.exec();

    if (!user) {
        return null;
    }

    if (includePassword) {
        return user.toObject() as PublicUser & { passwordHash: string };
    }

    return toPublicUser(user);
};

export const getUserByEmail = async (
    email: string,
    options: GetUserOptions = {},
): Promise<(PublicUser & { passwordHash?: string }) | null> => {
    const { includePassword = false } = options;

    let query = UserModel.findOne(buildUserQuery({ email }, options));

    if (includePassword) {
        query = query.select('+passwordHash');
    }

    const user = await query.exec();

    if (!user) {
        return null;
    }

    if (includePassword) {
        return user.toObject() as PublicUser & { passwordHash: string };
    }

    return toPublicUser(user);
};

export const getAllUsers = async (
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedUsers> => {
    const safePage = Math.max(page, 1);
    const safePageSize = Math.max(pageSize, 1);
    const skip = (safePage - 1) * safePageSize;

    const [users, totalItems] = await Promise.all([
        UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(safePageSize).exec(),
        UserModel.countDocuments().exec(),
    ]);

    return {
        page: safePage,
        pageSize: safePageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / safePageSize) || 0,
        items: users.map(toPublicUser),
    };
};

export const createUser = async (params: CreateUserParams): Promise<PublicUser> => {
    const { firstName, lastName, email, phone, role, authUser } = params;

    assertAdmin(authUser);

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    const [existingByEmail, existingByPhone] = await Promise.all([
        UserModel.findOne({ email: normalizedEmail }).exec(),
        UserModel.findOne({ phone: normalizedPhone }).exec(),
    ]);

    if (existingByEmail) {
        throw new err.ConflictError(
            existingByEmail.active
                ? 'A user with this email already exists'
                : 'A user with this email already exists but is inactive',
        );
    }

    if (existingByPhone) {
        throw new err.ConflictError(
            existingByPhone.active
                ? 'A user with this phone already exists'
                : 'A user with this phone already exists but is inactive',
        );
    }

    const temporaryPassword = generatePassword();
    const passwordHash = await hashPassword(temporaryPassword);

    await sendEmail(normalizedEmail, 'create-user', {
        firstName,
        lastName,
        email: normalizedEmail,
        password: temporaryPassword,
    });

    const user = await UserModel.create({
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        role,
        passwordHash,
        active: true,
        mustChangePassword: true,
    });

    await createLog({
        message: `User ${user.email} was created by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { userId: user._id, role },
    });

    return toPublicUser(user);
};

export const updateUser = async (params: UpdateUserParams): Promise<PublicUser> => {
    const { id, authUser, firstName, lastName, phone, role } = params;

    assertAdmin(authUser);

    const user = await UserModel.findById(id).exec();

    if (!user) {
        throw new err.NotFoundError('User not found');
    }

    if (phone && phone.trim() !== user.phone) {
        const existingByPhone = await UserModel.findOne({
            phone: phone.trim(),
            _id: { $ne: user._id },
        }).exec();

        if (existingByPhone) {
            throw new err.ConflictError('A user with this phone already exists');
        }

        user.phone = phone.trim();
    }

    if (firstName) {
        user.firstName = firstName;
    }

    if (lastName) {
        user.lastName = lastName;
    }

    if (role) {
        if (user.role === 'admin' && role !== 'admin') {
            const activeAdminCount = await UserModel.countDocuments({
                role: 'admin',
                active: true,
            }).exec();

            if (activeAdminCount <= 1 && user.active) {
                throw new err.ForbiddenError('The last active administrator cannot change role');
            }
        }

        user.role = role;
    }

    await user.save();
    await createLog({
        message: `User ${user.email} was updated by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { userId: user._id },
    });

    return toPublicUser(user);
};

export const updateUserPassword = async (params: UpdateUserPasswordParams): Promise<PublicUser> => {
    const { id, password, currentPassword, authUser, isFromRecovery = false } = params;

    const user = await UserModel.findOne(buildUserQuery({ id }, { activeOnly: true }))
        .select('+passwordHash')
        .exec();

    if (!user) {
        throw new err.NotFoundError('User not found');
    }

    if (!isFromRecovery && authUser) {
        if (authUser.id !== id && authUser.role !== 'admin') {
            throw new err.ForbiddenError('You can only change your own password');
        }
    }

    if (!isFromRecovery) {
        if (!currentPassword) {
            throw new err.UnauthorizedError('Current password is required');
        }

        const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);

        if (!isPasswordValid) {
            throw new err.UnauthorizedError('Current password is incorrect');
        }
    }

    user.passwordHash = await hashPassword(password);
    user.mustChangePassword = false;

    await user.save();
    await createLog({
        message: isFromRecovery
            ? `User ${user.email} recovered their password`
            : `User ${user.email} updated their password`,
        actorId: authUser?.id ?? user._id,
        type: 'customer',
        metadata: { userId: user._id, isFromRecovery },
    });

    return toPublicUser(user);
};

export const deleteUser = async (params: DeleteUserParams): Promise<PublicUser> => {
    const { id, authUser } = params;

    assertAdmin(authUser);

    if (authUser.id === id) {
        throw new err.ForbiddenError('Administrators cannot deactivate their own account');
    }

    const user = await UserModel.findById(id).exec();

    if (!user) {
        throw new err.NotFoundError('User not found');
    }

    if (!user.active) {
        throw new err.ConflictError('User is already inactive');
    }

    if (user.role === 'admin') {
        const activeAdminCount = await UserModel.countDocuments({
            role: 'admin',
            active: true,
        }).exec();

        if (activeAdminCount <= 1) {
            throw new err.ForbiddenError('The last active administrator cannot be deactivated');
        }
    }

    user.active = false;

    await user.save();
    await createLog({
        message: `User ${user.email} was deactivated by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { userId: user._id },
    });

    return toPublicUser(user);
};

export const activateUser = async (params: ActivateUserParams): Promise<PublicUser> => {
    const { id, authUser } = params;

    assertAdmin(authUser);

    const user = await UserModel.findById(id).exec();

    if (!user) {
        throw new err.NotFoundError('User not found');
    }

    if (user.active) {
        throw new err.ConflictError('User is already active');
    }

    user.active = true;

    await user.save();
    await createLog({
        message: `User ${user.email} was activated by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { userId: user._id },
    });

    return toPublicUser(user);
};
