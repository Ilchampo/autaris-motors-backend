import type { EntityDocument } from '@models/entity.model';
import type {
    CreateEntityParams,
    EntityIdParams,
    EntityResponse,
    GetEntitiesOptions,
    IEntityChild,
    UpdateEntityParams,
} from '@interfaces/entity.interface';

import cloudinary from '@instances/cloudinary.instance';
import { EntityModel } from '@models/entity.model';
import { createLog } from '@services/log.service';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '@utils/errors.util';
import { slugify } from '@utils/validation.util';

const BRAND_IMAGE_FOLDER = 'autaris-motors/entities/brands';

const toEntityResponse = (
    entity: EntityDocument,
    options: { activeChildrenOnly?: boolean } = {},
): EntityResponse => {
    const data = entity.toObject() as EntityResponse;

    if (options.activeChildrenOnly) {
        data.children = data.children.filter((child) => child.active);
    }

    if (data.metadata instanceof Map) {
        data.metadata = Object.fromEntries(data.metadata.entries());
    }

    return data;
};

const assertAdmin = (role: string): void => {
    if (role !== 'admin') {
        throw new ForbiddenError('Only administrators can manage entities');
    }
};

const findEntityOrThrow = async (
    id: string,
    options: { includeDeleted?: boolean } = {},
): Promise<EntityDocument> => {
    const query: Record<string, unknown> = { _id: id };

    if (!options.includeDeleted) {
        query['deletedAt'] = null;
    }

    const entity = await EntityModel.findOne(query).exec();

    if (!entity) {
        throw new NotFoundError('Entity not found');
    }

    return entity;
};

const uploadBrandImage = async (imageBuffer: Buffer): Promise<string> => {
    const result = await cloudinary.uploadImage(imageBuffer, {
        folder: BRAND_IMAGE_FOLDER,
    });

    return result.secure_url;
};

const deleteBrandImage = async (imageUrl: string | null): Promise<void> => {
    if (!imageUrl) {
        return;
    }

    try {
        await cloudinary.deleteFile(imageUrl, 'image');
    } catch (error) {
        console.error('Failed to delete entity image from Cloudinary:', error);
    }
};

const normalizeChildren = (children: IEntityChild[] | undefined, type: string): IEntityChild[] => {
    if (type !== 'brand') {
        if (children && children.length > 0) {
            throw new BadRequestError('Only Brand entities may contain child models');
        }

        return [];
    }

    return (children ?? []).map((child) => ({
        name: child.name.trim(),
        active: child.active,
    }));
};

const handleDuplicateKeyError = (error: unknown): never => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: number }).code === 11000
    ) {
        throw new ConflictError('An entity with this name or slug already exists for this type');
    }

    throw error;
};

export const getEntities = async (options: GetEntitiesOptions = {}): Promise<EntityResponse[]> => {
    const { type, active, includeDeleted = false } = options;
    const query: Record<string, unknown> = {};

    if (type) {
        query['type'] = type;
    }

    if (!includeDeleted) {
        query['deletedAt'] = null;
    }

    if (active !== undefined) {
        query['active'] = active;
    }

    const entities = await EntityModel.find(query).sort({ order: 1, name: 1 }).exec();

    return entities.map((entity) =>
        toEntityResponse(entity, { activeChildrenOnly: active === true }),
    );
};

export const getEntityById = async (
    id: string,
    options: { activeOnly?: boolean } = {},
): Promise<EntityResponse> => {
    const { activeOnly = true } = options;
    const entity = await findEntityOrThrow(id);

    if (activeOnly && !entity.active) {
        throw new NotFoundError('Entity not found');
    }

    return toEntityResponse(entity, { activeChildrenOnly: activeOnly });
};

export const createEntity = async (params: CreateEntityParams): Promise<EntityResponse> => {
    const { type, name, order = 0, children, metadata = null, imageBuffer, authUser } = params;

    assertAdmin(authUser.role);

    if (imageBuffer && type !== 'brand') {
        throw new BadRequestError('Only Brand entities may contain images');
    }

    const normalizedChildren = normalizeChildren(children, type);
    let imageUrl: string | null = null;

    if (imageBuffer) {
        imageUrl = await uploadBrandImage(imageBuffer);
    }

    try {
        const entity = await EntityModel.create({
            type,
            name: name.trim(),
            slug: slugify(name),
            order,
            active: true,
            deletedAt: null,
            imageUrl,
            children: normalizedChildren,
            metadata,
        });

        await createLog({
            message: `Entity ${entity.type}:${entity.name} was created by ${authUser.email}`,
            actorId: authUser.id,
            metadata: { entityId: entity._id, type: entity.type },
        });

        return toEntityResponse(entity);
    } catch (error) {
        if (imageUrl) {
            await deleteBrandImage(imageUrl);
        }

        return handleDuplicateKeyError(error);
    }
};

export const updateEntity = async (params: UpdateEntityParams): Promise<EntityResponse> => {
    const {
        id,
        authUser,
        name,
        order,
        children,
        metadata,
        imageBuffer,
        removeImage = false,
    } = params;

    assertAdmin(authUser.role);

    const entity = await findEntityOrThrow(id);
    const previousImageUrl = entity.imageUrl;

    if (imageBuffer && entity.type !== 'brand') {
        throw new BadRequestError('Only Brand entities may contain images');
    }

    if (removeImage && entity.type !== 'brand') {
        throw new BadRequestError('Only Brand entities may contain images');
    }

    if (name !== undefined) {
        entity.name = name.trim();
        entity.slug = slugify(name);
    }

    if (order !== undefined) {
        entity.order = order;
    }

    if (children !== undefined) {
        entity.children = normalizeChildren(children, entity.type);
    }

    if (metadata !== undefined) {
        entity.metadata = metadata;
    }

    if (imageBuffer) {
        entity.imageUrl = await uploadBrandImage(imageBuffer);
    } else if (removeImage) {
        entity.imageUrl = null;
    }

    try {
        await entity.save();
    } catch (error) {
        if (imageBuffer && entity.imageUrl && entity.imageUrl !== previousImageUrl) {
            await deleteBrandImage(entity.imageUrl);
        }

        handleDuplicateKeyError(error);
    }

    if ((imageBuffer || removeImage) && previousImageUrl && previousImageUrl !== entity.imageUrl) {
        await deleteBrandImage(previousImageUrl);
    }

    await createLog({
        message: `Entity ${entity.type}:${entity.name} was updated by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { entityId: entity._id, type: entity.type },
    });

    return toEntityResponse(entity);
};

export const activateEntity = async (params: EntityIdParams): Promise<EntityResponse> => {
    const { id, authUser } = params;

    assertAdmin(authUser.role);

    const entity = await findEntityOrThrow(id);

    if (entity.active) {
        throw new ConflictError('Entity is already active');
    }

    entity.active = true;
    await entity.save();

    await createLog({
        message: `Entity ${entity.type}:${entity.name} was activated by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { entityId: entity._id, type: entity.type },
    });

    return toEntityResponse(entity);
};

export const deactivateEntity = async (params: EntityIdParams): Promise<EntityResponse> => {
    const { id, authUser } = params;

    assertAdmin(authUser.role);

    const entity = await findEntityOrThrow(id);

    if (!entity.active) {
        throw new ConflictError('Entity is already inactive');
    }

    entity.active = false;
    await entity.save();

    await createLog({
        message: `Entity ${entity.type}:${entity.name} was deactivated by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { entityId: entity._id, type: entity.type },
    });

    return toEntityResponse(entity);
};

export const deleteEntity = async (params: EntityIdParams): Promise<EntityResponse> => {
    const { id, authUser } = params;

    assertAdmin(authUser.role);

    const entity = await findEntityOrThrow(id);

    entity.active = false;
    entity.deletedAt = new Date();
    await entity.save();

    await createLog({
        message: `Entity ${entity.type}:${entity.name} was deleted by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { entityId: entity._id, type: entity.type },
    });

    return toEntityResponse(entity);
};
