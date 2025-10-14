import type { AttachmentsOrderService } from "../serviceOrder";
import type { Site } from "../Site";

export interface TallyOperation {
    readonly id: string;
    service_order_id: string;
    tally_operation_id: string;
    plate_number?: string;
    ticket?: string;
    site_id?: string;
    site?: Site;
    total_weight?: number;
    gross_weight?: number;
    net_weight?: number;
    latitude?: string;
    longitude?: string;
    date?: Date;
    attachments?: AttachmentsOrderService[];
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}