import type { Types } from 'mongoose';
import type { AuthUser } from '@interfaces/user.interface';

export const SALE_STATUSES = ['active', 'cancelled'] as const;

export type SaleStatus = (typeof SALE_STATUSES)[number];

export interface ISale {
    vehicleId: Types.ObjectId;
    advisorId: Types.ObjectId;
    sellingPrice: number;
    saleDate: Date;
    notes: string | null;
    status: SaleStatus;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

export type SaleResponse = ISale & {
    _id: Types.ObjectId;
};

export interface CreateSaleParams {
    vehicleId: string;
    authUser: AuthUser;
    sellingPrice: number;
    saleDate: Date;
    advisorId?: string;
    notes?: string | null;
}

export interface UpdateSaleParams {
    id: string;
    authUser: AuthUser;
    sellingPrice?: number;
    saleDate?: Date;
    advisorId?: string;
    notes?: string | null;
}

export interface CancelSaleParams {
    id: string;
    authUser: AuthUser;
}

export interface SaleFilters {
    status?: SaleStatus;
    vehicleId?: string;
    advisorId?: string;
}

export interface PaginatedSales {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: SaleResponse[];
}
