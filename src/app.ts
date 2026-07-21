import type { Application } from 'express';

import { mongooseInstance } from '@instances/mongoose.instance';

import cors from 'cors';
import express from 'express';
import config from '@lib/config';

const connectToMongoDB = async (): Promise<void> => {
    try {
        console.log('---------------------------------------------');
        console.log('Connecting to MongoDB...');
        console.log('---------------------------------------------');

        await mongooseInstance.connect();

        if (!mongooseInstance.isConnected) {
            throw new Error('MongoDB connection not established');
        }

        console.log('---------------------------------------------');
        console.log('MongoDB connection established');
        console.log('---------------------------------------------');
    } catch (error) {
        console.log('---------------------------------------------');
        console.log('Error connecting to MongoDB:', error);
        console.log('---------------------------------------------');

        process.exit(1);
    }
};

const createApp = async (): Promise<Application> => {
    const app = express();

    if (config.app.env === 'production') {
        app.use(
            cors({
                origin: (origin, callback) => {
                    if (!origin || config.cors.whitelist.includes(origin)) {
                        callback(null, true);
                        return;
                    }

                    callback(new Error('Not allowed by CORS'));
                },
                credentials: true,
            }),
        );
    }

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    await connectToMongoDB();

    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: config.app.env,
        });
    });

    return app;
};

export const startServer = async (): Promise<void> => {
    const app = await createApp();
    const port = config.app.port;

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`Environment: ${config.app.env}`);
        console.log(`Health check: http://localhost:${port}/health`);
    });
};
