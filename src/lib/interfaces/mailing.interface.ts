export type EmailTemplate = 'create-user' | 'password-recovery';

export interface Email {
    subject: string;
    html: string;
}

export interface CreateUserEmailData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface PasswordRecoveryEmailData {
    firstName: string;
    email: string;
    resetUrl: string;
}

export type EmailTemplateData = {
    'create-user': CreateUserEmailData;
    'password-recovery': PasswordRecoveryEmailData;
};
