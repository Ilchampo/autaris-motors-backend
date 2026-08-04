import type {
    AuthResponse,
    LoginParams,
    RegisterParams,
    ResetPasswordParams,
} from '@interfaces/auth.interface';
import type { PublicUser } from '@interfaces/user.interface';
import type { UserDocument } from '@models/user.model';

import { PASSWORD_RESET_TOKEN_TTL_MS } from '@constants/auth.constant';
import { UserModel } from '@models/user.model';
import { createLog } from '@services/log.service';
import { sendEmail } from '@services/mailing.service';
import { BadRequestError, ConflictError, UnauthorizedError } from '@utils/errors.util';
import { signToken } from '@utils/jwt.util';
import { generatePasswordResetToken, hashPasswordResetToken } from '@utils/password-reset.util';
import { comparePassword, hashPassword } from '@utils/password.util';

import config from '@lib/config';

const toPublicUser = (user: UserDocument): PublicUser => {
    const publicUser = user.toObject();
    delete (publicUser as Partial<typeof publicUser>).passwordHash;
    delete (publicUser as Partial<typeof publicUser>).passwordResetTokenHash;
    delete (publicUser as Partial<typeof publicUser>).passwordResetExpiresAt;
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
    const normalizedEmail = email.toLowerCase().trim();

    const user = await UserModel.findOne({
        email: normalizedEmail,
        active: true,
    }).exec();

    if (!user) {
        return;
    }

    const { token, tokenHash } = generatePasswordResetToken();

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = new URL('/reset-password', config.app.frontendUrl);
    resetUrl.searchParams.set('token', token);

    await sendEmail(user.email, 'password-recovery', {
        firstName: user.firstName,
        email: user.email,
        resetUrl: resetUrl.toString(),
    });
};

export const resetPassword = async (params: ResetPasswordParams): Promise<PublicUser> => {
    const { token, password } = params;
    const tokenHash = hashPasswordResetToken(token);

    const user = await UserModel.findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
        active: true,
    })
        .select('+passwordHash +passwordResetTokenHash')
        .exec();

    if (!user) {
        throw new BadRequestError('Invalid or expired recovery token');
    }

    user.passwordHash = await hashPassword(password);
    user.mustChangePassword = false;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    await user.save();

    await createLog({
        message: `User ${user.email} recovered their password`,
        actorId: user._id,
        type: 'customer',
        metadata: { userId: user._id, isFromRecovery: true },
    });

    return toPublicUser(user);
};
