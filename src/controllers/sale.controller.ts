import type {
    CreateSaleParams,
    SaleFilters,
    SaleStatus,
    UpdateSaleParams,
} from '@interfaces/sale.interface';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@constants/pagination.constant';
import { controller } from '@utils/controller.util';
import { getAuthUser, getParam, getQueryNumber } from '@utils/request.util';

import * as saleService from '@services/sale.service';

export const getSales = controller(async (req) => {
    const page = getQueryNumber(req, 'page', DEFAULT_PAGE);
    const pageSize = getQueryNumber(req, 'pageSize', DEFAULT_PAGE_SIZE);
    const filters: SaleFilters = {};

    if (typeof req.query['status'] === 'string') {
        filters.status = req.query['status'] as SaleStatus;
    }

    if (typeof req.query['vehicleId'] === 'string') {
        filters.vehicleId = req.query['vehicleId'];
    }

    if (typeof req.query['advisorId'] === 'string') {
        filters.advisorId = req.query['advisorId'];
    }

    const data = await saleService.getSales(filters, { page, pageSize });
    return { data };
});

export const getSaleById = controller(async (req) => {
    const id = getParam(req, 'id');
    const data = await saleService.getSaleById(id);
    return { data };
});

export const createSale = controller(async (req) => {
    const authUser = getAuthUser(req);
    const { vehicleId, sellingPrice, saleDate, advisorId, notes } = req.body as Omit<
        CreateSaleParams,
        'authUser'
    >;

    const params: CreateSaleParams = {
        vehicleId,
        authUser,
        sellingPrice,
        saleDate,
    };

    if (advisorId !== undefined) {
        params.advisorId = advisorId;
    }

    if (notes !== undefined) {
        params.notes = notes;
    }

    const data = await saleService.createSale(params);
    return { statusCode: 201, data };
});

export const updateSale = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const { sellingPrice, saleDate, advisorId, notes } = req.body as Omit<
        UpdateSaleParams,
        'id' | 'authUser'
    >;

    const params: UpdateSaleParams = { id, authUser };

    if (sellingPrice !== undefined) {
        params.sellingPrice = sellingPrice;
    }

    if (saleDate !== undefined) {
        params.saleDate = saleDate;
    }

    if (advisorId !== undefined) {
        params.advisorId = advisorId;
    }

    if (notes !== undefined) {
        params.notes = notes;
    }

    const data = await saleService.updateSale(params);
    return { data };
});

export const cancelSale = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const data = await saleService.cancelSale({ id, authUser });
    return { data };
});
