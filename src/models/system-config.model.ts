import type { HydratedDocument, Model } from 'mongoose';
import type {
    IContactConfig,
    ISocialConfig,
    ISystemConfig,
    IWhatsAppConfig,
} from '@interfaces/system-config.interface';

import { Schema, model } from 'mongoose';
import {
    CONTACT_ADDRESS_MAX_LENGTH,
    CONTACT_ADDRESS_MIN_LENGTH,
    EMAIL_REGEX,
    PHONE_MAX_LENGTH,
    PHONE_MIN_LENGTH,
    WHATSAPP_MESSAGE_MAX_LENGTH,
    WHATSAPP_MESSAGE_MIN_LENGTH,
} from '@constants/validation.constant';
import { SYSTEM_CONFIG_ID } from '@interfaces/system-config.interface';
import { isHttpsUrl, isValidWhatsAppMessage } from '@utils/validation.util';

const whatsAppConfigSchema = new Schema<IWhatsAppConfig>(
    {
        number: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            minlength: WHATSAPP_MESSAGE_MIN_LENGTH,
            maxlength: WHATSAPP_MESSAGE_MAX_LENGTH,
            validate: {
                validator: isValidWhatsAppMessage,
                message:
                    'WhatsApp message contains unknown placeholders. Allowed: {{vehicleTitle}}, {{price}}, {{vehicleUrl}}',
            },
        },
        onlyRegistered: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { _id: false },
);

const contactConfigSchema = new Schema<IContactConfig>(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [EMAIL_REGEX, 'Invalid contact email address'],
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            minlength: PHONE_MIN_LENGTH,
            maxlength: PHONE_MAX_LENGTH,
        },
        address: {
            type: String,
            required: true,
            trim: true,
            minlength: CONTACT_ADDRESS_MIN_LENGTH,
            maxlength: CONTACT_ADDRESS_MAX_LENGTH,
        },
    },
    { _id: false },
);

const socialLinkValidator = {
    validator(value: string | null): boolean {
        if (value === null || value === '') {
            return true;
        }

        return isHttpsUrl(value);
    },
    message: 'Social media links must be valid HTTPS URLs when provided',
};

const socialConfigSchema = new Schema<ISocialConfig>(
    {
        facebook: {
            type: String,
            default: null,
            trim: true,
            validate: socialLinkValidator,
        },
        instagram: {
            type: String,
            default: null,
            trim: true,
            validate: socialLinkValidator,
        },
        tiktok: {
            type: String,
            default: null,
            trim: true,
            validate: socialLinkValidator,
        },
        youtube: {
            type: String,
            default: null,
            trim: true,
            validate: socialLinkValidator,
        },
    },
    { _id: false },
);

const systemConfigSchema = new Schema<ISystemConfig>(
    {
        _id: {
            type: String,
            required: true,
            default: SYSTEM_CONFIG_ID,
            enum: [SYSTEM_CONFIG_ID],
        },
        whatsApp: {
            type: whatsAppConfigSchema,
            required: true,
        },
        contact: {
            type: contactConfigSchema,
            required: true,
        },
        social: {
            type: socialConfigSchema,
            required: true,
            default: () => ({}),
        },
    },
    {
        timestamps: { createdAt: false, updatedAt: true },
    },
);

systemConfigSchema.pre('validate', function () {
    this._id = SYSTEM_CONFIG_ID;
});

export type SystemConfigDocument = HydratedDocument<ISystemConfig>;
export type SystemConfigModelType = Model<ISystemConfig>;

export const SystemConfigModel = model<ISystemConfig>('SystemConfig', systemConfigSchema);
