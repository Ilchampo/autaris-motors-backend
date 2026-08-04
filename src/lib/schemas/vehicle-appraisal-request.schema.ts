import { z } from 'zod';

import {
    APPRAISAL_NOTES_MAX_LENGTH,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PHONE_MAX_LENGTH,
    PHONE_MIN_LENGTH,
    VEHICLE_COLOR_MAX_LENGTH,
    VEHICLE_MILEAGE_MAX,
    VEHICLE_MILEAGE_MIN,
    VEHICLE_PRICE_MIN,
    VEHICLE_YEAR_MIN,
} from '@constants/validation.constant';
import { PREFERRED_CONTACT_SCHEDULES } from '@interfaces/vehicle-appraisal-request.interface';
import { createValidationSchema } from '@middlewares/validation.middleware';

export const createVehicleAppraisalRequestSchema = createValidationSchema({
    body: z.object({
        brand: z.string().trim().min(1),
        model: z.string().trim().min(1),
        year: z.coerce.number().int().min(VEHICLE_YEAR_MIN).max(new Date().getUTCFullYear()),
        kilometers: z.coerce.number().min(VEHICLE_MILEAGE_MIN).max(VEHICLE_MILEAGE_MAX),
        city: z.string().trim().min(1),
        transmission: z.string().trim().min(1),
        fuelType: z.string().trim().min(1),
        color: z.string().trim().min(1).max(VEHICLE_COLOR_MAX_LENGTH),
        expectedPrice: z.coerce.number().min(VEHICLE_PRICE_MIN),
        firstName: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
        lastName: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
        email: z.email().trim().toLowerCase(),
        phone: z.string().trim().min(PHONE_MIN_LENGTH).max(PHONE_MAX_LENGTH),
        preferredContactSchedule: z.enum(PREFERRED_CONTACT_SCHEDULES),
        notes: z.string().trim().max(APPRAISAL_NOTES_MAX_LENGTH).nullable().optional(),
    }),
});
