import { Router } from 'express';

import * as vehicleInquiryController from '@controllers/vehicle-inquiry.controller';
import { authenticate, authorize, optionalAuthenticate } from '@middlewares/auth.middleware';
import { validateRequest } from '@middlewares/validation.middleware';
import {
    createVehicleInquirySchema,
    getVehicleInquiriesSchema,
    getVehicleInquiryByIdSchema,
} from '@schemas/vehicle-inquiry.schema';

const router = Router();

// route    POST /api/vehicle-inquiries
// desc     Create a vehicle inquiry and return WhatsApp URL
// access   public (auth optional; required when WhatsApp onlyRegistered is true)
router.post(
    '/',
    optionalAuthenticate,
    validateRequest(createVehicleInquirySchema),
    vehicleInquiryController.createVehicleInquiry,
);

// route    GET /api/vehicle-inquiries
// desc     List vehicle inquiries
// access   private (employee, admin)
router.get(
    '/',
    authenticate,
    authorize('employee', 'admin'),
    validateRequest(getVehicleInquiriesSchema),
    vehicleInquiryController.getVehicleInquiries,
);

// route    GET /api/vehicle-inquiries/:id
// desc     Get a vehicle inquiry by id
// access   private (employee, admin)
router.get(
    '/:id',
    authenticate,
    authorize('employee', 'admin'),
    validateRequest(getVehicleInquiryByIdSchema),
    vehicleInquiryController.getVehicleInquiryById,
);

export default router;
