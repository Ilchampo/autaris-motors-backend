import { Router } from 'express';

import { authenticate, authorize } from '@middlewares/auth.middleware';
import { uploadEntityImage } from '@middlewares/upload.middleware';
import { validateRequest } from '@middlewares/validation.middleware';

import * as entityController from '@controllers/entity.controller';
import * as schemas from '@schemas/entity.schema';

const router = Router();

// route    GET /api/entities
// desc     List active entities for filters UI
// access   public
router.get('/', validateRequest(schemas.getEntitiesSchema), entityController.getEntities);

// route    GET /api/entities/manage
// desc     List entities for admin management (includes inactive)
// access   private (admin)
router.get(
    '/manage',
    authenticate,
    authorize('admin'),
    validateRequest(schemas.getManagedEntitiesSchema),
    entityController.getManagedEntities,
);

// route    GET /api/entities/:id
// desc     Get an active entity by id
// access   public
router.get('/:id', validateRequest(schemas.getEntityByIdSchema), entityController.getEntityById);

// route    POST /api/entities
// desc     Create an entity
// access   private (admin)
router.post(
    '/',
    authenticate,
    authorize('admin'),
    uploadEntityImage,
    validateRequest(schemas.createEntitySchema),
    entityController.createEntity,
);

// route    PATCH /api/entities/:id
// desc     Update an entity
// access   private (admin)
router.patch(
    '/:id',
    authenticate,
    authorize('admin'),
    uploadEntityImage,
    validateRequest(schemas.updateEntitySchema),
    entityController.updateEntity,
);

// route    POST /api/entities/:id/activate
// desc     Activate an entity
// access   private (admin)
router.post(
    '/:id/activate',
    authenticate,
    authorize('admin'),
    validateRequest(schemas.entityIdSchema),
    entityController.activateEntity,
);

// route    POST /api/entities/:id/deactivate
// desc     Deactivate an entity
// access   private (admin)
router.post(
    '/:id/deactivate',
    authenticate,
    authorize('admin'),
    validateRequest(schemas.entityIdSchema),
    entityController.deactivateEntity,
);

// route    DELETE /api/entities/:id
// desc     Soft-delete an entity
// access   private (admin)
router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    validateRequest(schemas.entityIdSchema),
    entityController.deleteEntity,
);

export default router;
