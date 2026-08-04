import { Router } from 'express';

import * as saleController from '@controllers/sale.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validateRequest } from '@middlewares/validation.middleware';
import {
    cancelSaleSchema,
    createSaleSchema,
    getSaleByIdSchema,
    getSalesSchema,
    updateSaleSchema,
} from '@schemas/sale.schema';

const router = Router();

router.use(authenticate);

// route    GET /api/sales
// desc     List sales
// access   private (employee, admin)
router.get(
    '/',
    authorize('employee', 'admin'),
    validateRequest(getSalesSchema),
    saleController.getSales,
);

// route    GET /api/sales/:id
// desc     Get a sale by id
// access   private (employee, admin)
router.get(
    '/:id',
    authorize('employee', 'admin'),
    validateRequest(getSaleByIdSchema),
    saleController.getSaleById,
);

// route    POST /api/sales
// desc     Create a sale and mark the vehicle as sold
// access   private (employee, admin)
router.post(
    '/',
    authorize('employee', 'admin'),
    validateRequest(createSaleSchema),
    saleController.createSale,
);

// route    PATCH /api/sales/:id
// desc     Update an active sale
// access   private (admin)
router.patch(
    '/:id',
    authorize('admin'),
    validateRequest(updateSaleSchema),
    saleController.updateSale,
);

// route    POST /api/sales/:id/cancel
// desc     Cancel an active sale and republish the vehicle
// access   private (admin)
router.post(
    '/:id/cancel',
    authorize('admin'),
    validateRequest(cancelSaleSchema),
    saleController.cancelSale,
);

export default router;
