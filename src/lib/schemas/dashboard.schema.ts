import { z } from 'zod';

import { createValidationSchema } from '@middlewares/validation.middleware';

const dateInputSchema = z.coerce.date();

export const getDashboardSchema = createValidationSchema({
    query: z
        .object({
            startDate: dateInputSchema.optional(),
            endDate: dateInputSchema.optional(),
        })
        .superRefine((query, ctx) => {
            const hasStart = query.startDate !== undefined;
            const hasEnd = query.endDate !== undefined;

            if (hasStart !== hasEnd) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Both startDate and endDate are required when filtering by date',
                    path: hasStart ? ['endDate'] : ['startDate'],
                });
                return;
            }

            if (hasStart && hasEnd && query.startDate! > query.endDate!) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'startDate must be less than or equal to endDate',
                    path: ['startDate'],
                });
            }
        }),
});
