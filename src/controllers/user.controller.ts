import type {
    CreateUserParams,
    Role,
    UpdateUserParams,
    UpdateUserPasswordParams,
} from '@interfaces/user.interface';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@constants/pagination.constant';
import { controller } from '@utils/controller.util';
import { BadRequestError, NotFoundError } from '@utils/errors.util';
import { getAuthUser, getParam, getQueryNumber } from '@utils/request.util';

import * as userService from '@services/user.service';

export const getUserById = controller(async (req) => {
    const id = getParam(req, 'id');
    const user = await userService.getUserById(id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return { data: user };
});

export const getUserByEmail = controller(async (req) => {
    const email = req.query['email'];

    if (typeof email !== 'string' || email.trim() === '') {
        throw new BadRequestError('Missing query parameter: email');
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return { data: user };
});

export const getAllUsers = controller(async (req) => {
    const page = getQueryNumber(req, 'page', DEFAULT_PAGE);
    const pageSize = getQueryNumber(req, 'pageSize', DEFAULT_PAGE_SIZE);
    const data = await userService.getAllUsers(page, pageSize);

    return { data };
});

export const createUser = controller(async (req) => {
    const authUser = getAuthUser(req);
    const { firstName, lastName, email, phone, role } = req.body as Omit<
        CreateUserParams,
        'authUser'
    >;

    if (!firstName || !lastName || !email || !phone || !role) {
        throw new BadRequestError('firstName, lastName, email, phone and role are required');
    }

    const data = await userService.createUser({
        firstName,
        lastName,
        email,
        phone,
        role,
        authUser,
    });

    return { statusCode: 201, data };
});

export const updateUser = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');

    const { firstName, lastName, phone, role } = req.body as {
        firstName?: string;
        lastName?: string;
        phone?: string;
        role?: Role;
    };

    const params: UpdateUserParams = { id, authUser };

    if (firstName !== undefined) {
        params.firstName = firstName;
    }

    if (lastName !== undefined) {
        params.lastName = lastName;
    }

    if (phone !== undefined) {
        params.phone = phone;
    }

    if (role !== undefined) {
        params.role = role;
    }

    const data = await userService.updateUser(params);

    return { data };
});

export const updateUserPassword = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');

    const { password, currentPassword, isFromRecovery } = req.body as {
        password?: string;
        currentPassword?: string;
        isFromRecovery?: boolean;
    };

    if (!password) {
        throw new BadRequestError('password is required');
    }

    const params: UpdateUserPasswordParams = {
        id,
        password,
        authUser,
    };

    if (currentPassword) {
        params.currentPassword = currentPassword;
    }

    if (isFromRecovery) {
        params.isFromRecovery = isFromRecovery;
    }

    const data = await userService.updateUserPassword(params);

    return { data };
});

export const deleteUser = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const data = await userService.deleteUser({ id, authUser });

    return { data };
});

export const activateUser = controller(async (req) => {
    const authUser = getAuthUser(req);
    const id = getParam(req, 'id');
    const data = await userService.activateUser({ id, authUser });

    return { data };
});
