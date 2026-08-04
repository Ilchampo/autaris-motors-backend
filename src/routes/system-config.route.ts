import { Router } from 'express';

import * as systemConfigController from '@controllers/system-config.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validateRequest } from '@middlewares/validation.middleware';
import { updateSystemConfigSchema } from '@schemas/system-config.schema';

const router = Router();

// route    GET /api/system-config
// desc     Get the global system configuration
// access   public
router.get('/', systemConfigController.getSystemConfig);

// route    PATCH /api/system-config
// desc     Partially update the global system configuration
// access   private (admin)
router.patch(
    '/',
    authenticate,
    authorize('admin'),
    validateRequest(updateSystemConfigSchema),
    systemConfigController.updateSystemConfig,
);

export default router;
