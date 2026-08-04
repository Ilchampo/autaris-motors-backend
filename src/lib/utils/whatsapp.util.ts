import config from '@lib/config';

interface BuildWhatsAppUrlParams {
    phoneNumber: string;
    messageTemplate: string;
    vehicleTitle: string;
    price: number;
    vehicleId: string;
}

export const buildWhatsAppUrl = ({
    phoneNumber,
    messageTemplate,
    vehicleTitle,
    price,
    vehicleId,
}: BuildWhatsAppUrlParams): string => {
    const digits = phoneNumber.replace(/\D/g, '');
    const vehicleUrl = new URL(`/vehicles/${vehicleId}`, config.app.frontendUrl).toString();

    const message = messageTemplate
        .replaceAll('{{vehicleTitle}}', vehicleTitle)
        .replaceAll('{{price}}', String(price))
        .replaceAll('{{vehicleUrl}}', vehicleUrl);

    const url = new URL(`https://wa.me/${digits}`);
    url.searchParams.set('text', message);

    return url.toString();
};
