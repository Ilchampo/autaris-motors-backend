import { z } from 'zod';

import { createValidationSchema } from '@middlewares/validation.middleware';
import { isHttpsUrl } from '@utils/validation.util';

import * as c from '@constants/validation.constant';

const whatsAppMessageSchema = z
    .string()
    .trim()
    .min(c.WHATSAPP_MESSAGE_MIN_LENGTH)
    .max(c.WHATSAPP_MESSAGE_MAX_LENGTH)
    .refine(
        (message) => {
            const placeholders = [...message.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]);

            return placeholders.every((placeholder) =>
                c.WHATSAPP_ALLOWED_PLACEHOLDERS.includes(
                    placeholder as (typeof c.WHATSAPP_ALLOWED_PLACEHOLDERS)[number],
                ),
            );
        },
        {
            message:
                'WhatsApp message contains unknown placeholders. Allowed: {{vehicleTitle}}, {{price}}, {{vehicleUrl}}',
        },
    );

const socialLinkSchema = z
    .union([z.string().trim(), z.null()])
    .refine((value) => value === null || value === '' || isHttpsUrl(value), {
        message: 'Social media links must be valid HTTPS URLs when provided',
    });

const whatsAppSchema = z
    .object({
        number: z.string().trim().min(1).optional(),
        message: whatsAppMessageSchema.optional(),
        onlyRegistered: z.boolean().optional(),
    })
    .refine(
        (value) =>
            value.number !== undefined ||
            value.message !== undefined ||
            value.onlyRegistered !== undefined,
        { message: 'At least one WhatsApp field must be provided' },
    );

const contactSchema = z
    .object({
        email: z.email().trim().toLowerCase().optional(),
        phone: z.string().trim().min(c.PHONE_MIN_LENGTH).max(c.PHONE_MAX_LENGTH).optional(),
        address: z
            .string()
            .trim()
            .min(c.CONTACT_ADDRESS_MIN_LENGTH)
            .max(c.CONTACT_ADDRESS_MAX_LENGTH)
            .optional(),
    })
    .refine(
        (value) =>
            value.email !== undefined || value.phone !== undefined || value.address !== undefined,
        { message: 'At least one contact field must be provided' },
    );

const socialSchema = z
    .object({
        facebook: socialLinkSchema.optional(),
        instagram: socialLinkSchema.optional(),
        tiktok: socialLinkSchema.optional(),
        youtube: socialLinkSchema.optional(),
    })
    .refine(
        (value) =>
            value.facebook !== undefined ||
            value.instagram !== undefined ||
            value.tiktok !== undefined ||
            value.youtube !== undefined,
        { message: 'At least one social field must be provided' },
    );

export const updateSystemConfigSchema = createValidationSchema({
    body: z
        .object({
            whatsApp: whatsAppSchema.optional(),
            contact: contactSchema.optional(),
            social: socialSchema.optional(),
        })
        .refine(
            (value) =>
                value.whatsApp !== undefined ||
                value.contact !== undefined ||
                value.social !== undefined,
            { message: 'At least one configuration section must be provided' },
        ),
});
