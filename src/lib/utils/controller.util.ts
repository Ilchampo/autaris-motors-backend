import type { ControllerFn } from '@interfaces/controller.interface';
import type { Request, RequestHandler, Response, NextFunction } from 'express';

export const controller = <T>(fn: ControllerFn<T>): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { statusCode = 200, data } = await fn(req);

            res.status(statusCode).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
};
