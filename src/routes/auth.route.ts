import { Router } from 'express';

import { validateRequest } from '@middlewares/validation.middleware';

import * as schemas from '@schemas/auth.schema';
import * as authController from '@controllers/auth.controller';

const router = Router();

// route    POST /api/auth/register
// desc     Register a new user
// access   public
router.post('/register', validateRequest(schemas.registerSchema), authController.register);

// route    POST /api/auth/login
// desc     Login a user
// access   public
router.post('/login', validateRequest(schemas.loginSchema), authController.login);

// route    POST /api/auth/password-recovery
// desc     Request a password recovery
// access   public
router.post(
    '/password-recovery',
    validateRequest(schemas.passwordRecoverySchema),
    authController.requestPasswordRecovery,
);

// route    POST /api/auth/reset-password
// desc     Reset password using a recovery token
// access   public
router.post(
    '/reset-password',
    validateRequest(schemas.resetPasswordSchema),
    authController.resetPassword,
);

export default router;
