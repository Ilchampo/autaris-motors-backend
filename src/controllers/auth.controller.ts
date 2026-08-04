import type { LoginParams, RegisterParams } from '@interfaces/auth.interface';

import { controller } from '@utils/controller.util';

import * as authService from '@services/auth.service';

export const register = controller(async (req) => {
    const { firstName, lastName, email, phone, password } = req.body as RegisterParams;

    const data = await authService.register({
        firstName,
        lastName,
        email,
        phone,
        password,
    });

    return { statusCode: 201, data };
});

export const login = controller(async (req) => {
    const { email, password } = req.body as LoginParams;
    const data = await authService.login({ email, password });

    return { data };
});

export const requestPasswordRecovery = controller(async (req) => {
    const { email } = req.body as { email: string };

    await authService.requestPasswordRecovery(email);

    return {
        data: {
            message:
                'If an account exists for this email, password recovery instructions have been sent',
        },
    };
});
