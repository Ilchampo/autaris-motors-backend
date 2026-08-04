import type { Types } from 'mongoose';

export const VEHICLE_STATUSES = ['draft', 'published', 'sold', 'deleted'] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

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
