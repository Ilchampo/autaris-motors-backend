import type { HydratedDocument, Model } from 'mongoose';
import type { IVehicle, IVehicleImage } from '@interfaces/vehicle.interface';

import { Schema, model } from 'mongoose';
import {
    PLATE_INITIAL_REGEX,
    PLATE_LAST_NUMBER_MAX,
    PLATE_LAST_NUMBER_MIN,
    VEHICLE_COLOR_MAX_LENGTH,
    VEHICLE_DESCRIPTION_MAX_LENGTH,
    VEHICLE_ENGINE_MAX_LENGTH,
    VEHICLE_IMAGES_MAX,
    VEHICLE_MILEAGE_MAX,
    VEHICLE_MILEAGE_MIN,
    VEHICLE_PRICE_MAX,
    VEHICLE_PRICE_MIN,
    VEHICLE_TITLE_MAX_LENGTH,
    VEHICLE_TITLE_MIN_LENGTH,
    VEHICLE_YEAR_MIN,
} from '@constants/validation.constant';
import { VEHICLE_STATUSES } from '@interfaces/vehicle.interface';

const vehicleImageSchema = new Schema<IVehicleImage>(
    {
        id: {
            type: String,
            required: true,
            trim: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
        isPrimary: {
            type: Boolean,
            required: true,
            default: false,
        },
        order: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false },
);

const vehicleSchema = new Schema<IVehicle>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: VEHICLE_TITLE_MIN_LENGTH,
            maxlength: VEHICLE_TITLE_MAX_LENGTH,
        },
        featured: {
            type: Boolean,
            required: true,
            default: false,
        },
        featuredAt: {
            type: Date,
            default: null,
        },
        price: {
            type: Number,
            required: true,
            min: VEHICLE_PRICE_MIN,
            max: VEHICLE_PRICE_MAX,
        },
        sellingPrice: {
            type: Number,
            default: null,
            validate: {
                validator(value: number | null): boolean {
                    if (value === null) {
                        return true;
                    }

                    return value >= VEHICLE_PRICE_MIN && value <= VEHICLE_PRICE_MAX;
                },
                message: `Selling price must be between ${VEHICLE_PRICE_MIN} and ${VEHICLE_PRICE_MAX}`,
            },
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
        city: {
            type: String,
            required: true,
            trim: true,
        },
        vehicleType: {
            type: String,
            required: true,
            trim: true,
        },
        fuelType: {
            type: String,
            required: true,
            trim: true,
        },
        transmission: {
            type: String,
            required: true,
            trim: true,
        },
        kilometers: {
            type: Number,
            required: true,
            min: VEHICLE_MILEAGE_MIN,
            max: VEHICLE_MILEAGE_MAX,
        },
        plateInitial: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            match: [PLATE_INITIAL_REGEX, 'Plate initial must be a single uppercase letter A–Z'],
        },
        plateLastNumber: {
            type: Number,
            required: true,
            min: PLATE_LAST_NUMBER_MIN,
            max: PLATE_LAST_NUMBER_MAX,
            validate: {
                validator(value: number): boolean {
                    return Number.isInteger(value);
                },
                message: 'Plate last number must be an integer between 0 and 9',
            },
        },
        engine: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: VEHICLE_ENGINE_MAX_LENGTH,
        },
        color: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: VEHICLE_COLOR_MAX_LENGTH,
        },
        description: {
            type: String,
            default: null,
            trim: true,
            maxlength: VEHICLE_DESCRIPTION_MAX_LENGTH,
        },
        paymentMethods: {
            type: [String],
            required: true,
            default: [],
            validate: {
                validator(value: string[]): boolean {
                    return value.every((method) => method.trim().length > 0);
                },
                message: 'Payment methods must be non-empty strings',
            },
        },
        images: {
            type: [vehicleImageSchema],
            required: true,
            default: [],
            validate: [
                {
                    validator(value: IVehicleImage[]): boolean {
                        return value.length <= VEHICLE_IMAGES_MAX;
                    },
                    message: `Vehicles support at most ${VEHICLE_IMAGES_MAX} images`,
                },
            ],
        },
        status: {
            type: String,
            enum: VEHICLE_STATUSES,
            required: true,
            default: 'draft',
        },
        publishedAt: {
            type: Date,
            default: null,
        },
        soldAt: {
            type: Date,
            default: null,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

vehicleSchema.pre('validate', function () {
    if (this.featured && !this.featuredAt) {
        this.featuredAt = new Date();
    }

    if (!this.featured) {
        this.featuredAt = null;
    }

    if (this.status === 'published' || this.status === 'sold') {
        if (this.images.length < 1 || this.images.length > VEHICLE_IMAGES_MAX) {
            throw new Error(
                `Published vehicles require between 1 and ${VEHICLE_IMAGES_MAX} images`,
            );
        }

        const primaryCount = this.images.filter((image) => image.isPrimary).length;

        if (primaryCount !== 1) {
            throw new Error('Exactly one image must be marked as primary');
        }
    }
});

vehicleSchema.index({ status: 1, featured: 1, featuredAt: 1 });
vehicleSchema.index({ status: 1, publishedAt: -1 });
vehicleSchema.index({ brand: 1, model: 1 });

export type VehicleDocument = HydratedDocument<IVehicle>;
export type VehicleModelType = Model<IVehicle>;

export const VehicleModel = model<IVehicle>('Vehicle', vehicleSchema);
