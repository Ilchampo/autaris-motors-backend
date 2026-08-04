import { Router } from 'express';

import * as vehicleController from '@controllers/vehicle.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { uploadVehicleImages } from '@middlewares/upload.middleware';
import { validateRequest } from '@middlewares/validation.middleware';
import {
    createVehicleSchema,
    getCatalogVehiclesSchema,
    getFeaturedVehiclesSchema,
    getManagedVehiclesSchema,
    getVehicleByIdSchema,
    markVehicleAsSoldSchema,
    updateVehicleSchema,
    vehicleIdSchema,
} from '@schemas/vehicle.schema';

const router = Router();
const manageRouter = Router();

// Public catalog
router.get('/', validateRequest(getCatalogVehiclesSchema), vehicleController.getCatalogVehicles);
router.get(
    '/featured',
    validateRequest(getFeaturedVehiclesSchema),
    vehicleController.getFeaturedVehicles,
);
router.get('/:id', validateRequest(getVehicleByIdSchema), vehicleController.getPublicVehicleById);

// Employee / admin management
manageRouter.use(authenticate, authorize('employee', 'admin'));

manageRouter.get(
    '/',
    validateRequest(getManagedVehiclesSchema),
    vehicleController.getManagedVehicles,
);

manageRouter.get(
    '/:id',
    validateRequest(getVehicleByIdSchema),
    vehicleController.getManagedVehicleById,
);

manageRouter.post(
    '/',
    uploadVehicleImages,
    validateRequest(createVehicleSchema),
    vehicleController.createVehicle,
);

manageRouter.patch(
    '/:id',
    uploadVehicleImages,
    validateRequest(updateVehicleSchema),
    vehicleController.updateVehicle,
);

manageRouter.post(
    '/:id/publish',
    validateRequest(vehicleIdSchema),
    vehicleController.publishVehicle,
);

manageRouter.post(
    '/:id/regenerate-title',
    validateRequest(vehicleIdSchema),
    vehicleController.regenerateVehicleTitle,
);

manageRouter.post(
    '/:id/mark-as-sold',
    validateRequest(markVehicleAsSoldSchema),
    vehicleController.markVehicleAsSold,
);

manageRouter.delete('/:id', validateRequest(vehicleIdSchema), vehicleController.deleteVehicle);

router.use('/manage', manageRouter);

export default router;
