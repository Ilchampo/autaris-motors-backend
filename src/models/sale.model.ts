import type { HydratedDocument, Model } from 'mongoose';
import type { ISale } from '@interfaces/sale.interface';

import { Schema, model } from 'mongoose';
import {
    SALE_NOTES_MAX_LENGTH,
    VEHICLE_PRICE_MAX,
    VEHICLE_PRICE_MIN,
} from '@constants/validation.constant';
import { SALE_STATUSES } from '@interfaces/sale.interface';

const saleSchema = new Schema<ISale>(
    {
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        advisorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sellingPrice: {
            type: Number,
            required: true,
            min: [VEHICLE_PRICE_MIN, 'Selling price must be greater than zero'],
            max: VEHICLE_PRICE_MAX,
        },
        saleDate: {
            type: Date,
            required: true,
            validate: {
                validator(value: Date): boolean {
                    return value.getTime() <= Date.now();
                },
                message: 'Sale date cannot be in the future',
            },
        },
        notes: {
            type: String,
            default: null,
            trim: true,
            maxlength: SALE_NOTES_MAX_LENGTH,
        },
        status: {
            type: String,
            enum: SALE_STATUSES,
            required: true,
            default: 'active',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

saleSchema.index(
    { vehicleId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'active' },
    },
);

saleSchema.index({ advisorId: 1, saleDate: -1 });
saleSchema.index({ status: 1, saleDate: -1 });

export type SaleDocument = HydratedDocument<ISale>;
export type SaleModelType = Model<ISale>;

export const SaleModel = model<ISale>('Sale', saleSchema);
