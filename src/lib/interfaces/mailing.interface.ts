export type EmailTemplate = 'create-user' | 'password-recovery' | 'vehicle-appraisal-request';

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

export interface VehicleAppraisalRequestEmailData {
    brand: string;
    model: string;
    year: string;
    kilometers: string;
    city: string;
    transmission: string;
    fuelType: string;
    color: string;
    expectedPrice: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferredContactSchedule: string;
    notes: string;
}

export type EmailTemplateData = {
    'create-user': CreateUserEmailData;
    'password-recovery': PasswordRecoveryEmailData;
    'vehicle-appraisal-request': VehicleAppraisalRequestEmailData;
};
