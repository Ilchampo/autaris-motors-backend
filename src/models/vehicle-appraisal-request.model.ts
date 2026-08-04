import type { HydratedDocument, Model } from 'mongoose';
import type { IVehicleAppraisalRequest } from '@interfaces/vehicle-appraisal-request.interface';

import { Schema, model } from 'mongoose';
import {
    APPRAISAL_NOTES_MAX_LENGTH,
    EMAIL_REGEX,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PHONE_MAX_LENGTH,
    PHONE_MIN_LENGTH,
    VEHICLE_COLOR_MAX_LENGTH,
    VEHICLE_MILEAGE_MAX,
    VEHICLE_MILEAGE_MIN,
    VEHICLE_PRICE_MIN,
    VEHICLE_YEAR_MIN,
} from '@constants/validation.constant';
import { PREFERRED_CONTACT_SCHEDULES } from '@interfaces/vehicle-appraisal-request.interface';

const vehicleAppraisalRequestSchema = new Schema<IVehicleAppraisalRequest>(
    {
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
        year: {
            type: Number,
            required: true,
            min: VEHICLE_YEAR_MIN,
            validate: {
                validator(value: number): boolean {
                    return value <= new Date().getUTCFullYear();
                },
                message: 'Year cannot be greater than the current year',
            },
        },
        kilometers: {
            type: Number,
            required: true,
            min: VEHICLE_MILEAGE_MIN,
            max: VEHICLE_MILEAGE_MAX,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        transmission: {
            type: String,
            required: true,
            trim: true,
        },
        fuelType: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: VEHICLE_COLOR_MAX_LENGTH,
        },
        expectedPrice: {
            type: Number,
            required: true,
            min: [VEHICLE_PRICE_MIN, 'Expected price must be greater than zero'],
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: NAME_MIN_LENGTH,
            maxlength: NAME_MAX_LENGTH,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: NAME_MIN_LENGTH,
            maxlength: NAME_MAX_LENGTH,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [EMAIL_REGEX, 'Invalid email address'],
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            minlength: PHONE_MIN_LENGTH,
            maxlength: PHONE_MAX_LENGTH,
        },
        preferredContactSchedule: {
            type: String,
            enum: PREFERRED_CONTACT_SCHEDULES,
            required: true,
        },
        notes: {
            type: String,
            default: null,
            trim: true,
            maxlength: APPRAISAL_NOTES_MAX_LENGTH,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    },
);

vehicleAppraisalRequestSchema.index({ createdAt: -1 });
vehicleAppraisalRequestSchema.index({ email: 1, createdAt: -1 });

export type VehicleAppraisalRequestDocument = HydratedDocument<IVehicleAppraisalRequest>;
export type VehicleAppraisalRequestModelType = Model<IVehicleAppraisalRequest>;

export const VehicleAppraisalRequestModel = model<IVehicleAppraisalRequest>(
    'VehicleAppraisalRequest',
    vehicleAppraisalRequestSchema,
);
