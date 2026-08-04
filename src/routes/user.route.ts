import { Router } from 'express';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { validateRequest } from '@middlewares/validation.middleware';

import * as schemas from '@schemas/user.schema';
import * as userController from '@controllers/user.controller';

const router = Router();

router.use(authenticate);

// route    GET /api/users
// desc     Get all users
// access   private
router.get(
    '/',
    authorize('admin'),
    validateRequest(schemas.getAllUsersSchema),
    userController.getAllUsers,
);

// route    GET /api/users/by-email
// desc     Get a user by email
// access   private
router.get(
    '/by-email',
    authorize('admin'),
    validateRequest(schemas.getUserByEmailSchema),
    userController.getUserByEmail,
);

// route    GET /api/users/:id
// desc     Get a user by id
// access   private
router.get(
    '/:id',
    authorize('admin'),
    validateRequest(schemas.getUserByIdSchema),
    userController.getUserById,
);

// route    POST /api/users
// desc     Create a new user
// access   private
router.post(
    '/',
    authorize('admin'),
    validateRequest(schemas.createUserSchema),
    userController.createUser,
);

// route    PATCH /api/users/:id
// desc     Update a user
// access   private
router.patch(
    '/:id',
    authorize('admin'),
    validateRequest(schemas.updateUserSchema),
    userController.updateUser,
);

// route    PATCH /api/users/:id/password
// desc     Update a user's password
// access   private
router.patch(
    '/:id/password',
    validateRequest(schemas.updateUserPasswordSchema),
    userController.updateUserPassword,
);

// route    DELETE /api/users/:id
// desc     Delete a user
// access   private
router.delete(
    '/:id',
    authorize('admin'),
    validateRequest(schemas.deleteUserSchema),
    userController.deleteUser,
);

// route    POST /api/users/:id/activate
// desc     Activate a user
// access   private
router.post(
    '/:id/activate',
    authorize('admin'),
    validateRequest(schemas.activateUserSchema),
    userController.activateUser,
);

export default router;
