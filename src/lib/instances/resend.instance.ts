import { Resend } from 'resend';

import config from '@lib/config';

class ResendSingleton {
    private static instance: Resend;

    private constructor() {}

    public static getInstance(): Resend {
        if (!ResendSingleton.instance) {
            ResendSingleton.instance = new Resend(config.resend.apiKey);
        }
        return ResendSingleton.instance;
    }
}

export const resend = ResendSingleton.getInstance();
