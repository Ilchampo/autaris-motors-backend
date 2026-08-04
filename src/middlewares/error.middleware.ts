import type { ErrorRequestHandler } from 'express';

import { AppError } from '@utils/errors.util';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    console.error(error);

    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};
