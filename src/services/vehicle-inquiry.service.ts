import type { VehicleInquiryDocument } from '@models/vehicle-inquiry.model';
import type {
    CreateVehicleInquiryParams,
    CreateVehicleInquiryResult,
    PaginatedVehicleInquiries,
    VehicleInquiryFilters,
    VehicleInquiryResponse,
} from '@interfaces/vehicle-inquiry.interface';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@constants/pagination.constant';
import { VehicleInquiryModel } from '@models/vehicle-inquiry.model';
import { VehicleModel } from '@models/vehicle.model';
import { createLog } from '@services/log.service';
import { getSystemConfig } from '@services/system-config.service';
import { ConflictError, NotFoundError, UnauthorizedError } from '@utils/errors.util';
import { buildWhatsAppUrl } from '@utils/whatsapp.util';

const toInquiryResponse = (inquiry: VehicleInquiryDocument): VehicleInquiryResponse => {
    return inquiry.toObject() as VehicleInquiryResponse;
};

export const createVehicleInquiry = async (
    params: CreateVehicleInquiryParams,
): Promise<CreateVehicleInquiryResult> => {
    const { vehicleId, authUser } = params;
    const systemConfig = await getSystemConfig();

    if (systemConfig.whatsApp.onlyRegistered && !authUser) {
        throw new UnauthorizedError('Authentication is required to contact the dealership');
    }

    const vehicle = await VehicleModel.findById(vehicleId).exec();

    if (!vehicle || vehicle.status === 'draft' || vehicle.status === 'deleted') {
        throw new NotFoundError('Vehicle not found');
    }

    if (vehicle.status === 'sold') {
        throw new ConflictError('Vehicle already sold');
    }

    const vehicleModel = vehicle.get('model') as string;

    const inquiry = await VehicleInquiryModel.create({
        vehicleId: vehicle._id,
        userId: authUser ? authUser.id : null,
        vehicleTitle: vehicle.title,
        brand: vehicle.brand,
        model: vehicleModel,
    });

    const whatsappUrl = buildWhatsAppUrl({
        phoneNumber: systemConfig.whatsApp.number,
        messageTemplate: systemConfig.whatsApp.message,
        vehicleTitle: vehicle.title,
        price: vehicle.price,
        vehicleId: vehicle._id.toString(),
    });

    await createLog({
        message: `Vehicle inquiry created for ${vehicle.title}`,
        type: 'customer',
        actorId: authUser?.id ?? null,
        metadata: {
            inquiryId: inquiry._id,
            vehicleId: vehicle._id,
            brand: vehicle.brand,
            model: vehicleModel,
        },
    });

    return {
        inquiry: toInquiryResponse(inquiry),
        whatsappUrl,
    };
};

export const getVehicleInquiries = async (
    filters: VehicleInquiryFilters = {},
    options: { page?: number; pageSize?: number } = {},
): Promise<PaginatedVehicleInquiries> => {
    const page = Math.max(options.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.max(options.pageSize ?? DEFAULT_PAGE_SIZE, 1);
    const skip = (page - 1) * pageSize;
    const query: Record<string, unknown> = {};

    if (filters.vehicleId) {
        query['vehicleId'] = filters.vehicleId;
    }

    if (filters.userId) {
        query['userId'] = filters.userId;
    }

    if (filters.brand) {
        query['brand'] = filters.brand;
    }

    if (filters.model) {
        query['model'] = filters.model;
    }

    const [inquiries, totalItems] = await Promise.all([
        VehicleInquiryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize).exec(),
        VehicleInquiryModel.countDocuments(query).exec(),
    ]);

    return {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 0,
        items: inquiries.map(toInquiryResponse),
    };
};

export const getVehicleInquiryById = async (id: string): Promise<VehicleInquiryResponse> => {
    const inquiry = await VehicleInquiryModel.findById(id).exec();

    if (!inquiry) {
        throw new NotFoundError('Vehicle inquiry not found');
    }

    return toInquiryResponse(inquiry);
};
