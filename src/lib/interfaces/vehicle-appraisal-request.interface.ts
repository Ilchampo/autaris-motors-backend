export const PREFERRED_CONTACT_SCHEDULES = ['morning', 'afternoon', 'evening'] as const;

export type PreferredContactSchedule = (typeof PREFERRED_CONTACT_SCHEDULES)[number];

export interface IVehicleAppraisalRequest {
    brand: string;
    model: string;
    year: number;
    kilometers: number;
    city: string;
    transmission: string;
    fuelType: string;
    color: string;
    expectedPrice: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferredContactSchedule: PreferredContactSchedule;
    notes: string | null;
    createdAt: Date;
}

export type VehicleAppraisalRequestResponse = IVehicleAppraisalRequest & {
    _id: string;
};

export interface CreateVehicleAppraisalRequestParams {
    brand: string;
    model: string;
    year: number;
    kilometers: number;
    city: string;
    transmission: string;
    fuelType: string;
    color: string;
    expectedPrice: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferredContactSchedule: PreferredContactSchedule;
    notes?: string | null;
    actorId?: string | null;
}
