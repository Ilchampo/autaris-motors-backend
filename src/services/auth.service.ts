import type { AuthResponse, LoginParams, RegisterParams } from '@interfaces/auth.interface';
import type { PublicUser } from '@interfaces/user.interface';

import { UserModel } from '@models/user.model';
import { createLog } from '@services/log.service';
import { sendEmail } from '@services/mailing.service';
import { getUserByEmail } from '@services/user.service';
import { ConflictError, UnauthorizedError } from '@utils/errors.util';
import { signToken } from '@utils/jwt.util';
import { comparePassword, hashPassword } from '@utils/password.util';

const toPublicUser = (user: {
    toObject: () => PublicUser & { passwordHash?: string };
}): PublicUser => {
    const publicUser = user.toObject();
    delete (publicUser as Partial<typeof publicUser>).passwordHash;
    return publicUser as PublicUser;
};

export const register = async (params: RegisterParams): Promise<AuthResponse> => {
    const { firstName, lastName, email, phone, password } = params;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    const [existingByEmail, existingByPhone] = await Promise.all([
        UserModel.findOne({ email: normalizedEmail }).exec(),
        UserModel.findOne({ phone: normalizedPhone }).exec(),
    ]);

    if (existingByEmail) {
        throw new ConflictError(
            existingByEmail.active
                ? 'A user with this email already exists'
                : 'A user with this email already exists but is inactive',
        );
    }

    if (existingByPhone) {
        throw new ConflictError(
            existingByPhone.active
                ? 'A user with this phone already exists'
                : 'A user with this phone already exists but is inactive',
        );
    }

    const passwordHash = await hashPassword(password);

    const user = await UserModel.create({
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        role: 'client',
        passwordHash,
        active: true,
        mustChangePassword: false,
    });

    const publicUser = toPublicUser(user);
    const token = signToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    await createLog({
        message: `User ${user.email} registered`,
        actorId: user._id,
        type: 'customer',
        metadata: { userId: user._id },
    });

    return { token, user: publicUser };
};

export const login = async (params: LoginParams): Promise<AuthResponse> => {
    const { email, password } = params;

    const user = await UserModel.findOne({
        email: email.toLowerCase().trim(),
        active: true,
    })
        .select('+passwordHash')
        .exec();

    if (!user) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const publicUser = toPublicUser(user);
    const token = signToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    return { token, user: publicUser };
};

export const requestPasswordRecovery = async (email: string): Promise<void> => {
    const user = await getUserByEmail(email, { activeOnly: true });

    // Identical response whether the account exists or not (VR-007).
    if (!user) {
        return;
    }

    // Temporary recovery link placeholder until recovery tokens are implemented.
    const resetUrl = `${process.env['APP_URL'] ?? 'http://localhost:3000'}/reset-password?email=${encodeURIComponent(user.email)}`;

    await sendEmail(user.email, 'password-recovery', {
        firstName: user.firstName,
        email: user.email,
        resetUrl,
    });
};
