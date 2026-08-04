import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Role } from '@interfaces/user.interface';

import { getUserById } from '@services/user.service';
import { ForbiddenError, UnauthorizedError } from '@utils/errors.util';
import { verifyToken } from '@utils/jwt.util';

import '@interfaces/express.interface';

const getBearerToken = (req: Request): string => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = header.slice('Bearer '.length).trim();

    if (!token) {
        throw new UnauthorizedError('Missing or invalid authorization header');
    }

    return token;
};

export const authenticate: RequestHandler = async (
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const token = getBearerToken(req);
        const payload = verifyToken(token);
        const user = await getUserById(payload.id, { activeOnly: true });

        if (!user) {
            throw new UnauthorizedError('Invalid or inactive user');
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
            next(error);
            return;
        }

        next(new UnauthorizedError('Invalid or expired token'));
    }
};

export const authorize =
    (...roles: Role[]): RequestHandler =>
    (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(new UnauthorizedError('Authentication required'));
            return;
        }

        if (!roles.includes(req.user.role)) {
            next(new ForbiddenError('You do not have permission to perform this action'));
            return;
        }

        next();
    };
