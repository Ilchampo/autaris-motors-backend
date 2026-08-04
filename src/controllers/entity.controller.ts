import type {
    CreateEntityParams,
    EntityType,
    IEntityChild,
    UpdateEntityParams,
} from '@interfaces/entity.interface';

import { controller } from '@utils/controller.util';
import { BadRequestError } from '@utils/errors.util';
import { getAuthUser, getParam } from '@utils/request.util';

import * as entityService from '@services/entity.service';

export const getEntities = controller(async (req) => {
    const type = req.query['type'] as EntityType | undefined;
    const options: Parameters<typeof entityService.getEntities>[0] = {
        active: true,
        includeDeleted: false,
    };

    if (type !== undefined) {
        options.type = type;
    }

    const data = await entityService.getEntities(options);

    return { data };
});

export const getEntityById = controller(async (req) => {
    const id = getParam(req, 'id');
    const data = await entityService.getEntityById(id, { activeOnly: true });

    return { data };
});

export const getManagedEntities = controller(async (req) => {
    const type = req.query['type'] as EntityType | undefined;
    const active = req.query['active'] as boolean | undefined;
    const options: Parameters<typeof entityService.getEntities>[0] = {
        includeDeleted: false,
    };

    if (type !== undefined) {
        options.type = type;
    }

    if (active !== undefined) {
        options.active = active;
    }

    const data = await entityService.getEntities(options);

    return { data };
});

export const createEntity = controller(async (req) => {
    const authUser = getAuthUser(req);
    const { type, name, order, children, metadata } = req.body as {
        type: CreateEntityParams['type'];
        name: string;
        order?: number;
        children?: IEntityChild[];
        metadata?: Record<string, string> | null;
    };

    const params: CreateEntityParams = {
        type,
        name,
        authUser,
    };

    if (order !== undefined) {
        params.order = order;
    }

    if (children !== undefined) {
        params.children = children;
    }

    if (metadata !== undefined) {
        params.metadata = metadata;
    }

    if (req.file) {
        params.imageBuffer = req.file.buffer;
    }

    const data = await entityService.createEntity(params);

    return { statusCode: 201, data };
});

export const updateEntity = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const { name, order, children, metadata, removeImage } = req.body as {
        name?: string;
        order?: number;
        children?: IEntityChild[];
        metadata?: Record<string, string> | null;
        removeImage?: boolean;
    };

    const hasUpdates =
        name !== undefined ||
        order !== undefined ||
        children !== undefined ||
        metadata !== undefined ||
        removeImage !== undefined ||
        Boolean(req.file);

    if (!hasUpdates) {
        throw new BadRequestError('At least one field must be provided');
    }

    const params: UpdateEntityParams = { id, authUser };

    if (name !== undefined) {
        params.name = name;
    }

    if (order !== undefined) {
        params.order = order;
    }

    if (children !== undefined) {
        params.children = children;
    }

    if (metadata !== undefined) {
        params.metadata = metadata;
    }

    if (removeImage !== undefined) {
        params.removeImage = removeImage;
    }

    if (req.file) {
        params.imageBuffer = req.file.buffer;
    }

    const data = await entityService.updateEntity(params);

    return { data };
});

export const activateEntity = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const data = await entityService.activateEntity({ id, authUser });

    return { data };
});

export const deactivateEntity = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const data = await entityService.deactivateEntity({ id, authUser });

    return { data };
});

export const deleteEntity = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const data = await entityService.deleteEntity({ id, authUser });

    return { data };
});
