import type { Connection } from 'mongoose';

import mongoose from 'mongoose';
import config from '@lib/config';

class MongooseInstance {
    private static instance: MongooseInstance | null = null;
    private connectionPromise: Promise<typeof mongoose> | null = null;
    private constructor() {}

    static getInstance(): MongooseInstance {
        MongooseInstance.instance ??= new MongooseInstance();

        return MongooseInstance.instance;
    }

    get connection(): Connection {
        return mongoose.connection;
    }

    get isConnected(): boolean {
        return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
    }

    async connect(): Promise<void> {
        this.connectionPromise ??= mongoose.connect(config.mongo.uri, {
            dbName: config.mongo.dbName,
        });

        await this.connectionPromise;

        console.log('---------------------------------------------');
        console.log(`MongoDB connected: ${this.connection.host}/${this.connection.name}`);
        console.log('---------------------------------------------');
    }

    async disconnect(): Promise<void> {
        if (!this.connectionPromise) {
            return;
        }

        this.connectionPromise = null;

        await mongoose.disconnect();

        console.log('---------------------------------------------');
        console.log('MongoDB disconnected');
        console.log('---------------------------------------------');
    }
}

export const mongooseInstance = MongooseInstance.getInstance();
