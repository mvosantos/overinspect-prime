import type { ApiPaginatedResponse, ListParams } from './apiTypes';
import type { Company } from './company';

export interface InspectionSite {
  id: string;
  company_id: string;
  name: string;
  order?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  company?: Company;
}

export type InspectionSiteFilters = {
  name?: string;
};

export type InspectionSiteListParams = ListParams<InspectionSiteFilters>;

export type PaginatedResponse<T> = ApiPaginatedResponse<T>;
