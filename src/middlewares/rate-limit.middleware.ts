import type { RequestHandler } from 'express';
import type { Options } from 'express-rate-limit';

import { rateLimit } from 'express-rate-limit';

import config from '@lib/config';

const createRateLimitHandler =
    (message: string): Options['handler'] =>
    (_req, res, _next, options) => {
        res.status(options.statusCode).json({
            success: false,
            message,
        });
    };

const createLimiter = (limit: number, message: string): RequestHandler => {
    return rateLimit({
        windowMs: config.rateLimit.windowMs,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message,
        handler: createRateLimitHandler(message),
    });
};

export const apiRateLimiter = createLimiter(
    config.rateLimit.apiMax,
    'Too many requests, please try again later',
);

export const authRateLimiter = createLimiter(
    config.rateLimit.authMax,
    'Too many authentication attempts, please try again later',
);

export const publicWriteRateLimiter = createLimiter(
    config.rateLimit.publicWriteMax,
    'Too many submissions, please try again later',
);
