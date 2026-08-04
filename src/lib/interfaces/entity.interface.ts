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
