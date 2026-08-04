import type { Types } from 'mongoose';

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
