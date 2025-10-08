import type { ApiPaginatedResponse, ListParams } from './apiTypes';
import type { Company } from './company';

export interface Subsidiary {
  id: string;
  company_id: string;
  name: string;
  address?: string | null;
  url_address?: string | null;
  doc_number?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  company?: Company;
}

export type SubsidiaryFilters = {
  name?: string;
  doc_number?: string;
};

export type SubsidiaryListParams = ListParams<SubsidiaryFilters>;

export type PaginatedResponse<T> = ApiPaginatedResponse<T>;
