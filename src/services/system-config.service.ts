import type { SystemConfigDocument } from '@models/system-config.model';
import type {
    IContactConfig,
    ISocialConfig,
    IWhatsAppConfig,
    SystemConfigResponse,
    UpdateSystemConfigParams,
} from '@interfaces/system-config.interface';

import {
    DEFAULT_CONTACT_CONFIG,
    DEFAULT_SOCIAL_CONFIG,
    DEFAULT_WHATSAPP_CONFIG,
} from '@constants/system-config.constant';
import { SYSTEM_CONFIG_ID } from '@interfaces/system-config.interface';
import { SystemConfigModel } from '@models/system-config.model';
import { createLog } from '@services/log.service';
import { BadRequestError, ForbiddenError } from '@utils/errors.util';

const toSystemConfigResponse = (config: SystemConfigDocument): SystemConfigResponse => {
    return config.toObject() as SystemConfigResponse;
};

const normalizeSocialValue = (value: string | null | undefined): string | null => {
    if (value === undefined || value === null) {
        return null;
    }

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
};

const ensureSystemConfig = async (): Promise<SystemConfigDocument> => {
    const existing = await SystemConfigModel.findById(SYSTEM_CONFIG_ID).exec();

    if (existing) {
        return existing;
    }

    return SystemConfigModel.create({
        _id: SYSTEM_CONFIG_ID,
        whatsApp: DEFAULT_WHATSAPP_CONFIG,
        contact: DEFAULT_CONTACT_CONFIG,
        social: DEFAULT_SOCIAL_CONFIG,
    });
};

export const getSystemConfig = async (): Promise<SystemConfigResponse> => {
    const config = await ensureSystemConfig();
    return toSystemConfigResponse(config);
};

export const updateSystemConfig = async (
    params: UpdateSystemConfigParams,
): Promise<SystemConfigResponse> => {
    const { authUser, whatsApp, contact, social } = params;

    if (authUser.role !== 'admin') {
        throw new ForbiddenError('Only administrators can update system configuration');
    }

    if (!whatsApp && !contact && !social) {
        throw new BadRequestError('At least one configuration section must be provided');
    }

    const config = await ensureSystemConfig();
    const updatedSections: string[] = [];

    if (whatsApp) {
        const nextWhatsApp: IWhatsAppConfig = {
            ...config.whatsApp,
            ...whatsApp,
        };

        if (whatsApp.number !== undefined) {
            nextWhatsApp.number = whatsApp.number.trim();
        }

        if (whatsApp.message !== undefined) {
            nextWhatsApp.message = whatsApp.message.trim();
        }

        config.whatsApp = nextWhatsApp;
        updatedSections.push('whatsApp');
    }

    if (contact) {
        const nextContact: IContactConfig = {
            ...config.contact,
            ...contact,
        };

        if (contact.email !== undefined) {
            nextContact.email = contact.email.trim().toLowerCase();
        }

        if (contact.phone !== undefined) {
            nextContact.phone = contact.phone.trim();
        }

        if (contact.address !== undefined) {
            nextContact.address = contact.address.trim();
        }

        config.contact = nextContact;
        updatedSections.push('contact');
    }

    if (social) {
        const nextSocial: ISocialConfig = {
            facebook:
                social.facebook !== undefined
                    ? normalizeSocialValue(social.facebook)
                    : config.social.facebook,
            instagram:
                social.instagram !== undefined
                    ? normalizeSocialValue(social.instagram)
                    : config.social.instagram,
            tiktok:
                social.tiktok !== undefined
                    ? normalizeSocialValue(social.tiktok)
                    : config.social.tiktok,
            youtube:
                social.youtube !== undefined
                    ? normalizeSocialValue(social.youtube)
                    : config.social.youtube,
        };

        config.social = nextSocial;
        updatedSections.push('social');
    }

    await config.save();

    await createLog({
        message: `System configuration was updated by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { sections: updatedSections },
    });

    return toSystemConfigResponse(config);
};
