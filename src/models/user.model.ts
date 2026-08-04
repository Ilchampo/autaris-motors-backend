import type { HydratedDocument, Model } from 'mongoose';
import type { IUser } from '@interfaces/user.interface';

import { Schema, model } from 'mongoose';
import {
    EMAIL_REGEX,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PHONE_MAX_LENGTH,
    PHONE_MIN_LENGTH,
} from '@constants/validation.constant';
import { ROLES } from '@interfaces/user.interface';

const userSchema = new Schema<IUser>(
    {
        role: {
            type: String,
            enum: ROLES,
            required: true,
            default: 'client',
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: NAME_MIN_LENGTH,
            maxlength: NAME_MAX_LENGTH,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: NAME_MIN_LENGTH,
            maxlength: NAME_MAX_LENGTH,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [EMAIL_REGEX, 'Invalid email address'],
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: PHONE_MIN_LENGTH,
            maxlength: PHONE_MAX_LENGTH,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        active: {
            type: Boolean,
            required: true,
            default: true,
        },
        mustChangePassword: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

export type UserDocument = HydratedDocument<IUser>;
export type UserModelType = Model<IUser>;

export const UserModel = model<IUser>('User', userSchema);
