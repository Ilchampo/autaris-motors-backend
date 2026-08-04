import { Router } from 'express';

import * as logController from '@controllers/log.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validateRequest } from '@middlewares/validation.middleware';
import { getLogByIdSchema, getLogsSchema } from '@schemas/log.schema';

const router = Router();

router.use(authenticate, authorize('admin'));

// route    GET /api/logs
// desc     List logs with search, type filter, and pagination
// access   private (admin)
router.get('/', validateRequest(getLogsSchema), logController.getLogs);

// route    GET /api/logs/:id
// desc     Get a log by id
// access   private (admin)
router.get('/:id', validateRequest(getLogByIdSchema), logController.getLogById);

export default router;
