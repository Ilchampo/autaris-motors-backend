import { Router } from 'express';

import * as dashboardController from '@controllers/dashboard.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validateRequest } from '@middlewares/validation.middleware';
import { getDashboardSchema } from '@schemas/dashboard.schema';

const router = Router();

// route    GET /api/dashboard
// desc     Dashboard KPIs and charts
// access   private (employee, admin)
router.get(
    '/',
    authenticate,
    authorize('employee', 'admin'),
    validateRequest(getDashboardSchema),
    dashboardController.getDashboard,
);

export default router;
