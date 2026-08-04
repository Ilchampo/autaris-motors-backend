import { z } from 'zod';

import {
    SALE_NOTES_MAX_LENGTH,
    VEHICLE_PRICE_MAX,
    VEHICLE_PRICE_MIN,
} from '@constants/validation.constant';
import { SALE_STATUSES } from '@interfaces/sale.interface';
import { createValidationSchema } from '@middlewares/validation.middleware';

const objectIdSchema = z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const idParamsSchema = z.object({
    id: objectIdSchema,
});

export const getSalesSchema = createValidationSchema({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        pageSize: z.coerce.number().int().positive().optional(),
        status: z.enum(SALE_STATUSES).optional(),
        vehicleId: objectIdSchema.optional(),
        advisorId: objectIdSchema.optional(),
    }),
});

export const getSaleByIdSchema = createValidationSchema({
    params: idParamsSchema,
});

export const createSaleSchema = createValidationSchema({
    body: z.object({
        vehicleId: objectIdSchema,
        sellingPrice: z.coerce.number().min(VEHICLE_PRICE_MIN).max(VEHICLE_PRICE_MAX),
        saleDate: z.coerce.date().refine((value) => value.getTime() <= Date.now(), {
            message: 'Sale date cannot be in the future',
        }),
        advisorId: objectIdSchema.optional(),
        notes: z.string().trim().max(SALE_NOTES_MAX_LENGTH).nullable().optional(),
    }),
});

export const updateSaleSchema = createValidationSchema({
    params: idParamsSchema,
    body: z
        .object({
            sellingPrice: z.coerce
                .number()
                .min(VEHICLE_PRICE_MIN)
                .max(VEHICLE_PRICE_MAX)
                .optional(),
            saleDate: z.coerce
                .date()
                .refine((value) => value.getTime() <= Date.now(), {
                    message: 'Sale date cannot be in the future',
                })
                .optional(),
            advisorId: objectIdSchema.optional(),
            notes: z.string().trim().max(SALE_NOTES_MAX_LENGTH).nullable().optional(),
        })
        .refine(
            (value) =>
                value.sellingPrice !== undefined ||
                value.saleDate !== undefined ||
                value.advisorId !== undefined ||
                value.notes !== undefined,
            { message: 'At least one field must be provided' },
        ),
});

export const cancelSaleSchema = createValidationSchema({
    params: idParamsSchema,
});
