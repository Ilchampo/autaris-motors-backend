import { z } from 'zod';

import { ENTITY_TYPES } from '@interfaces/entity.interface';
import { createValidationSchema } from '@middlewares/validation.middleware';

const objectIdSchema = z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, 'Invalid entity id');

const entityTypeSchema = z.enum(ENTITY_TYPES);

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

const entityChildSchema = z.object({
    name: z.string().trim().min(1),
    active: z.coerce.boolean(),
});

const childrenSchema = parseJsonField(z.array(entityChildSchema));

const metadataSchema = parseJsonField(z.record(z.string(), z.string()).nullable());

const idParamsSchema = z.object({
    id: objectIdSchema,
});

const booleanQuerySchema = z.preprocess((value) => {
    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    return value;
}, z.boolean());

export const getEntitiesSchema = createValidationSchema({
    query: z.object({
        type: entityTypeSchema.optional(),
    }),
});

export const getEntityByIdSchema = createValidationSchema({
    params: idParamsSchema,
});

export const getManagedEntitiesSchema = createValidationSchema({
    query: z.object({
        type: entityTypeSchema.optional(),
        active: booleanQuerySchema.optional(),
    }),
});

export const createEntitySchema = createValidationSchema({
    body: z.object({
        type: entityTypeSchema,
        name: z.string().trim().min(1),
        order: z.coerce.number().int().min(0).optional(),
        children: childrenSchema.optional(),
        metadata: metadataSchema.optional(),
    }),
});

export const updateEntitySchema = createValidationSchema({
    params: idParamsSchema,
    body: z.object({
        name: z.string().trim().min(1).optional(),
        order: z.coerce.number().int().min(0).optional(),
        children: childrenSchema.optional(),
        metadata: metadataSchema.optional(),
        removeImage: booleanQuerySchema.optional(),
    }),
});

export const entityIdSchema = createValidationSchema({
    params: idParamsSchema,
});
