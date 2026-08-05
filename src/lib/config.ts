import type { Config } from '@lib/interfaces/config.interface';

import dotenv from 'dotenv';

dotenv.config();

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
    const parsed = parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseTrustProxy = (value: string | undefined): boolean | number => {
    if (!value || value === 'false') {
        return false;
    }

    if (value === 'true') {
        return true;
    }

    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : false;
};

const parseWhitelist = (value: string | undefined): string[] => {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
};

const config: Config = {
    app: {
        port: parsePositiveInt(process.env['PORT'], 3000),
        env: process.env['NODE_ENV'] ?? 'development',
        frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
        trustProxy: parseTrustProxy(process.env['TRUST_PROXY']),
    },
    cors: {
        whitelist: parseWhitelist(process.env['CORS_WHITELIST']),
    },
    rateLimit: {
        windowMs: parsePositiveInt(process.env['RATE_LIMIT_WINDOW_MS'], 15 * 60 * 1000),
        apiMax: parsePositiveInt(process.env['RATE_LIMIT_API_MAX'], 300),
        authMax: parsePositiveInt(process.env['RATE_LIMIT_AUTH_MAX'], 20),
        publicWriteMax: parsePositiveInt(process.env['RATE_LIMIT_PUBLIC_WRITE_MAX'], 30),
    },
    cloudinary: {
        cloudName: process.env['CLOUDINARY_CLOUD_NAME'] ?? '',
        apiKey: process.env['CLOUDINARY_API_KEY'] ?? '',
        apiSecret: process.env['CLOUDINARY_API_SECRET'] ?? '',
        transformationName: process.env['CLOUDINARY_TRANSFORMATION_NAME'] ?? '',
    },
    mongo: {
        uri: process.env['MONGO_URI'] ?? '',
        dbName: process.env['MONGO_DB_NAME'] ?? '',
    },
    jwt: {
        secret: process.env['JWT_SECRET'] ?? '',
        expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
    },
    resend: {
        apiKey: process.env['RESEND_API_KEY'] ?? '',
        maxRetries: parsePositiveInt(process.env['RESEND_MAX_RETRIES'], 3),
        retryDelay: parsePositiveInt(process.env['RESEND_RETRY_DELAY'], 1000),
        fromEmail: process.env['RESEND_FROM_EMAIL'] ?? '',
    },
};

export default config;
