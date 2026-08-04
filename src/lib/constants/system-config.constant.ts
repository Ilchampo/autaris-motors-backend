import type {
    IContactConfig,
    ISocialConfig,
    IWhatsAppConfig,
} from '@interfaces/system-config.interface';

export const DEFAULT_WHATSAPP_CONFIG: IWhatsAppConfig = {
    number: '+0000000000',
    message: 'Hi, I am interested in {{vehicleTitle}} ({{price}}). {{vehicleUrl}}',
    onlyRegistered: false,
};

export const DEFAULT_CONTACT_CONFIG: IContactConfig = {
    email: 'contact@example.com',
    phone: '0000000',
    address: 'Address pending',
};

export const DEFAULT_SOCIAL_CONFIG: ISocialConfig = {
    facebook: null,
    instagram: null,
    tiktok: null,
    youtube: null,
};
