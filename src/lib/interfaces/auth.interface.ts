import type { PublicUser } from '@interfaces/user.interface';

export interface RegisterParams {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
}

export interface LoginParams {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: PublicUser;
}
