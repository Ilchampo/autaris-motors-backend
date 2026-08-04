import type { LogFilters, LogSortOption, LogType } from '@interfaces/log.interface';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@constants/pagination.constant';
import { LOG_TYPES } from '@interfaces/log.interface';
import { controller } from '@utils/controller.util';
import { getParam, getQueryNumber } from '@utils/request.util';

import * as logService from '@services/log.service';

const isLogType = (value: string): value is LogType => {
    return (LOG_TYPES as readonly string[]).includes(value);
};

export const getLogs = controller(async (req) => {
    const page = getQueryNumber(req, 'page', DEFAULT_PAGE);
    const pageSize = getQueryNumber(req, 'pageSize', DEFAULT_PAGE_SIZE);
    const sort = (req.query['sort'] as LogSortOption | undefined) ?? 'createdNewest';
    const filters: LogFilters = {};

    if (typeof req.query['type'] === 'string' && isLogType(req.query['type'])) {
        filters.type = req.query['type'];
    }

    if (typeof req.query['search'] === 'string') {
        filters.search = req.query['search'];
    }

    if (typeof req.query['actorId'] === 'string') {
        filters.actorId = req.query['actorId'];
    }

    const data = await logService.getLogs(filters, { page, pageSize, sort });
    return { data };
});

export const getLogById = controller(async (req) => {
    const id = getParam(req, 'id');
    const data = await logService.getLogById(id);
    return { data };
});
