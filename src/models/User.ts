import type { Company } from "./company";
import type { Role } from "./Role";
import type { Subsidiary } from "./subsidiary";


export interface User {
    id: string;
    company_id: string;
    email: string;
    name: string;
    email_verified?: boolean;
    roles: unknown[];
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
    company: Company;
    // Adicione outros campos conforme necessário
}

export interface UserUpdate {
    id: string;
    company_id?: string;
    email?: string;
    name?: string;
    email_verified?: boolean;
    roles?: Role[];
    company?: Company;
    subsidiaries?: Subsidiary[]
    // Adicione outros campos conforme necessário
}