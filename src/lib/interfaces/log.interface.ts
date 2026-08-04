import type { Types } from 'mongoose';

export const LOG_TYPES = ['system', 'customer'] as const;

export type LogType = (typeof LOG_TYPES)[number];

export interface ILog {
    type: LogType;
    message: string;
    actorId: Types.ObjectId | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
