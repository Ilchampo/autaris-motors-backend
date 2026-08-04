import type { Types } from 'mongoose';

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

export type PublicUser = Omit<IUser, 'passwordHash'> & {
    _id: Types.ObjectId;
};

export interface AuthUser {
    id: string;
    email: string;
    role: Role;
}

export interface CreateUserParams {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: Role;
    authUser: AuthUser;
}

export interface UpdateUserParams {
    id: string;
    authUser: AuthUser;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: Role;
}

export interface UpdateUserPasswordParams {
    id: string;
    password: string;
    currentPassword?: string;
    authUser?: AuthUser;
    isFromRecovery?: boolean;
}

export interface DeleteUserParams {
    id: string;
    authUser: AuthUser;
}

export interface ActivateUserParams {
    id: string;
    authUser: AuthUser;
}

export interface GetUserOptions {
    includePassword?: boolean;
    activeOnly?: boolean;
}

export interface PaginatedUsers {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: PublicUser[];
}
