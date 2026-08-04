import type { VehicleDocument } from '@models/vehicle.model';
import type { AuthUser } from '@interfaces/user.interface';
import type * as vi from '@interfaces/vehicle.interface';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@constants/pagination.constant';
import { VEHICLE_IMAGES_MAX } from '@constants/validation.constant';
import { SaleModel } from '@models/sale.model';
import { VehicleModel } from '@models/vehicle.model';
import { createLog } from '@services/log.service';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '@utils/errors.util';
import { generateVehicleTitle } from '@utils/vehicle.util';

import * as c from '@constants/vehicle.constant';

import cloudinary from '@instances/cloudinary.instance';

const assertEmployee = (authUser: AuthUser): void => {
    if (authUser.role !== 'employee' && authUser.role !== 'admin') {
        throw new ForbiddenError('Only employees can manage vehicles');
    }
};

const toVehicleResponse = (vehicle: VehicleDocument): vi.VehicleResponse => {
    return vehicle.toObject() as vi.VehicleResponse;
};

const deleteVehicleImage = async (imageUrl: string): Promise<void> => {
    try {
        await cloudinary.deleteFile(imageUrl, 'image');
    } catch (error) {
        console.error('Failed to delete vehicle image from Cloudinary:', error);
    }
};

const uploadVehicleImages = async (
    imageBuffers: Buffer[],
    primaryImageIndex = 0,
): Promise<vi.IVehicleImage[]> => {
    if (imageBuffers.length > VEHICLE_IMAGES_MAX) {
        throw new BadRequestError(`Vehicles support at most ${VEHICLE_IMAGES_MAX} images`);
    }

    if (primaryImageIndex < 0 || primaryImageIndex >= imageBuffers.length) {
        throw new BadRequestError('primaryImageIndex is out of range');
    }

    const uploaded: vi.IVehicleImage[] = [];

    for (const [index, buffer] of imageBuffers.entries()) {
        const result = await cloudinary.uploadImage(buffer, {
            folder: c.VEHICLE_IMAGE_FOLDER,
        });

        uploaded.push({
            id: result.public_id,
            url: result.secure_url,
            isPrimary: index === primaryImageIndex,
            order: index,
        });
    }

    return uploaded;
};

const replaceVehicleImages = async (
    vehicle: VehicleDocument,
    imageBuffers: Buffer[],
    primaryImageIndex = 0,
): Promise<void> => {
    const previousImages = [...vehicle.images];
    vehicle.images = await uploadVehicleImages(imageBuffers, primaryImageIndex);

    await Promise.all(previousImages.map((image) => deleteVehicleImage(image.url)));
};

const findManagedVehicleOrThrow = async (id: string): Promise<VehicleDocument> => {
    const vehicle = await VehicleModel.findOne({
        _id: id,
        status: { $ne: 'deleted' },
    }).exec();

    if (!vehicle) {
        throw new NotFoundError('Vehicle not found');
    }

    return vehicle;
};

const assertEditable = (vehicle: VehicleDocument): void => {
    if (vehicle.status === 'sold' || vehicle.status === 'deleted') {
        throw new ConflictError('Sold and deleted vehicles cannot be edited');
    }
};

const buildCatalogQuery = (filters: vi.VehicleCatalogFilters): Record<string, unknown> => {
    const query: Record<string, unknown> = { status: 'published' };

    if (filters.title) {
        query['title'] = { $regex: filters.title.trim(), $options: 'i' };
    }

    if (filters.brand) {
        query['brand'] = filters.brand;
    }

    if (filters.model) {
        query['model'] = filters.model;
    }

    if (filters.transmission) {
        query['transmission'] = filters.transmission;
    }

    if (filters.fuelType) {
        query['fuelType'] = filters.fuelType;
    }

    if (filters.vehicleType) {
        query['vehicleType'] = filters.vehicleType;
    }

    if (filters.city) {
        query['city'] = filters.city;
    }

    if (filters.plateLastNumber !== undefined) {
        query['plateLastNumber'] = filters.plateLastNumber;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query['price'] = {
            ...(filters.minPrice !== undefined ? { $gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice } : {}),
        };
    }

    if (filters.minYear !== undefined || filters.maxYear !== undefined) {
        query['year'] = {
            ...(filters.minYear !== undefined ? { $gte: filters.minYear } : {}),
            ...(filters.maxYear !== undefined ? { $lte: filters.maxYear } : {}),
        };
    }

    if (filters.minMileage !== undefined || filters.maxMileage !== undefined) {
        query['kilometers'] = {
            ...(filters.minMileage !== undefined ? { $gte: filters.minMileage } : {}),
            ...(filters.maxMileage !== undefined ? { $lte: filters.maxMileage } : {}),
        };
    }

    return query;
};

const getCatalogSort = (sort: vi.CatalogSortOption): Record<string, 1 | -1> => {
    switch (sort) {
        case 'newest':
            return { publishedAt: -1 };
        case 'priceAsc':
            return { price: 1 };
        case 'priceDesc':
            return { price: -1 };
        case 'yearAsc':
            return { year: 1 };
        case 'yearDesc':
            return { year: -1 };
        case 'mileageAsc':
            return { kilometers: 1 };
        case 'mileageDesc':
            return { kilometers: -1 };
        case 'featuredFirst':
        default:
            return { publishedAt: -1 };
    }
};

const paginateFeaturedFirst = async (
    filters: vi.VehicleCatalogFilters,
    page: number,
): Promise<vi.PaginatedVehicles> => {
    const baseQuery = buildCatalogQuery(filters);
    const pageSize = c.VEHICLE_CATALOG_PAGE_SIZE;

    const [featured, nonFeatured, totalItems] = await Promise.all([
        VehicleModel.find({ ...baseQuery, featured: true })
            .sort({ featuredAt: 1 })
            .exec(),
        VehicleModel.find({ ...baseQuery, featured: false })
            .sort({ publishedAt: -1 })
            .exec(),
        VehicleModel.countDocuments(baseQuery).exec(),
    ]);

    const firstPageFeatured = featured.slice(0, c.VEHICLE_FEATURED_FIRST_PAGE_LIMIT);
    const remainingFeatured = featured.slice(c.VEHICLE_FEATURED_FIRST_PAGE_LIMIT);
    const firstPageNonFeaturedCount = pageSize - firstPageFeatured.length;

    let items: VehicleDocument[];

    if (page === 1) {
        items = [...firstPageFeatured, ...nonFeatured.slice(0, firstPageNonFeaturedCount)];
    } else {
        const remaining = [...remainingFeatured, ...nonFeatured.slice(firstPageNonFeaturedCount)];
        const start = (page - 2) * pageSize;
        items = remaining.slice(start, start + pageSize);
    }

    return {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 0,
        items: items.map(toVehicleResponse),
    };
};

export const getCatalogVehicles = async (
    filters: vi.VehicleCatalogFilters = {},
    options: { page?: number; sort?: vi.CatalogSortOption } = {},
): Promise<vi.PaginatedVehicles> => {
    const page = Math.max(options.page ?? DEFAULT_PAGE, 1);
    const sort = options.sort ?? 'featuredFirst';
    const pageSize = c.VEHICLE_CATALOG_PAGE_SIZE;

    if (sort === 'featuredFirst') {
        return paginateFeaturedFirst(filters, page);
    }

    const query = buildCatalogQuery(filters);
    const skip = (page - 1) * pageSize;

    const [vehicles, totalItems] = await Promise.all([
        VehicleModel.find(query).sort(getCatalogSort(sort)).skip(skip).limit(pageSize).exec(),
        VehicleModel.countDocuments(query).exec(),
    ]);

    return {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 0,
        items: vehicles.map(toVehicleResponse),
    };
};

export const getFeaturedVehicles = async (
    limit: number = c.VEHICLE_FEATURED_FIRST_PAGE_LIMIT,
): Promise<vi.VehicleResponse[]> => {
    const vehicles = await VehicleModel.find({
        status: 'published',
        featured: true,
    })
        .sort({ featuredAt: 1 })
        .limit(limit)
        .exec();

    return vehicles.map(toVehicleResponse);
};

export const getPublicVehicleById = async (id: string): Promise<vi.VehicleResponse> => {
    const vehicle = await VehicleModel.findById(id).exec();

    if (!vehicle || vehicle.status === 'draft' || vehicle.status === 'deleted') {
        throw new NotFoundError('Vehicle not found');
    }

    if (vehicle.status === 'sold') {
        throw new ConflictError('Vehicle already sold');
    }

    return toVehicleResponse(vehicle);
};

export const getManagedVehicles = async (
    filters: vi.VehicleManageFilters = {},
    options: { page?: number; pageSize?: number; sort?: vi.ManageSortOption } = {},
): Promise<vi.PaginatedVehicles> => {
    const page = Math.max(options.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.max(options.pageSize ?? DEFAULT_PAGE_SIZE, 1);
    const sort = options.sort ?? 'createdNewest';
    const skip = (page - 1) * pageSize;

    const query: Record<string, unknown> = {
        status: filters.status ?? { $ne: 'deleted' },
    };

    if (filters.title) {
        query['title'] = { $regex: filters.title.trim(), $options: 'i' };
    }

    if (filters.brand) {
        query['brand'] = filters.brand;
    }

    if (filters.city) {
        query['city'] = filters.city;
    }

    if (filters.status) {
        query['status'] = filters.status;
    }

    const sortMap: Record<vi.ManageSortOption, Record<string, 1 | -1>> = {
        createdNewest: { createdAt: -1 },
        createdOldest: { createdAt: 1 },
        priceAsc: { price: 1 },
        priceDesc: { price: -1 },
    };

    const [vehicles, totalItems] = await Promise.all([
        VehicleModel.find(query).sort(sortMap[sort]).skip(skip).limit(pageSize).exec(),
        VehicleModel.countDocuments(query).exec(),
    ]);

    return {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 0,
        items: vehicles.map(toVehicleResponse),
    };
};

export const getManagedVehicleById = async (id: string): Promise<vi.VehicleResponse> => {
    const vehicle = await findManagedVehicleOrThrow(id);
    return toVehicleResponse(vehicle);
};

export const createVehicle = async (
    params: vi.CreateVehicleParams,
): Promise<vi.VehicleResponse> => {
    const { authUser, imageBuffers = [], primaryImageIndex = 0, status } = params;

    assertEmployee(authUser);

    if (status === 'published' && imageBuffers.length === 0) {
        throw new BadRequestError('Published vehicles require at least one image');
    }

    const images =
        imageBuffers.length > 0 ? await uploadVehicleImages(imageBuffers, primaryImageIndex) : [];

    const title =
        params.title?.trim() || generateVehicleTitle(params.year, params.brand, params.model);

    const featured = Boolean(params.featured) && status === 'published';

    try {
        const vehicle = await VehicleModel.create({
            title,
            featured,
            featuredAt: featured ? new Date() : null,
            price: params.price,
            sellingPrice: null,
            brand: params.brand.trim(),
            model: params.model.trim(),
            year: params.year,
            city: params.city.trim(),
            vehicleType: params.vehicleType.trim(),
            fuelType: params.fuelType.trim(),
            transmission: params.transmission.trim(),
            kilometers: params.kilometers,
            plateInitial: params.plateInitial.trim().toUpperCase(),
            plateLastNumber: params.plateLastNumber,
            engine: params.engine.trim(),
            color: params.color.trim(),
            description: params.description?.trim() || null,
            paymentMethods: params.paymentMethods ?? [],
            images,
            status,
            publishedAt: status === 'published' ? new Date() : null,
            soldAt: null,
            deletedAt: null,
            createdBy: authUser.id,
        });

        await createLog({
            message:
                status === 'published'
                    ? `Vehicle ${vehicle.title} was published by ${authUser.email}`
                    : `Draft vehicle ${vehicle.title} was created by ${authUser.email}`,
            actorId: authUser.id,
            metadata: { vehicleId: vehicle._id, status },
        });

        return toVehicleResponse(vehicle);
    } catch (error) {
        await Promise.all(images.map((image) => deleteVehicleImage(image.url)));
        throw error;
    }
};

export const updateVehicle = async (
    params: vi.UpdateVehicleParams,
): Promise<vi.VehicleResponse> => {
    const { id, authUser, imageBuffers, primaryImageIndex = 0 } = params;

    assertEmployee(authUser);

    const vehicle = await findManagedVehicleOrThrow(id);
    assertEditable(vehicle);

    if (params.title !== undefined) {
        vehicle.title = params.title.trim();
    }

    if (params.price !== undefined) {
        vehicle.price = params.price;
    }

    if (params.brand !== undefined) {
        vehicle.brand = params.brand.trim();
    }

    if (params.model !== undefined) {
        vehicle.set('model', params.model.trim());
    }

    if (params.year !== undefined) {
        vehicle.year = params.year;
    }

    if (params.city !== undefined) {
        vehicle.city = params.city.trim();
    }

    if (params.vehicleType !== undefined) {
        vehicle.vehicleType = params.vehicleType.trim();
    }

    if (params.fuelType !== undefined) {
        vehicle.fuelType = params.fuelType.trim();
    }

    if (params.transmission !== undefined) {
        vehicle.transmission = params.transmission.trim();
    }

    if (params.kilometers !== undefined) {
        vehicle.kilometers = params.kilometers;
    }

    if (params.plateInitial !== undefined) {
        vehicle.plateInitial = params.plateInitial.trim().toUpperCase();
    }

    if (params.plateLastNumber !== undefined) {
        vehicle.plateLastNumber = params.plateLastNumber;
    }

    if (params.engine !== undefined) {
        vehicle.engine = params.engine.trim();
    }

    if (params.color !== undefined) {
        vehicle.color = params.color.trim();
    }

    if (params.description !== undefined) {
        vehicle.description = params.description?.trim() || null;
    }

    if (params.paymentMethods !== undefined) {
        vehicle.paymentMethods = params.paymentMethods;
    }

    if (params.featured !== undefined) {
        if (params.featured && vehicle.status !== 'published') {
            throw new BadRequestError('Only published vehicles can be featured');
        }

        vehicle.featured = params.featured;
    }

    if (imageBuffers && imageBuffers.length > 0) {
        await replaceVehicleImages(vehicle, imageBuffers, primaryImageIndex);
    } else if (params.primaryImageIndex !== undefined && vehicle.images.length > 0) {
        if (primaryImageIndex < 0 || primaryImageIndex >= vehicle.images.length) {
            throw new BadRequestError('primaryImageIndex is out of range');
        }

        vehicle.images = vehicle.images.map((image, index) => ({
            id: image.id,
            url: image.url,
            order: image.order,
            isPrimary: index === primaryImageIndex,
        }));
    }

    await vehicle.save();

    await createLog({
        message: `Vehicle ${vehicle.title} was updated by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { vehicleId: vehicle._id },
    });

    return toVehicleResponse(vehicle);
};

export const publishVehicle = async (
    id: string,
    authUser: AuthUser,
): Promise<vi.VehicleResponse> => {
    assertEmployee(authUser);

    const vehicle = await findManagedVehicleOrThrow(id);

    if (vehicle.status === 'published') {
        throw new ConflictError('Vehicle is already published');
    }

    if (vehicle.status !== 'draft') {
        throw new ConflictError('Only draft vehicles can be published');
    }

    if (vehicle.images.length === 0) {
        throw new BadRequestError('Published vehicles require at least one image');
    }

    vehicle.status = 'published';
    vehicle.publishedAt = new Date();
    await vehicle.save();

    await createLog({
        message: `Vehicle ${vehicle.title} was published by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { vehicleId: vehicle._id },
    });

    return toVehicleResponse(vehicle);
};

export const regenerateVehicleTitle = async (
    id: string,
    authUser: AuthUser,
): Promise<vi.VehicleResponse> => {
    assertEmployee(authUser);

    const vehicle = await findManagedVehicleOrThrow(id);
    assertEditable(vehicle);

    vehicle.title = generateVehicleTitle(
        vehicle.year,
        vehicle.brand,
        vehicle.get('model') as string,
    );
    await vehicle.save();

    await createLog({
        message: `Vehicle title was regenerated for ${vehicle._id} by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { vehicleId: vehicle._id, title: vehicle.title },
    });

    return toVehicleResponse(vehicle);
};

export const markVehicleAsSold = async (
    params: vi.MarkVehicleAsSoldParams,
): Promise<vi.VehicleResponse> => {
    const { id, authUser, sellingPrice, saleDate, advisorId, notes = null } = params;

    assertEmployee(authUser);

    const vehicle = await findManagedVehicleOrThrow(id);

    if (vehicle.status !== 'published') {
        throw new ConflictError('Only published vehicles may be marked as sold');
    }

    const existingSale = await SaleModel.findOne({
        vehicleId: vehicle._id,
        status: 'active',
    }).exec();

    if (existingSale) {
        throw new ConflictError('An active sale already exists for this vehicle');
    }

    const resolvedAdvisorId = advisorId ?? authUser.id;

    await SaleModel.create({
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
        message: `Vehicle ${vehicle.title} was marked as sold by ${authUser.email}`,
        actorId: authUser.id,
        metadata: {
            vehicleId: vehicle._id,
            sellingPrice,
            advisorId: resolvedAdvisorId,
        },
    });

    return toVehicleResponse(vehicle);
};

export const deleteVehicle = async (
    id: string,
    authUser: AuthUser,
): Promise<vi.VehicleResponse> => {
    assertEmployee(authUser);

    const vehicle = await findManagedVehicleOrThrow(id);

    if (vehicle.status === 'sold') {
        throw new ConflictError('Sold vehicles cannot be deleted');
    }

    vehicle.status = 'deleted';
    vehicle.deletedAt = new Date();
    vehicle.featured = false;
    vehicle.featuredAt = null;
    await vehicle.save();

    await createLog({
        message: `Vehicle ${vehicle.title} was deleted by ${authUser.email}`,
        actorId: authUser.id,
        metadata: { vehicleId: vehicle._id },
    });

    return toVehicleResponse(vehicle);
};
