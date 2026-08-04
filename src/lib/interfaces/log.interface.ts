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

export interface CreateLogParams {
    message: string;
    type?: LogType;
    actorId?: string | Types.ObjectId | null;
    metadata?: Record<string, unknown> | null;
}

export type LogResponse = Omit<ILog, 'actorId'> & {
    _id: Types.ObjectId;
    actorId: Types.ObjectId | null;
};

export const LOG_SORT_OPTIONS = ['createdNewest', 'createdOldest'] as const;

export type LogSortOption = (typeof LOG_SORT_OPTIONS)[number];

export interface LogFilters {
    type?: LogType;
    search?: string;
    actorId?: string;
}

export interface PaginatedLogs {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: LogResponse[];
}
