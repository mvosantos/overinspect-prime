interface ITargetStatusProp {
 target_status_id: string; 
 target_status?: {
    id: string;
    name: string;
 }
}

export interface ServiceOrderStatus {
    readonly id: string;
    name: string;
    color: string;
    description?: string;
    is_default?: boolean;
    is_canceled?: boolean;
    is_billable?: boolean;
    is_operating?: boolean;
    enable_editing?: boolean;
    enable_attach?: boolean;
    comment_required?: boolean;
    target_status_id?: string;
    targets?: Array<{ target_status_id: string }>; 
    service_order_status_targets?: ITargetStatusProp[];     
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface ServiceOrderStatusCreation {
    readonly id: string;
    name: string;
    color: string;
    description?: string;
    is_default?: boolean;
    is_canceled?: boolean;
    is_billable?: boolean;
    is_operating?: boolean;
    enable_editing?: boolean;
    enable_attach?: boolean;
    comment_required?: boolean;
    service_order_status_targets?: ITargetStatusProp[]; 
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}