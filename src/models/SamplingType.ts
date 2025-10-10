export interface SamplingType {
    readonly id: string;
    readonly company_id: string;
    name: string;
    internal_code: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}