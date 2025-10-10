export interface Region {
    readonly id: string;
    name: string;
    internal_code?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}