export const KPI_COMPARISON_STATUSES = ['increase', 'decrease', 'equal'] as const;

export type KpiComparisonStatus = (typeof KPI_COMPARISON_STATUSES)[number];

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface DashboardKpi {
    value: number;
    comparisonStatus: KpiComparisonStatus;
    comparisonValue: number;
}

export interface MonthlyMetricPoint {
    month: string;
    count: number;
    totalAmount?: number;
}

export interface RankedCountItem {
    name: string;
    count: number;
}

export interface DashboardKpis {
    publishedVehicles: DashboardKpi;
    availableVehicles: DashboardKpi;
    soldVehicles: DashboardKpi;
    totalSales: DashboardKpi;
    vehicleInquiries: DashboardKpi;
}

export interface DashboardCharts {
    salesByMonth: MonthlyMetricPoint[];
    inquiriesByMonth: MonthlyMetricPoint[];
    topRequestedBrands: RankedCountItem[];
    topRequestedModels: RankedCountItem[];
}

export interface DashboardResponse {
    period: DateRange;
    comparisonPeriod: DateRange;
    kpis: DashboardKpis;
    charts: DashboardCharts;
}

export interface GetDashboardParams {
    startDate: Date;
    endDate: Date;
}
