import { z } from 'zod';

import {
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PASSWORD_MIN_LENGTH,
    PHONE_MAX_LENGTH,
    PHONE_MIN_LENGTH,
} from '@constants/validation.constant';
import { ROLES } from '@interfaces/user.interface';
import { createValidationSchema } from '@middlewares/validation.middleware';

const objectIdSchema = z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, 'Invalid user id');

const nameSchema = z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH);

const emailSchema = z.email().trim().toLowerCase();

const phoneSchema = z.string().trim().min(PHONE_MIN_LENGTH).max(PHONE_MAX_LENGTH);

const roleSchema = z.enum(ROLES);

const passwordSchema = z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const idParamsSchema = z.object({
    id: objectIdSchema,
});

export const getUserByIdSchema = createValidationSchema({
    params: idParamsSchema,
});

export const getUserByEmailSchema = createValidationSchema({
    query: z.object({
        email: emailSchema,
    }),
});

export const getAllUsersSchema = createValidationSchema({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        pageSize: z.coerce.number().int().positive().optional(),
    }),
});

export const createUserSchema = createValidationSchema({
    body: z.object({
        firstName: nameSchema,
        lastName: nameSchema,
        email: emailSchema,
        phone: phoneSchema,
        role: roleSchema,
    }),
});

export const updateUserSchema = createValidationSchema({
    params: idParamsSchema,
    body: z
        .object({
            firstName: nameSchema.optional(),
            lastName: nameSchema.optional(),
            phone: phoneSchema.optional(),
            role: roleSchema.optional(),
        })
        .refine(
            (value) =>
                value.firstName !== undefined ||
                value.lastName !== undefined ||
                value.phone !== undefined ||
                value.role !== undefined,
            { message: 'At least one field must be provided' },
        ),
});

export const updateUserPasswordSchema = createValidationSchema({
    params: idParamsSchema,
    body: z.object({
        password: passwordSchema,
        currentPassword: z.string().min(1),
    }),
});

export const deleteUserSchema = createValidationSchema({
    params: idParamsSchema,
});

export const activateUserSchema = createValidationSchema({
    params: idParamsSchema,
});
