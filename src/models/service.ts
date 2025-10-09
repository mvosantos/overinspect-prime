export type Service = {
  id: string;
  company_id?: string | null;
  service_type_id?: string | null;
  name: string;
  internal_code?: string | null;
  default_price?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type ServiceListParams = {
  per_page?: number;
  limit?: number;
  filters?: Record<string, unknown>;
  sort?: string;
  direction?: string;
};
