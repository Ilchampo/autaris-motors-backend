import type { HydratedDocument, Model } from 'mongoose';
import type { ILog } from '@interfaces/log.interface';

import { Schema, model } from 'mongoose';
import { LOG_TYPES } from '@interfaces/log.interface';

const IMMUTABLE_LOG_ERROR = 'Logs are immutable and cannot be modified or deleted';

const logSchema = new Schema<ILog>(
    {
        type: {
            type: String,
            enum: LOG_TYPES,
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
        },
        actorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    },
);

logSchema.pre(
    ['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne', 'findOneAndReplace'],
    function () {
        throw new Error(IMMUTABLE_LOG_ERROR);
    },
);

logSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], function () {
    throw new Error(IMMUTABLE_LOG_ERROR);
});

logSchema.pre('save', function () {
    if (!this.isNew) {
        throw new Error(IMMUTABLE_LOG_ERROR);
    }
});

logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ actorId: 1, createdAt: -1 });
logSchema.index({ message: 'text' });

export type LogDocument = HydratedDocument<ILog>;
export type LogModelType = Model<ILog>;

export const LogModel = model<ILog>('Log', logSchema);
