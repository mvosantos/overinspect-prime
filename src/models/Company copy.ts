import { Subsidiary } from "./Subsidiary";

export interface Company {
    id: string;
    name: string;
    address: string;
    url_address: string;
    doc_number: string;
    created_at: Date;
    updated_at: Date;
    subsidiaries?: Subsidiary[];
}