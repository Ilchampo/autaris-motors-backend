import type { CorsOptions } from 'cors';

import { ForbiddenError } from '@utils/errors.util';

import cors from 'cors';
import config from '@lib/config';

const buildAllowedOrigins = (): Set<string> => {
    const origins = new Set<string>(config.cors.whitelist);

    if (config.app.frontendUrl) {
        origins.add(config.app.frontendUrl);
    }

    return origins;
};

const allowedOrigins = buildAllowedOrigins();

const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (!origin) {
            callback(null, true);
            return;
        }

        if (allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }

        callback(new ForbiddenError('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['RateLimit', 'RateLimit-Policy', 'Retry-After'],
    maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);
