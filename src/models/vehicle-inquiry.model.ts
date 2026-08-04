import type { HydratedDocument, Model } from 'mongoose';
import type { IVehicleInquiry } from '@interfaces/vehicle-inquiry.interface';

import { Schema, model } from 'mongoose';
import { VEHICLE_TITLE_MAX_LENGTH, VEHICLE_TITLE_MIN_LENGTH } from '@constants/validation.constant';

const vehicleInquirySchema = new Schema<IVehicleInquiry>(
    {
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        vehicleTitle: {
            type: String,
            required: true,
            trim: true,
            minlength: VEHICLE_TITLE_MIN_LENGTH,
            maxlength: VEHICLE_TITLE_MAX_LENGTH,
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        model: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    },
);

vehicleInquirySchema.index({ vehicleId: 1, createdAt: -1 });
vehicleInquirySchema.index({ brand: 1, model: 1, createdAt: -1 });
vehicleInquirySchema.index({ userId: 1, createdAt: -1 });

export type VehicleInquiryDocument = HydratedDocument<IVehicleInquiry>;
export type VehicleInquiryModelType = Model<IVehicleInquiry>;

export const VehicleInquiryModel = model<IVehicleInquiry>('VehicleInquiry', vehicleInquirySchema);
