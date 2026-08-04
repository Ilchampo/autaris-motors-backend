import type { Request } from 'express';
import type {
    CatalogSortOption,
    CreateVehicleParams,
    ManageSortOption,
    UpdateVehicleParams,
    VehicleCatalogFilters,
    VehicleManageFilters,
    VehicleStatus,
} from '@interfaces/vehicle.interface';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@constants/pagination.constant';
import { controller } from '@utils/controller.util';
import { BadRequestError } from '@utils/errors.util';
import { getAuthUser, getParam, getQueryNumber } from '@utils/request.util';

import * as vehicleService from '@services/vehicle.service';

const getUploadedBuffers = (req: Request): Buffer[] => {
    if (!req.files || !Array.isArray(req.files)) {
        return [];
    }

    return req.files.map((file) => file.buffer);
};

export const getCatalogVehicles = controller(async (req) => {
    const page = getQueryNumber(req, 'page', DEFAULT_PAGE);
    const sort = (req.query['sort'] as CatalogSortOption | undefined) ?? 'featuredFirst';

    const filters: VehicleCatalogFilters = {};
    const filterKeys = [
        'title',
        'brand',
        'model',
        'transmission',
        'fuelType',
        'vehicleType',
        'city',
    ] as const;

    for (const key of filterKeys) {
        const value = req.query[key];
        if (typeof value === 'string' && value.trim() !== '') {
            filters[key] = value;
        }
    }

    const numericFilters = [
        'minPrice',
        'maxPrice',
        'minYear',
        'maxYear',
        'minMileage',
        'maxMileage',
        'plateLastNumber',
    ] as const;

    for (const key of numericFilters) {
        const value = req.query[key];
        if (value !== undefined) {
            filters[key] = Number(value);
        }
    }

    const data = await vehicleService.getCatalogVehicles(filters, { page, sort });
    return { data };
});

export const getFeaturedVehicles = controller(async (req) => {
    const limitValue = req.query['limit'];
    const data =
        limitValue === undefined
            ? await vehicleService.getFeaturedVehicles()
            : await vehicleService.getFeaturedVehicles(Number(limitValue));
    return { data };
});

export const getPublicVehicleById = controller(async (req) => {
    const id = getParam(req, 'id');
    const data = await vehicleService.getPublicVehicleById(id);
    return { data };
});

export const getManagedVehicles = controller(async (req) => {
    const page = getQueryNumber(req, 'page', DEFAULT_PAGE);
    const pageSize = getQueryNumber(req, 'pageSize', DEFAULT_PAGE_SIZE);
    const sort = (req.query['sort'] as ManageSortOption | undefined) ?? 'createdNewest';

    const filters: VehicleManageFilters = {};

    if (typeof req.query['title'] === 'string') {
        filters.title = req.query['title'];
    }

    if (typeof req.query['brand'] === 'string') {
        filters.brand = req.query['brand'];
    }

    if (typeof req.query['city'] === 'string') {
        filters.city = req.query['city'];
    }

    if (typeof req.query['status'] === 'string') {
        filters.status = req.query['status'] as VehicleStatus;
    }

    const data = await vehicleService.getManagedVehicles(filters, { page, pageSize, sort });
    return { data };
});

export const getManagedVehicleById = controller(async (req) => {
    const id = getParam(req, 'id');
    const data = await vehicleService.getManagedVehicleById(id);
    return { data };
});

export const createVehicle = controller(async (req) => {
    const authUser = getAuthUser(req);
    const body = req.body as Omit<CreateVehicleParams, 'authUser' | 'imageBuffers'>;
    const imageBuffers = getUploadedBuffers(req);

    const params: CreateVehicleParams = {
        authUser,
        price: body.price,
        brand: body.brand,
        model: body.model,
        year: body.year,
        city: body.city,
        vehicleType: body.vehicleType,
        fuelType: body.fuelType,
        transmission: body.transmission,
        kilometers: body.kilometers,
        plateInitial: body.plateInitial,
        plateLastNumber: body.plateLastNumber,
        engine: body.engine,
        color: body.color,
        status: body.status,
    };

    if (body.title !== undefined) {
        params.title = body.title;
    }

    if (body.featured !== undefined) {
        params.featured = body.featured;
    }

    if (body.description !== undefined) {
        params.description = body.description;
    }

    if (body.paymentMethods !== undefined) {
        params.paymentMethods = body.paymentMethods;
    }

    if (body.primaryImageIndex !== undefined) {
        params.primaryImageIndex = body.primaryImageIndex;
    }

    if (imageBuffers.length > 0) {
        params.imageBuffers = imageBuffers;
    }

    const data = await vehicleService.createVehicle(params);
    return { statusCode: 201, data };
});

export const updateVehicle = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const body = req.body as Omit<UpdateVehicleParams, 'id' | 'authUser' | 'imageBuffers'>;
    const imageBuffers = getUploadedBuffers(req);

    const hasUpdates = Object.keys(body).length > 0 || imageBuffers.length > 0;

    if (!hasUpdates) {
        throw new BadRequestError('At least one field must be provided');
    }

    const params: UpdateVehicleParams = { id, authUser };

    if (body.title !== undefined) params.title = body.title;
    if (body.featured !== undefined) params.featured = body.featured;
    if (body.price !== undefined) params.price = body.price;
    if (body.brand !== undefined) params.brand = body.brand;
    if (body.model !== undefined) params.model = body.model;
    if (body.year !== undefined) params.year = body.year;
    if (body.city !== undefined) params.city = body.city;
    if (body.vehicleType !== undefined) params.vehicleType = body.vehicleType;
    if (body.fuelType !== undefined) params.fuelType = body.fuelType;
    if (body.transmission !== undefined) params.transmission = body.transmission;
    if (body.kilometers !== undefined) params.kilometers = body.kilometers;
    if (body.plateInitial !== undefined) params.plateInitial = body.plateInitial;
    if (body.plateLastNumber !== undefined) params.plateLastNumber = body.plateLastNumber;
    if (body.engine !== undefined) params.engine = body.engine;
    if (body.color !== undefined) params.color = body.color;
    if (body.description !== undefined) params.description = body.description;
    if (body.paymentMethods !== undefined) params.paymentMethods = body.paymentMethods;
    if (body.primaryImageIndex !== undefined) params.primaryImageIndex = body.primaryImageIndex;
    if (imageBuffers.length > 0) params.imageBuffers = imageBuffers;

    const data = await vehicleService.updateVehicle(params);
    return { data };
});

export const publishVehicle = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const data = await vehicleService.publishVehicle(id, authUser);
    return { data };
});

export const regenerateVehicleTitle = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const data = await vehicleService.regenerateVehicleTitle(id, authUser);
    return { data };
});

export const markVehicleAsSold = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const { sellingPrice, saleDate, advisorId, notes } = req.body as {
        sellingPrice: number;
        saleDate: Date;
        advisorId?: string;
        notes?: string | null;
    };

    const params: Parameters<typeof vehicleService.markVehicleAsSold>[0] = {
        id,
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

    const data = await vehicleService.markVehicleAsSold(params);
    return { data };
});

export const deleteVehicle = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const data = await vehicleService.deleteVehicle(id, authUser);
    return { data };
});
