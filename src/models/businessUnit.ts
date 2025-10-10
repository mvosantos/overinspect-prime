export interface BusinessUnit {
  readonly id: string;
  readonly company_id: string;
  name: string;
  internal_code?: string | null; 
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
