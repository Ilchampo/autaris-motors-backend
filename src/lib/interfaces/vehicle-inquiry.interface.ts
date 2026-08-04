import type { Types } from 'mongoose';

export interface IVehicleInquiry {
    vehicleId: Types.ObjectId;
    userId: Types.ObjectId | null;
    vehicleTitle: string;
    brand: string;
    model: string;
    createdAt: Date;
}
