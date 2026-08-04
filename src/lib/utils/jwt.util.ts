import type { SignOptions } from 'jsonwebtoken';
import type { Role } from '@interfaces/user.interface';

import jwt from 'jsonwebtoken';
import config from '@lib/config';

export interface JwtPayload {
    id: string;
    email: string;
    role: Role;
}

export const signToken = (payload: JwtPayload): string => {
    const options: SignOptions = {
        expiresIn: config.jwt.expiresIn as NonNullable<SignOptions['expiresIn']>,
    };

    return jwt.sign(payload, config.jwt.secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
    const decoded = jwt.verify(token, config.jwt.secret);

    if (typeof decoded === 'string') {
        throw new Error('Invalid token payload');
    }

    const { id, email, role } = decoded as JwtPayload;

    if (!id || !email || !role) {
        throw new Error('Invalid token payload');
    }

    return { id, email, role };
};
