import type { LogDocument } from '@models/log.model';
import type {
    CreateLogParams,
    LogFilters,
    LogResponse,
    LogSortOption,
    PaginatedLogs,
} from '@interfaces/log.interface';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@constants/pagination.constant';
import { LogModel } from '@models/log.model';
import { NotFoundError } from '@utils/errors.util';

const toLogResponse = (log: LogDocument): LogResponse => {
    return log.toObject() as LogResponse;
};

export const createLog = async (params: CreateLogParams): Promise<void> => {
    const { message, type = 'system', actorId = null, metadata = null } = params;

    await LogModel.create({
        type,
        message,
        actorId,
        metadata,
    });
};

export const getLogs = async (
    filters: LogFilters = {},
    options: { page?: number; pageSize?: number; sort?: LogSortOption } = {},
): Promise<PaginatedLogs> => {
    const page = Math.max(options.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.max(options.pageSize ?? DEFAULT_PAGE_SIZE, 1);
    const skip = (page - 1) * pageSize;
    const sort = options.sort ?? 'createdNewest';
    const query: Record<string, unknown> = {};

    if (filters.type) {
        query['type'] = filters.type;
    }

    if (filters.actorId) {
        query['actorId'] = filters.actorId;
    }

    if (filters.search?.trim()) {
        query['$text'] = { $search: filters.search.trim() };
    }

    const sortQuery: Record<string, 1 | -1> =
        sort === 'createdOldest' ? { createdAt: 1 } : { createdAt: -1 };

    const [logs, totalItems] = await Promise.all([
        LogModel.find(query).sort(sortQuery).skip(skip).limit(pageSize).exec(),
        LogModel.countDocuments(query).exec(),
    ]);

    return {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 0,
        items: logs.map(toLogResponse),
    };
};

export const getLogById = async (id: string): Promise<LogResponse> => {
    const log = await LogModel.findById(id).exec();

    if (!log) {
        throw new NotFoundError('Log not found');
    }

    return toLogResponse(log);
};
