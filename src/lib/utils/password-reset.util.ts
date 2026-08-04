import { createHash, randomBytes } from 'node:crypto';

import { PASSWORD_RESET_TOKEN_BYTES } from '@constants/auth.constant';

export const generatePasswordResetToken = (): { token: string; tokenHash: string } => {
    const token = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');
    const tokenHash = hashPasswordResetToken(token);

    return { token, tokenHash };
};

export const hashPasswordResetToken = (token: string): string =>
    createHash('sha256').update(token).digest('hex');
