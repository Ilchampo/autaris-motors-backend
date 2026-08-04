import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ValidationError, ValidationSchema } from '@interfaces/validation.interface';

import { ZodError } from 'zod';

export class ValidationErrorResponse {
    public readonly statusCode: number = 400;
    public readonly message: string = 'Validation failed';
    public readonly errors: ValidationError[];

    constructor(errors: ValidationError[]) {
        this.errors = errors;
    }
}

export const validateRequest = (schema: ValidationSchema): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }

            if (schema.query) {
                const parsedQuery = await schema.query.parseAsync(req.query);
                Object.assign(req.query, parsedQuery);
            }

            if (schema.params) {
                const parsedParams = await schema.params.parseAsync(req.params);
                Object.assign(req.params, parsedParams);
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors: ValidationError[] = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                    code: issue.code,
                }));

                const validationResponse = new ValidationErrorResponse(validationErrors);

                res.status(validationResponse.statusCode).json({
                    success: false,
                    message: validationResponse.message,
                    errors: validationResponse.errors,
                });

                return;
            }

            next(error);
        }
    };
};

export const createValidationSchema = <T extends ValidationSchema>(schema: T): T => {
    return schema;
};
