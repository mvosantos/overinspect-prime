export interface DocumentType {
    readonly id: string;
    readonly company_id: string;
    name: string;
    internal_code?: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}