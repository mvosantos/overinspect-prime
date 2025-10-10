export interface Site {
    readonly id: string;
    readonly company_id: string;
    name: string;
    internal_code?: string;
    description?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
}