import type { AuthUser } from '@interfaces/user.interface';

export const SYSTEM_CONFIG_ID = 'system' as const;

export interface IWhatsAppConfig {
    number: string;
    message: string;
    onlyRegistered: boolean;
}

export interface IContactConfig {
    email: string;
    phone: string;
    address: string;
}

export interface ISocialConfig {
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
    youtube: string | null;
}

export interface ISystemConfig {
    _id: typeof SYSTEM_CONFIG_ID;
    whatsApp: IWhatsAppConfig;
    contact: IContactConfig;
    social: ISocialConfig;
    updatedAt: Date;
}

export type SystemConfigResponse = ISystemConfig;

export interface UpdateSystemConfigParams {
    authUser: AuthUser;
    whatsApp?: Partial<IWhatsAppConfig>;
    contact?: Partial<IContactConfig>;
    social?: Partial<ISocialConfig>;
}
