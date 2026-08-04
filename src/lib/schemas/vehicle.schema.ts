import { z } from 'zod';

import {
    PLATE_LAST_NUMBER_MAX,
    PLATE_LAST_NUMBER_MIN,
    VEHICLE_COLOR_MAX_LENGTH,
    VEHICLE_DESCRIPTION_MAX_LENGTH,
    VEHICLE_ENGINE_MAX_LENGTH,
    VEHICLE_MILEAGE_MAX,
    VEHICLE_MILEAGE_MIN,
    VEHICLE_PRICE_MAX,
    VEHICLE_PRICE_MIN,
    VEHICLE_TITLE_MAX_LENGTH,
    VEHICLE_TITLE_MIN_LENGTH,
    VEHICLE_YEAR_MIN,
} from '@constants/validation.constant';
import {
    CATALOG_SORT_OPTIONS,
    MANAGE_SORT_OPTIONS,
    VEHICLE_STATUSES,
} from '@interfaces/vehicle.interface';
import { createValidationSchema } from '@middlewares/validation.middleware';

const objectIdSchema = z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, 'Invalid vehicle id');

const parseJsonField = <T>(schema: z.ZodType<T>) =>
    z.preprocess((value) => {
        if (typeof value !== 'string') {
            return value;
        }

        if (value.trim() === '') {
            return undefined;
        }

        try {
            return JSON.parse(value) as unknown;
        } catch {
            return value;
        }
    }, schema);

const booleanSchema = z.preprocess((value) => {
    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    return value;
}, z.boolean());

const idParamsSchema = z.object({
    id: objectIdSchema,
});

const paymentMethodsSchema = parseJsonField(z.array(z.string().trim().min(1)));

export const getCatalogVehiclesSchema = createValidationSchema({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        sort: z.enum(CATALOG_SORT_OPTIONS).optional(),
        title: z.string().trim().optional(),
        brand: z.string().trim().optional(),
        model: z.string().trim().optional(),
        minPrice: z.coerce.number().min(VEHICLE_PRICE_MIN).optional(),
        maxPrice: z.coerce.number().max(VEHICLE_PRICE_MAX).optional(),
        minYear: z.coerce.number().int().min(VEHICLE_YEAR_MIN).optional(),
        maxYear: z.coerce.number().int().optional(),
        transmission: z.string().trim().optional(),
        fuelType: z.string().trim().optional(),
        vehicleType: z.string().trim().optional(),
        city: z.string().trim().optional(),
        minMileage: z.coerce.number().min(VEHICLE_MILEAGE_MIN).optional(),
        maxMileage: z.coerce.number().max(VEHICLE_MILEAGE_MAX).optional(),
        plateLastNumber: z.coerce
            .number()
            .int()
            .min(PLATE_LAST_NUMBER_MIN)
            .max(PLATE_LAST_NUMBER_MAX)
            .optional(),
    }),
});

export const getFeaturedVehiclesSchema = createValidationSchema({
    query: z.object({
        limit: z.coerce.number().int().positive().max(20).optional(),
    }),
});

export const getVehicleByIdSchema = createValidationSchema({
    params: idParamsSchema,
});

export const getManagedVehiclesSchema = createValidationSchema({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        pageSize: z.coerce.number().int().positive().optional(),
        sort: z.enum(MANAGE_SORT_OPTIONS).optional(),
        title: z.string().trim().optional(),
        brand: z.string().trim().optional(),
        city: z.string().trim().optional(),
        status: z.enum(VEHICLE_STATUSES).optional(),
    }),
});

export const createVehicleSchema = createValidationSchema({
    body: z.object({
        title: z
            .string()
            .trim()
            .min(VEHICLE_TITLE_MIN_LENGTH)
            .max(VEHICLE_TITLE_MAX_LENGTH)
            .optional(),
        featured: booleanSchema.optional(),
        price: z.coerce.number().min(VEHICLE_PRICE_MIN).max(VEHICLE_PRICE_MAX),
        brand: z.string().trim().min(1),
        model: z.string().trim().min(1),
        year: z.coerce.number().int().min(VEHICLE_YEAR_MIN).max(new Date().getUTCFullYear()),
        city: z.string().trim().min(1),
        vehicleType: z.string().trim().min(1),
        fuelType: z.string().trim().min(1),
        transmission: z.string().trim().min(1),
        kilometers: z.coerce.number().min(VEHICLE_MILEAGE_MIN).max(VEHICLE_MILEAGE_MAX),
        plateInitial: z
            .string()
            .trim()
            .toUpperCase()
            .regex(/^[A-Z]$/, 'Plate initial must be a single uppercase letter A–Z'),
        plateLastNumber: z.coerce
            .number()
            .int()
            .min(PLATE_LAST_NUMBER_MIN)
            .max(PLATE_LAST_NUMBER_MAX),
        engine: z.string().trim().min(1).max(VEHICLE_ENGINE_MAX_LENGTH),
        color: z.string().trim().min(1).max(VEHICLE_COLOR_MAX_LENGTH),
        description: z.string().trim().max(VEHICLE_DESCRIPTION_MAX_LENGTH).optional(),
        paymentMethods: paymentMethodsSchema.optional(),
        status: z.enum(['draft', 'published']),
        primaryImageIndex: z.coerce.number().int().min(0).optional(),
    }),
});

export const updateVehicleSchema = createValidationSchema({
    params: idParamsSchema,
    body: z.object({
        title: z
            .string()
            .trim()
            .min(VEHICLE_TITLE_MIN_LENGTH)
            .max(VEHICLE_TITLE_MAX_LENGTH)
            .optional(),
        featured: booleanSchema.optional(),
        price: z.coerce.number().min(VEHICLE_PRICE_MIN).max(VEHICLE_PRICE_MAX).optional(),
        brand: z.string().trim().min(1).optional(),
        model: z.string().trim().min(1).optional(),
        year: z.coerce
            .number()
            .int()
            .min(VEHICLE_YEAR_MIN)
            .max(new Date().getUTCFullYear())
            .optional(),
        city: z.string().trim().min(1).optional(),
        vehicleType: z.string().trim().min(1).optional(),
        fuelType: z.string().trim().min(1).optional(),
        transmission: z.string().trim().min(1).optional(),
        kilometers: z.coerce.number().min(VEHICLE_MILEAGE_MIN).max(VEHICLE_MILEAGE_MAX).optional(),
        plateInitial: z
            .string()
            .trim()
            .toUpperCase()
            .regex(/^[A-Z]$/, 'Plate initial must be a single uppercase letter A–Z')
            .optional(),
        plateLastNumber: z.coerce
            .number()
            .int()
            .min(PLATE_LAST_NUMBER_MIN)
            .max(PLATE_LAST_NUMBER_MAX)
            .optional(),
        engine: z.string().trim().min(1).max(VEHICLE_ENGINE_MAX_LENGTH).optional(),
        color: z.string().trim().min(1).max(VEHICLE_COLOR_MAX_LENGTH).optional(),
        description: z.string().trim().max(VEHICLE_DESCRIPTION_MAX_LENGTH).nullable().optional(),
        paymentMethods: paymentMethodsSchema.optional(),
        primaryImageIndex: z.coerce.number().int().min(0).optional(),
    }),
});

export const markVehicleAsSoldSchema = createValidationSchema({
    params: idParamsSchema,
    body: z.object({
        sellingPrice: z.coerce.number().min(VEHICLE_PRICE_MIN).max(VEHICLE_PRICE_MAX),
        saleDate: z.coerce.date().refine((value) => value.getTime() <= Date.now(), {
            message: 'Sale date cannot be in the future',
        }),
        advisorId: objectIdSchema.optional(),
        notes: z.string().trim().max(1000).nullable().optional(),
    }),
});

export const vehicleIdSchema = createValidationSchema({
    params: idParamsSchema,
});
