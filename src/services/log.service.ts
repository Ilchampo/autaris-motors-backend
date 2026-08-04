import type { CreateLogParams } from '@interfaces/log.interface';

import { LogModel } from '@models/log.model';

export const createLog = async (params: CreateLogParams): Promise<void> => {
    const { message, type = 'system', actorId = null, metadata = null } = params;

    await LogModel.create({
        type,
        message,
        actorId,
        metadata,
    });
};
