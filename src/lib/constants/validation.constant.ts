export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;

export const PHONE_MIN_LENGTH = 7;
export const PHONE_MAX_LENGTH = 20;

export const PASSWORD_MIN_LENGTH = 8;

export const VEHICLE_TITLE_MIN_LENGTH = 5;
export const VEHICLE_TITLE_MAX_LENGTH = 120;

export const VEHICLE_PRICE_MIN = 0.01;
export const VEHICLE_PRICE_MAX = 999_999.99;

export const VEHICLE_YEAR_MIN = 1950;

export const VEHICLE_MILEAGE_MIN = 0;
export const VEHICLE_MILEAGE_MAX = 999_999;

export const VEHICLE_ENGINE_MAX_LENGTH = 50;
export const VEHICLE_COLOR_MAX_LENGTH = 50;
export const VEHICLE_DESCRIPTION_MAX_LENGTH = 3000;

export const VEHICLE_IMAGES_MAX = 10;

export const PLATE_INITIAL_REGEX = /^[A-Z]$/;
export const PLATE_LAST_NUMBER_MIN = 0;
export const PLATE_LAST_NUMBER_MAX = 9;

export const SALE_NOTES_MAX_LENGTH = 1000;
export const APPRAISAL_NOTES_MAX_LENGTH = 1000;

export const WHATSAPP_MESSAGE_MIN_LENGTH = 1;
export const WHATSAPP_MESSAGE_MAX_LENGTH = 1000;
export const WHATSAPP_ALLOWED_PLACEHOLDERS = ['vehicleTitle', 'price', 'vehicleUrl'] as const;

export const CONTACT_ADDRESS_MIN_LENGTH = 1;
export const CONTACT_ADDRESS_MAX_LENGTH = 250;
