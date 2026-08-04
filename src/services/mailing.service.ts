import type { EmailTemplate, EmailTemplateData } from '@interfaces/mailing.interface';

import { EMAIL_TEMPLATES } from '@constants/mailing.constant';
import { resend } from '@instances/resend.instance';
import { buildEmail } from '@utils/mailing.util';

import config from '@lib/config';

export const sendEmail = async <T extends EmailTemplate>(
    to: string,
    template: T,
    data: EmailTemplateData[T],
): Promise<void> => {
    const { subject, html } = buildEmail(EMAIL_TEMPLATES[template], data);

    const { error } = await resend.emails.send({
        from: config.resend.fromEmail,
        to,
        subject,
        html,
    });

    if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
