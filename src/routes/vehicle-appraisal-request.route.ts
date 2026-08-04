import { Router } from 'express';

import * as vehicleAppraisalRequestController from '@controllers/vehicle-appraisal-request.controller';
import { optionalAuthenticate } from '@middlewares/auth.middleware';
import { validateRequest } from '@middlewares/validation.middleware';
import { createVehicleAppraisalRequestSchema } from '@schemas/vehicle-appraisal-request.schema';

const router = Router();

// route    POST /api/vehicle-appraisal-requests
// desc     Submit a vehicle appraisal request
// access   public (auth optional for audit actor)
router.post(
    '/',
    optionalAuthenticate,
    validateRequest(createVehicleAppraisalRequestSchema),
    vehicleAppraisalRequestController.createVehicleAppraisalRequest,
);

export default router;
