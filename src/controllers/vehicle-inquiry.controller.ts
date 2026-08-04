import type { CreateVehicleInquiryParams } from '@interfaces/vehicle-inquiry.interface';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@constants/pagination.constant';
import { controller } from '@utils/controller.util';
import { getParam, getQueryNumber } from '@utils/request.util';

import * as vehicleInquiryService from '@services/vehicle-inquiry.service';

import '@interfaces/express.interface';

export const createVehicleInquiry = controller(async (req) => {
    const { vehicleId } = req.body as { vehicleId: string };
    const params: CreateVehicleInquiryParams = { vehicleId };

    if (req.user) {
        params.authUser = req.user;
    }

    const data = await vehicleInquiryService.createVehicleInquiry(params);
    return { statusCode: 201, data };
});

export const getVehicleInquiries = controller(async (req) => {
    const page = getQueryNumber(req, 'page', DEFAULT_PAGE);
    const pageSize = getQueryNumber(req, 'pageSize', DEFAULT_PAGE_SIZE);
    const filters: {
        vehicleId?: string;
        userId?: string;
        brand?: string;
        model?: string;
    } = {};

    if (typeof req.query['vehicleId'] === 'string') {
        filters.vehicleId = req.query['vehicleId'];
    }

    if (typeof req.query['userId'] === 'string') {
        filters.userId = req.query['userId'];
    }

    if (typeof req.query['brand'] === 'string') {
        filters.brand = req.query['brand'];
    }

    if (typeof req.query['model'] === 'string') {
        filters.model = req.query['model'];
    }

    const data = await vehicleInquiryService.getVehicleInquiries(filters, { page, pageSize });
    return { data };
});

export const getVehicleInquiryById = controller(async (req) => {
    const id = getParam(req, 'id');
    const data = await vehicleInquiryService.getVehicleInquiryById(id);
    return { data };
});
