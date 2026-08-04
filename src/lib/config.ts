import type { Config } from '@lib/interfaces/config.interface';

import dotenv from 'dotenv';

dotenv.config();

const config: Config = {
    app: {
        port: parseInt(process.env['PORT'] ?? '3000'),
        env: process.env['NODE_ENV'] ?? 'development',
        frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
    },
    cors: {
        whitelist: process.env['CORS_WHITELIST']?.split(',') ?? [],
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
        maxRetries: parseInt(process.env['RESEND_MAX_RETRIES'] ?? '3'),
        retryDelay: parseInt(process.env['RESEND_RETRY_DELAY'] ?? '1000'),
        fromEmail: process.env['RESEND_FROM_EMAIL'] ?? '',
    },
};

export default config;
