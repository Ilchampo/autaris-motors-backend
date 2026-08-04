import type { Types } from 'mongoose';
import type { AuthUser } from '@interfaces/user.interface';

export interface IVehicleInquiry {
    vehicleId: Types.ObjectId;
    userId: Types.ObjectId | null;
    vehicleTitle: string;
    brand: string;
    model: string;
    createdAt: Date;
}

export type VehicleInquiryResponse = IVehicleInquiry & {
    _id: Types.ObjectId;
};

export interface CreateVehicleInquiryParams {
    vehicleId: string;
    authUser?: AuthUser;
}

export interface CreateVehicleInquiryResult {
    inquiry: VehicleInquiryResponse;
    whatsappUrl: string;
}

export interface VehicleInquiryFilters {
    vehicleId?: string;
    userId?: string;
    brand?: string;
    model?: string;
}

export interface PaginatedVehicleInquiries {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: VehicleInquiryResponse[];
}
