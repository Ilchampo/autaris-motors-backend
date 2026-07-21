import {
    type UploadApiErrorResponse,
    type UploadApiOptions,
    type UploadApiResponse,
    v2 as cloudinary,
} from 'cloudinary';

import config from '@lib/config';

cloudinary.config(config.cloudinary);

const getTransformation = (): NonNullable<UploadApiOptions['transformation']> =>
    config.cloudinary.transformationName
        ? [config.cloudinary.transformationName]
        : ['transformation-name'];

const normalizeUploadOptions = (options: UploadApiOptions = {}): UploadApiOptions => ({
    resource_type: 'image',
    format: 'jpg',
    transformation: options.transformation ?? getTransformation(),
    ...options,
});

const uploadBufferWithTransform = async (
    file: Buffer,
    options: UploadApiOptions,
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
            options,
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error('Cloudinary upload failed without an error response'));
                    return;
                }

                resolve(result);
            },
        );

        upload.end(file);
    });
};

const uploadImage = async (
    file: Buffer | string,
    options: UploadApiOptions = {},
): Promise<UploadApiResponse> => {
    const uploadOptions = normalizeUploadOptions(options);

    if (Buffer.isBuffer(file)) {
        return uploadBufferWithTransform(file, uploadOptions);
    }

    return cloudinary.uploader.upload(file, uploadOptions);
};

const extractPublicIdFromUrl = (url: string): string | null => {
    try {
        const urlPattern = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^/?#.]+)?(?:\?|$|#)/;
        const match = url.match(urlPattern);

        if (match && match[1]) {
            const publicId = decodeURIComponent(match[1]).replace(/\/$/, '');

            return publicId;
        }

        return null;
    } catch {
        return null;
    }
};

const deleteFile = async (
    url: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'raw',
): Promise<{ result: string }> => {
    const publicId = extractPublicIdFromUrl(url);

    if (!publicId) {
        throw new Error('Invalid Cloudinary URL: Could not extract public_id');
    }

    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error('Cloudinary deletion failed without an error response'));
                    return;
                }

                resolve(result);
            },
        );
    });
};

export default Object.assign(cloudinary, {
    uploadImage,
    deleteFile,
});
