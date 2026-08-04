import type { Types } from 'mongoose';
import type { AuthUser } from '@interfaces/user.interface';

export const VEHICLE_STATUSES = ['draft', 'published', 'sold', 'deleted'] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const CATALOG_SORT_OPTIONS = [
    'featuredFirst',
    'newest',
    'priceAsc',
    'priceDesc',
    'yearAsc',
    'yearDesc',
    'mileageAsc',
    'mileageDesc',
] as const;

export type CatalogSortOption = (typeof CATALOG_SORT_OPTIONS)[number];

export const MANAGE_SORT_OPTIONS = [
    'createdNewest',
    'createdOldest',
    'priceAsc',
    'priceDesc',
] as const;

export type ManageSortOption = (typeof MANAGE_SORT_OPTIONS)[number];

export interface IVehicleImage {
    id: string;
    url: string;
    isPrimary: boolean;
    order: number;
}

export interface IVehicle {
    title: string;
    featured: boolean;
    featuredAt: Date | null;
    price: number;
    sellingPrice: number | null;
    brand: string;
    model: string;
    year: number;
    city: string;
    vehicleType: string;
    fuelType: string;
    transmission: string;
    kilometers: number;
    plateInitial: string;
    plateLastNumber: number;
    engine: string;
    color: string;
    description: string | null;
    paymentMethods: string[];
    images: IVehicleImage[];
    status: VehicleStatus;
    publishedAt: Date | null;
    soldAt: Date | null;
    deletedAt: Date | null;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type VehicleResponse = Omit<IVehicle, 'createdBy'> & {
    _id: Types.ObjectId;
    createdBy: Types.ObjectId | string;
};

export interface VehicleCatalogFilters {
    title?: string;
    brand?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    transmission?: string;
    fuelType?: string;
    vehicleType?: string;
    city?: string;
    minMileage?: number;
    maxMileage?: number;
    plateLastNumber?: number;
}

export interface VehicleManageFilters {
    title?: string;
    brand?: string;
    city?: string;
    status?: VehicleStatus;
}

export interface PaginatedVehicles {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: VehicleResponse[];
}

export interface CreateVehicleParams {
    authUser: AuthUser;
    title?: string;
    featured?: boolean;
    price: number;
    brand: string;
    model: string;
    year: number;
    city: string;
    vehicleType: string;
    fuelType: string;
    transmission: string;
    kilometers: number;
    plateInitial: string;
    plateLastNumber: number;
    engine: string;
    color: string;
    description?: string | null;
    paymentMethods?: string[];
    status: 'draft' | 'published';
    imageBuffers?: Buffer[];
    primaryImageIndex?: number;
}

export interface UpdateVehicleParams {
    id: string;
    authUser: AuthUser;
    title?: string;
    featured?: boolean;
    price?: number;
    brand?: string;
    model?: string;
    year?: number;
    city?: string;
    vehicleType?: string;
    fuelType?: string;
    transmission?: string;
    kilometers?: number;
    plateInitial?: string;
    plateLastNumber?: number;
    engine?: string;
    color?: string;
    description?: string | null;
    paymentMethods?: string[];
    imageBuffers?: Buffer[];
    primaryImageIndex?: number;
}

export interface MarkVehicleAsSoldParams {
    id: string;
    authUser: AuthUser;
    sellingPrice: number;
    saleDate: Date;
    advisorId?: string;
    notes?: string | null;
}
