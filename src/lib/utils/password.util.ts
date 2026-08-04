import { randomBytes } from 'node:crypto';

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12 as const;

export const hashPassword = async (password: string): Promise<string> =>
    bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = async (password: string, passwordHash: string): Promise<boolean> =>
    bcrypt.compare(password, passwordHash);

export const generatePassword = (): string =>
    `${randomBytes(9).toString('base64url').slice(0, 10)}!`;
