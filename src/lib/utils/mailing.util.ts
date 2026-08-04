import type { Email } from '@interfaces/mailing.interface';

const VARIABLE_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

const replaceVariables = (input: string, data: Record<string, unknown>): string =>
    input.replace(VARIABLE_PATTERN, (match, key: string) => {
        const value = data[key];
        return typeof value === 'string' ? value : match;
    });

export const buildEmail = <T extends object>(template: Email, data: T): Email => {
    const values = data as Record<string, unknown>;

    return {
        subject: replaceVariables(template.subject, values),
        html: replaceVariables(template.html, values),
    };
};
