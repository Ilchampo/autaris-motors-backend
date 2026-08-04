import type { VehicleAppraisalRequestDocument } from '@models/vehicle-appraisal-request.model';
import type {
    CreateVehicleAppraisalRequestParams,
    VehicleAppraisalRequestResponse,
} from '@interfaces/vehicle-appraisal-request.interface';

import { VehicleAppraisalRequestModel } from '@models/vehicle-appraisal-request.model';
import { createLog } from '@services/log.service';
import { sendEmail } from '@services/mailing.service';
import { getSystemConfig } from '@services/system-config.service';

const toResponse = (request: VehicleAppraisalRequestDocument): VehicleAppraisalRequestResponse => {
    const data = request.toObject();

    return {
        ...data,
        _id: data._id.toString(),
    };
};

export const createVehicleAppraisalRequest = async (
    params: CreateVehicleAppraisalRequestParams,
): Promise<VehicleAppraisalRequestResponse> => {
    const {
        brand,
        model,
        year,
        kilometers,
        city,
        transmission,
        fuelType,
        color,
        expectedPrice,
        firstName,
        lastName,
        email,
        phone,
        preferredContactSchedule,
        notes = null,
        actorId = null,
    } = params;

    const request = await VehicleAppraisalRequestModel.create({
        brand: brand.trim(),
        model: model.trim(),
        year,
        kilometers,
        city: city.trim(),
        transmission: transmission.trim(),
        fuelType: fuelType.trim(),
        color: color.trim(),
        expectedPrice,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        preferredContactSchedule,
        notes: notes?.trim() || null,
    });

    const systemConfig = await getSystemConfig();

    await sendEmail(systemConfig.contact.email, 'vehicle-appraisal-request', {
        brand: request.brand,
        model: request.get('model') as string,
        year: String(request.year),
        kilometers: String(request.kilometers),
        city: request.city,
        transmission: request.transmission,
        fuelType: request.fuelType,
        color: request.color,
        expectedPrice: String(request.expectedPrice),
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        phone: request.phone,
        preferredContactSchedule: request.preferredContactSchedule,
        notes: request.notes ?? 'N/A',
    });

    await createLog({
        message: `Vehicle appraisal request submitted by ${request.email}`,
        type: 'customer',
        actorId,
        metadata: {
            appraisalRequestId: request._id,
            brand: request.brand,
            model: request.get('model'),
            email: request.email,
        },
    });

    return toResponse(request);
};
