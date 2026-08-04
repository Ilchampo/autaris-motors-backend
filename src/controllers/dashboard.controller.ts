import { controller } from '@utils/controller.util';

import * as dashboardService from '@services/dashboard.service';

export const getDashboard = controller(async (req) => {
    const startDateQuery = req.query['startDate'];
    const endDateQuery = req.query['endDate'];

    let startDate: Date;
    let endDate: Date;

    if (typeof startDateQuery === 'string' && typeof endDateQuery === 'string') {
        startDate = new Date(startDateQuery);
        endDate = new Date(endDateQuery);
    } else {
        const defaults = dashboardService.getDefaultDashboardRange();
        startDate = defaults.startDate;
        endDate = defaults.endDate;
    }

    const data = await dashboardService.getDashboard({ startDate, endDate });
    return { data };
});
