import { Router } from 'express';

import { optionalAuthenticate } from '@middlewares/auth.middleware';
import { publicWriteRateLimiter } from '@middlewares/rate-limit.middleware';
import { validateRequest } from '@middlewares/validation.middleware';
import { createVehicleAppraisalRequestSchema } from '@schemas/vehicle-appraisal-request.schema';

import * as vehicleAppraisalRequestController from '@controllers/vehicle-appraisal-request.controller';

const router = Router();

// route    POST /api/vehicle-appraisal-requests
// desc     Submit a vehicle appraisal request
// access   public (auth optional for audit actor)
router.post(
    '/',
    publicWriteRateLimiter,
    optionalAuthenticate,
    validateRequest(createVehicleAppraisalRequestSchema),
    vehicleAppraisalRequestController.createVehicleAppraisalRequest,
);

export default router;
