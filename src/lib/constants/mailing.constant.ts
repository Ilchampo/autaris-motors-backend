import type { Email, EmailTemplate } from '@interfaces/mailing.interface';

export const CREATE_USER_EMAIL: Email = {
    subject: 'Your Autaris Motors account',
    html: `
        <p>Hi {{firstName}} {{lastName}},</p>
        <p>An account has been created for you on Autaris Motors.</p>
        <p><strong>Email:</strong> {{email}}</p>
        <p><strong>Temporary password:</strong> {{password}}</p>
        <p>You will be asked to change this password on your first login.</p>
    `,
};

export const PASSWORD_RECOVERY_EMAIL: Email = {
    subject: 'Password recovery',
    html: `
        <p>Hi {{firstName}},</p>
        <p>A password recovery request has been made for your Autaris Motors account.</p>
        <p><strong>Reset URL:</strong> <a href="{{resetUrl}}">{{resetUrl}}</a></p>
        <p>If you did not request a password recovery, please ignore this email.</p>
    `,
};

export const EMAIL_TEMPLATES: Record<EmailTemplate, Email> = {
    'create-user': CREATE_USER_EMAIL,
    'password-recovery': PASSWORD_RECOVERY_EMAIL,
};
