import type { Types } from 'mongoose';
import type { AuthUser } from '@interfaces/user.interface';

export const ENTITY_TYPES = [
    'brand',
    'city',
    'vehicleType',
    'fuelType',
    'transmission',
    'paymentMethod',
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export interface IEntityChild {
    name: string;
    active: boolean;
}

export interface IEntity {
    type: EntityType;
    name: string;
    slug: string;
    order: number;
    active: boolean;
    deletedAt: Date | null;
    imageUrl: string | null;
    children: IEntityChild[];
    metadata: Record<string, string> | null;
    createdAt: Date;
    updatedAt: Date;
}

export type EntityResponse = IEntity & {
    _id: Types.ObjectId;
};

export interface CreateEntityParams {
    type: EntityType;
    name: string;
    order?: number;
    children?: IEntityChild[];
    metadata?: Record<string, string> | null;
    imageBuffer?: Buffer;
    authUser: AuthUser;
}

export interface UpdateEntityParams {
    id: string;
    authUser: AuthUser;
    name?: string;
    order?: number;
    children?: IEntityChild[];
    metadata?: Record<string, string> | null;
    imageBuffer?: Buffer;
    removeImage?: boolean;
}

export interface EntityIdParams {
    id: string;
    authUser: AuthUser;
}

export interface GetEntitiesOptions {
    type?: EntityType;
    active?: boolean;
    includeDeleted?: boolean;
}
