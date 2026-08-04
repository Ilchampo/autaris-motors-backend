import { z } from 'zod';

import { LOG_SORT_OPTIONS, LOG_TYPES } from '@interfaces/log.interface';
import { createValidationSchema } from '@middlewares/validation.middleware';

const objectIdSchema = z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const getLogsSchema = createValidationSchema({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        pageSize: z.coerce.number().int().positive().optional(),
        type: z.enum(LOG_TYPES).optional(),
        search: z.string().trim().min(1).optional(),
        actorId: objectIdSchema.optional(),
        sort: z.enum(LOG_SORT_OPTIONS).optional(),
    }),
});

export const getLogByIdSchema = createValidationSchema({
    params: z.object({
        id: objectIdSchema,
    }),
});
