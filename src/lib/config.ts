import type { Config } from '@lib/interfaces/config.interface';

import dotenv from 'dotenv';

dotenv.config();

const config: Config = {
    app: {
        port: parseInt(process.env['PORT'] ?? '3000'),
        env: process.env['NODE_ENV'] ?? 'development',
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
};

export default config;
