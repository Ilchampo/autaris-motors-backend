export const ROLES = ['client', 'employee', 'admin'] as const;

export type Role = (typeof ROLES)[number];

export interface IUser {
    role: Role;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passwordHash: string;
    active: boolean;
    mustChangePassword: boolean;
    createdAt: Date;
    updatedAt: Date;
}
