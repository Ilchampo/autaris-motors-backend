import type { RequestHandler } from 'express';

import { BadRequestError } from '@utils/errors.util';

import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
            callback(new Error('Only image files are allowed'));
            return;
        }

        callback(null, true);
    },
});

const handleUploadError = (error: unknown, next: (error?: unknown) => void): void => {
    if (!error) {
        next();
        return;
    }

    if (error instanceof multer.MulterError) {
        next(new BadRequestError(error.message));
        return;
    }

    if (error instanceof Error) {
        next(new BadRequestError(error.message));
        return;
    }

    next(error);
};

export const uploadEntityImage: RequestHandler = (req, res, next) => {
    upload.single('image')(req, res, (error: unknown) => {
        handleUploadError(error, next);
    });
};

export const uploadVehicleImages: RequestHandler = (req, res, next) => {
    upload.array('images', 10)(req, res, (error: unknown) => {
        handleUploadError(error, next);
    });
};
