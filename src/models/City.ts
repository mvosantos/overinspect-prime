import { Region } from "./Region";

export interface City {
    readonly id: string;
    readonly company_id: string;
    region_id: string;
    name: string;
    region?: Region;
    internal_code?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}