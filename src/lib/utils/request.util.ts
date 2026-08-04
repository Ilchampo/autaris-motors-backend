import type { Request } from 'express';
import type { AuthUser } from '@interfaces/user.interface';

import { BadRequestError, UnauthorizedError } from '@utils/errors.util';

import '@interfaces/express.interface';

export const getAuthUser = (req: Request): AuthUser => {
    if (!req.user) {
        throw new UnauthorizedError('Authentication required');
    }

    return req.user;
};

export const getParam = (req: Request, name: string): string => {
    const value = req.params[name];

    if (typeof value !== 'string' || value.trim() === '') {
        throw new BadRequestError(`Missing path parameter: ${name}`);
    }

    return value;
};

export const getQueryNumber = (req: Request, name: string, fallback: number): number => {
    const value = req.query[name];

    if (value === undefined) {
        return fallback;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new BadRequestError(`Invalid query parameter: ${name}`);
    }

    return parsed;
};
