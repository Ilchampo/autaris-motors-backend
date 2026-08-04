import { VEHICLE_TITLE_MAX_LENGTH, VEHICLE_TITLE_MIN_LENGTH } from '@constants/validation.constant';

export const generateVehicleTitle = (year: number, brand: string, model: string): string => {
    const title = `${year} ${brand.trim()} ${model.trim()}`.replace(/\s+/g, ' ').trim();

    if (title.length < VEHICLE_TITLE_MIN_LENGTH) {
        return title.padEnd(VEHICLE_TITLE_MIN_LENGTH, '.');
    }

    return title.slice(0, VEHICLE_TITLE_MAX_LENGTH);
};
