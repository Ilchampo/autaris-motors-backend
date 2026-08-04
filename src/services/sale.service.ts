import type { SaleDocument } from '@models/sale.model';
import type { AuthUser } from '@interfaces/user.interface';
import type {
    CancelSaleParams,
    CreateSaleParams,
    PaginatedSales,
    SaleFilters,
    SaleResponse,
    UpdateSaleParams,
} from '@interfaces/sale.interface';

import { Types } from 'mongoose';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@constants/pagination.constant';
import { SaleModel } from '@models/sale.model';
import { VehicleModel } from '@models/vehicle.model';
import { createLog } from '@services/log.service';
import { ConflictError, ForbiddenError, NotFoundError } from '@utils/errors.util';

const assertEmployee = (authUser: AuthUser): void => {
    if (authUser.role !== 'employee' && authUser.role !== 'admin') {
        throw new ForbiddenError('Only employees can manage sales');
    }
};

const assertAdmin = (authUser: AuthUser): void => {
    if (authUser.role !== 'admin') {
        throw new ForbiddenError('Only administrators can perform this action');
    }
};

const toSaleResponse = (sale: SaleDocument): SaleResponse => {
    return sale.toObject() as SaleResponse;
};

const findSaleOrThrow = async (id: string): Promise<SaleDocument> => {
    const sale = await SaleModel.findById(id).exec();

    if (!sale) {
        throw new NotFoundError('Sale not found');
    }

    return sale;
};

export const getSales = async (
    filters: SaleFilters = {},
    options: { page?: number; pageSize?: number } = {},
): Promise<PaginatedSales> => {
    const page = Math.max(options.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.max(options.pageSize ?? DEFAULT_PAGE_SIZE, 1);
    const skip = (page - 1) * pageSize;
    const query: Record<string, unknown> = {};

    if (filters.status) {
        query['status'] = filters.status;
    }

    if (filters.vehicleId) {
        query['vehicleId'] = filters.vehicleId;
    }

    if (filters.advisorId) {
        query['advisorId'] = filters.advisorId;
    }

    const [sales, totalItems] = await Promise.all([
        SaleModel.find(query)
            .sort({ saleDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .exec(),
        SaleModel.countDocuments(query).exec(),
    ]);

    return {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 0,
        items: sales.map(toSaleResponse),
    };
};

export const getSaleById = async (id: string): Promise<SaleResponse> => {
    const sale = await findSaleOrThrow(id);
    return toSaleResponse(sale);
};

export const createSale = async (params: CreateSaleParams): Promise<SaleResponse> => {
    const { vehicleId, authUser, sellingPrice, saleDate, advisorId, notes = null } = params;

    assertEmployee(authUser);

    const vehicle = await VehicleModel.findOne({
        _id: vehicleId,
        status: { $ne: 'deleted' },
    }).exec();

    if (!vehicle) {
        throw new NotFoundError('Vehicle not found');
    }

    if (vehicle.status !== 'published') {
        throw new ConflictError('Only published vehicles may be sold');
    }

    const existingSale = await SaleModel.findOne({
        vehicleId: vehicle._id,
        status: 'active',
    }).exec();

    if (existingSale) {
        throw new ConflictError('An active sale already exists for this vehicle');
    }

    const resolvedAdvisorId = advisorId ?? authUser.id;

    const sale = await SaleModel.create({
        vehicleId: vehicle._id,
        advisorId: resolvedAdvisorId,
        sellingPrice,
        saleDate,
        notes,
        status: 'active',
        createdBy: authUser.id,
        updatedBy: null,
    });

    vehicle.status = 'sold';
    vehicle.sellingPrice = sellingPrice;
    vehicle.soldAt = saleDate;
    vehicle.featured = false;
    vehicle.featuredAt = null;
    await vehicle.save();

    await createLog({
        message: `Sale created for vehicle ${vehicle.title} by ${authUser.email}`,
        actorId: authUser.id,
        metadata: {
            saleId: sale._id,
            vehicleId: vehicle._id,
            sellingPrice,
            advisorId: resolvedAdvisorId,
        },
    });

    return toSaleResponse(sale);
};

export const updateSale = async (params: UpdateSaleParams): Promise<SaleResponse> => {
    const { id, authUser, sellingPrice, saleDate, advisorId, notes } = params;

    assertAdmin(authUser);

    const sale = await findSaleOrThrow(id);

    if (sale.status !== 'active') {
        throw new ConflictError('Only active sales can be updated');
    }

    if (sellingPrice !== undefined) {
        sale.sellingPrice = sellingPrice;
    }

    if (saleDate !== undefined) {
        sale.saleDate = saleDate;
    }

    if (advisorId !== undefined) {
        sale.advisorId = new Types.ObjectId(advisorId);
    }

    if (notes !== undefined) {
        sale.notes = notes;
    }

    sale.updatedBy = new Types.ObjectId(authUser.id);
    await sale.save();

    if (sellingPrice !== undefined || saleDate !== undefined) {
        const vehicle = await VehicleModel.findById(sale.vehicleId).exec();

        if (vehicle && vehicle.status === 'sold') {
            if (sellingPrice !== undefined) {
                vehicle.sellingPrice = sellingPrice;
            }

            if (saleDate !== undefined) {
                vehicle.soldAt = saleDate;
            }

            await vehicle.save();
        }
    }

    await createLog({
        message: `Sale ${sale._id} was updated by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { saleId: sale._id, vehicleId: sale.vehicleId },
    });

    return toSaleResponse(sale);
};

export const cancelSale = async (params: CancelSaleParams): Promise<SaleResponse> => {
    const { id, authUser } = params;

    assertAdmin(authUser);

    const sale = await findSaleOrThrow(id);

    if (sale.status !== 'active') {
        throw new ConflictError('Sale is already cancelled');
    }

    const vehicle = await VehicleModel.findById(sale.vehicleId).exec();

    if (!vehicle) {
        throw new NotFoundError('Associated vehicle not found');
    }

    sale.status = 'cancelled';
    sale.updatedBy = new Types.ObjectId(authUser.id);
    await sale.save();

    vehicle.status = 'published';
    vehicle.sellingPrice = null;
    vehicle.soldAt = null;
    vehicle.publishedAt = new Date();
    await vehicle.save();

    await createLog({
        message: `Sale ${sale._id} was cancelled by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { saleId: sale._id, vehicleId: vehicle._id },
    });

    return toSaleResponse(sale);
};
