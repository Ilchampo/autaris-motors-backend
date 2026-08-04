import type {
    DashboardCharts,
    DashboardKpi,
    DashboardResponse,
    DateRange,
    GetDashboardParams,
    KpiComparisonStatus,
    MonthlyMetricPoint,
    RankedCountItem,
} from '@interfaces/dashboard.interface';

import { SaleModel } from '@models/sale.model';
import { VehicleInquiryModel } from '@models/vehicle-inquiry.model';
import { VehicleModel } from '@models/vehicle.model';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toMonthKey = (year: number, month: number): string => {
    return `${year}-${String(month).padStart(2, '0')}`;
};

const startOfUtcDay = (date: Date): Date => {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const endOfUtcDay = (date: Date): Date => {
    return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
    );
};

const buildComparisonPeriod = (period: DateRange): DateRange => {
    const durationMs = period.endDate.getTime() - period.startDate.getTime();
    const endDate = new Date(period.startDate.getTime() - 1);
    const startDate = new Date(endDate.getTime() - durationMs);

    return { startDate, endDate };
};

const buildKpi = (current: number, previous: number): DashboardKpi => {
    let comparisonStatus: KpiComparisonStatus = 'equal';

    if (current > previous) {
        comparisonStatus = 'increase';
    } else if (current < previous) {
        comparisonStatus = 'decrease';
    }

    return {
        value: current,
        comparisonStatus,
        comparisonValue: previous,
    };
};

const countPublishedVehicles = async (range: DateRange): Promise<number> => {
    return VehicleModel.countDocuments({
        publishedAt: { $gte: range.startDate, $lte: range.endDate },
    }).exec();
};

const countAvailableVehicles = async (asOf: Date): Promise<number> => {
    return VehicleModel.countDocuments({
        publishedAt: { $ne: null, $lte: asOf },
        $and: [
            {
                $or: [{ soldAt: null }, { soldAt: { $gt: asOf } }],
            },
            {
                $or: [{ deletedAt: null }, { deletedAt: { $gt: asOf } }],
            },
        ],
    }).exec();
};

const getSalesMetrics = async (
    range: DateRange,
): Promise<{ soldVehicles: number; totalSales: number }> => {
    const [result] = await SaleModel.aggregate<{ soldVehicles: number; totalSales: number }>([
        {
            $match: {
                status: 'active',
                saleDate: { $gte: range.startDate, $lte: range.endDate },
            },
        },
        {
            $group: {
                _id: null,
                soldVehicles: { $sum: 1 },
                totalSales: { $sum: '$sellingPrice' },
            },
        },
    ]).exec();

    return {
        soldVehicles: result?.soldVehicles ?? 0,
        totalSales: result?.totalSales ?? 0,
    };
};

const countVehicleInquiries = async (range: DateRange): Promise<number> => {
    return VehicleInquiryModel.countDocuments({
        createdAt: { $gte: range.startDate, $lte: range.endDate },
    }).exec();
};

const buildLastSixMonthWindows = (now: Date): DateRange[] => {
    const windows: DateRange[] = [];
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    for (let offset = 5; offset >= 0; offset -= 1) {
        const monthDate = new Date(Date.UTC(currentYear, currentMonth - offset, 1));
        const startDate = new Date(
            Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1),
        );
        const endDate = new Date(
            Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0, 23, 59, 59, 999),
        );

        windows.push({ startDate, endDate });
    }

    return windows;
};

const getSalesByMonth = async (windows: DateRange[]): Promise<MonthlyMetricPoint[]> => {
    const rangeStart = windows[0]?.startDate;
    const rangeEnd = windows[windows.length - 1]?.endDate;

    if (!rangeStart || !rangeEnd) {
        return [];
    }

    const rows = await SaleModel.aggregate<{
        _id: { year: number; month: number };
        count: number;
        totalAmount: number;
    }>([
        {
            $match: {
                status: 'active',
                saleDate: { $gte: rangeStart, $lte: rangeEnd },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$saleDate' },
                    month: { $month: '$saleDate' },
                },
                count: { $sum: 1 },
                totalAmount: { $sum: '$sellingPrice' },
            },
        },
    ]).exec();

    const byMonth = new Map(
        rows.map((row) => [
            toMonthKey(row._id.year, row._id.month),
            { count: row.count, totalAmount: row.totalAmount },
        ]),
    );

    return windows.map((window) => {
        const month = toMonthKey(window.startDate.getUTCFullYear(), window.startDate.getUTCMonth() + 1);
        const metrics = byMonth.get(month);

        return {
            month,
            count: metrics?.count ?? 0,
            totalAmount: metrics?.totalAmount ?? 0,
        };
    });
};

const getInquiriesByMonth = async (windows: DateRange[]): Promise<MonthlyMetricPoint[]> => {
    const rangeStart = windows[0]?.startDate;
    const rangeEnd = windows[windows.length - 1]?.endDate;

    if (!rangeStart || !rangeEnd) {
        return [];
    }

    const rows = await VehicleInquiryModel.aggregate<{
        _id: { year: number; month: number };
        count: number;
    }>([
        {
            $match: {
                createdAt: { $gte: rangeStart, $lte: rangeEnd },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                count: { $sum: 1 },
            },
        },
    ]).exec();

    const byMonth = new Map(
        rows.map((row) => [toMonthKey(row._id.year, row._id.month), row.count]),
    );

    return windows.map((window) => {
        const month = toMonthKey(window.startDate.getUTCFullYear(), window.startDate.getUTCMonth() + 1);

        return {
            month,
            count: byMonth.get(month) ?? 0,
        };
    });
};

const getTopRequested = async (
    range: DateRange,
    field: 'brand' | 'model',
): Promise<RankedCountItem[]> => {
    const rows = await VehicleInquiryModel.aggregate<{ _id: string; count: number }>([
        {
            $match: {
                createdAt: { $gte: range.startDate, $lte: range.endDate },
            },
        },
        {
            $group: {
                _id: `$${field}`,
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 5 },
    ]).exec();

    return rows.map((row) => ({
        name: row._id,
        count: row.count,
    }));
};

export const getDashboard = async (params: GetDashboardParams): Promise<DashboardResponse> => {
    const period: DateRange = {
        startDate: startOfUtcDay(params.startDate),
        endDate: endOfUtcDay(params.endDate),
    };
    const comparisonPeriod = buildComparisonPeriod(period);
    const monthWindows = buildLastSixMonthWindows(new Date());

    const [
        publishedCurrent,
        publishedPrevious,
        availableCurrent,
        availablePrevious,
        salesCurrent,
        salesPrevious,
        inquiriesCurrent,
        inquiriesPrevious,
        salesByMonth,
        inquiriesByMonth,
        topRequestedBrands,
        topRequestedModels,
    ] = await Promise.all([
        countPublishedVehicles(period),
        countPublishedVehicles(comparisonPeriod),
        countAvailableVehicles(period.endDate),
        countAvailableVehicles(comparisonPeriod.endDate),
        getSalesMetrics(period),
        getSalesMetrics(comparisonPeriod),
        countVehicleInquiries(period),
        countVehicleInquiries(comparisonPeriod),
        getSalesByMonth(monthWindows),
        getInquiriesByMonth(monthWindows),
        getTopRequested(period, 'brand'),
        getTopRequested(period, 'model'),
    ]);

    const charts: DashboardCharts = {
        salesByMonth,
        inquiriesByMonth,
        topRequestedBrands,
        topRequestedModels,
    };

    return {
        period,
        comparisonPeriod,
        kpis: {
            publishedVehicles: buildKpi(publishedCurrent, publishedPrevious),
            availableVehicles: buildKpi(availableCurrent, availablePrevious),
            soldVehicles: buildKpi(salesCurrent.soldVehicles, salesPrevious.soldVehicles),
            totalSales: buildKpi(salesCurrent.totalSales, salesPrevious.totalSales),
            vehicleInquiries: buildKpi(inquiriesCurrent, inquiriesPrevious),
        },
        charts,
    };
};

export const getDefaultDashboardRange = (now = new Date()): DateRange => {
    const endDate = endOfUtcDay(now);
    const startDate = startOfUtcDay(new Date(endDate.getTime() - 29 * MS_PER_DAY));

    return { startDate, endDate };
};
