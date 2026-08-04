import type { ZodType } from 'zod';

export interface ValidationSchema {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
