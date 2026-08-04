import { z } from 'zod';

import { createValidationSchema } from '@middlewares/validation.middleware';

const objectIdSchema = z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const createVehicleInquirySchema = createValidationSchema({
    body: z.object({
        vehicleId: objectIdSchema,
    }),
});

export const getVehicleInquiriesSchema = createValidationSchema({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        pageSize: z.coerce.number().int().positive().optional(),
        vehicleId: objectIdSchema.optional(),
        userId: objectIdSchema.optional(),
        brand: z.string().trim().optional(),
        model: z.string().trim().optional(),
    }),
});

export const getVehicleInquiryByIdSchema = createValidationSchema({
    params: z.object({
        id: objectIdSchema,
    }),
});
