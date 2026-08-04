import type { CreateVehicleAppraisalRequestParams } from '@interfaces/vehicle-appraisal-request.interface';

import { controller } from '@utils/controller.util';

import * as vehicleAppraisalRequestService from '@services/vehicle-appraisal-request.service';

import '@interfaces/express.interface';

export const createVehicleAppraisalRequest = controller(async (req) => {
    const body = req.body as Omit<CreateVehicleAppraisalRequestParams, 'actorId'>;
    const params: CreateVehicleAppraisalRequestParams = {
        brand: body.brand,
        model: body.model,
        year: body.year,
        kilometers: body.kilometers,
        city: body.city,
        transmission: body.transmission,
        fuelType: body.fuelType,
        color: body.color,
        expectedPrice: body.expectedPrice,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        preferredContactSchedule: body.preferredContactSchedule,
    };

    if (body.notes !== undefined) {
        params.notes = body.notes;
    }

    if (req.user) {
        params.actorId = req.user.id;
    }

    const data = await vehicleAppraisalRequestService.createVehicleAppraisalRequest(params);

    return { statusCode: 201, data };
});
