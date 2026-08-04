import type {
    IContactConfig,
    ISocialConfig,
    IWhatsAppConfig,
    UpdateSystemConfigParams,
} from '@interfaces/system-config.interface';

import { controller } from '@utils/controller.util';
import { getAuthUser } from '@utils/request.util';

import * as systemConfigService from '@services/system-config.service';

export const getSystemConfig = controller(async () => {
    const data = await systemConfigService.getSystemConfig();
    return { data };
});

export const updateSystemConfig = controller(async (req) => {
    const authUser = getAuthUser(req);
    const { whatsApp, contact, social } = req.body as {
        whatsApp?: Partial<IWhatsAppConfig>;
        contact?: Partial<IContactConfig>;
        social?: Partial<ISocialConfig>;
    };

    const params: UpdateSystemConfigParams = { authUser };

    if (whatsApp !== undefined) {
        params.whatsApp = whatsApp;
    }

    if (contact !== undefined) {
        params.contact = contact;
    }

    if (social !== undefined) {
        params.social = social;
    }

    const data = await systemConfigService.updateSystemConfig(params);

    return { data };
});
