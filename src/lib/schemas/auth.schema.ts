import { z } from 'zod';

import {
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PASSWORD_MIN_LENGTH,
    PHONE_MAX_LENGTH,
    PHONE_MIN_LENGTH,
} from '@constants/validation.constant';
import { createValidationSchema } from '@middlewares/validation.middleware';

const nameSchema = z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH);
const emailSchema = z.email().trim().toLowerCase();
const phoneSchema = z.string().trim().min(PHONE_MIN_LENGTH).max(PHONE_MAX_LENGTH);
const passwordSchema = z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = createValidationSchema({
    body: z
        .object({
            firstName: nameSchema,
            lastName: nameSchema,
            email: emailSchema,
            phone: phoneSchema,
            password: passwordSchema,
            confirmPassword: z.string(),
        })
        .refine((value) => value.password === value.confirmPassword, {
            message: 'Passwords do not match',
            path: ['confirmPassword'],
        }),
});

export const loginSchema = createValidationSchema({
    body: z.object({
        email: emailSchema,
        password: z.string().min(1),
    }),
});

export const passwordRecoverySchema = createValidationSchema({
    body: z.object({
        email: emailSchema,
    }),
});
