import type { Company } from './company';

export interface Site {
    readonly id: string;
    readonly company_id: string;
    name: string;
    internal_code?: string | null;
    description?: string | null;
    address?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    company?: Company;
    inspection_site?: unknown | null;
    inspection_site_id?: string | null;
}