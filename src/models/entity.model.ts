import type { HydratedDocument, Model } from 'mongoose';
import type { IEntity, IEntityChild } from '@interfaces/entity.interface';

import { Schema, model } from 'mongoose';
import { ENTITY_TYPES } from '@interfaces/entity.interface';
import { hasUniqueChildNames, isHttpsUrl, slugify } from '@utils/validation.util';

const entityChildSchema = new Schema<IEntityChild>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        active: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    { _id: false },
);

const entitySchema = new Schema<IEntity>(
    {
        type: {
            type: String,
            enum: ENTITY_TYPES,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        order: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
            validate: {
                validator(value: number): boolean {
                    return Number.isInteger(value);
                },
                message: 'Order must be an integer greater than or equal to 0',
            },
        },
        active: {
            type: Boolean,
            required: true,
            default: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        imageUrl: {
            type: String,
            default: null,
            trim: true,
            validate: {
                validator(value: string | null): boolean {
                    if (value === null || value === '') {
                        return true;
                    }

                    return isHttpsUrl(value);
                },
                message: 'Entity image URL must be a valid HTTPS URL',
            },
        },
        children: {
            type: [entityChildSchema],
            required: true,
            default: [],
            validate: {
                validator: hasUniqueChildNames,
                message: 'Model names must be unique within the same brand',
            },
        },
        metadata: {
            type: Map,
            of: String,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

entitySchema.pre('validate', function () {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name);
    }

    if (this.type !== 'brand') {
        if (this.imageUrl) {
            throw new Error('Only Brand entities may contain images');
        }

        if (this.children.length > 0) {
            throw new Error('Only Brand entities may contain child models');
        }
    }
});

entitySchema.index({ type: 1, name: 1 }, { unique: true });
entitySchema.index({ type: 1, slug: 1 }, { unique: true });
entitySchema.index({ type: 1, active: 1, order: 1 });

export type EntityDocument = HydratedDocument<IEntity>;
export type EntityModelType = Model<IEntity>;

export const EntityModel = model<IEntity>('Entity', entitySchema);
