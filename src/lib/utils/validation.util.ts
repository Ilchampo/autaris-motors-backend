import { WHATSAPP_ALLOWED_PLACEHOLDERS } from '@constants/validation.constant';

export const isHttpsUrl = (value: string): boolean => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:';
    } catch {
        return false;
    }
};

export const isValidWhatsAppMessage = (message: string): boolean => {
    const placeholders = [...message.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]);

    return placeholders.every((placeholder) =>
        WHATSAPP_ALLOWED_PLACEHOLDERS.includes(
            placeholder as (typeof WHATSAPP_ALLOWED_PLACEHOLDERS)[number],
        ),
    );
};

export const slugify = (value: string): string =>
    value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const hasUniqueChildNames = (children: Array<{ name: string }>): boolean => {
    const normalizedNames = children.map((child) => child.name.trim().toLowerCase());
    return new Set(normalizedNames).size === normalizedNames.length;
};
