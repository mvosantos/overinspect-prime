import api from './api';

export interface Company {
  id: string;
  name: string;
}

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

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: unknown[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

const BASE = '/admin/subsidiary';

export const listSubsidiaries = async (params: { page?: number; per_page?: number; limit?: number; search?: string; filters?: Record<string, string | undefined>; sort?: string | null; direction?: 'asc' | 'desc' | null }) => {
  // Use 'limit' param for page size (default 20) and 'sort'/'direction' for ordering.
  const effectiveLimit = params.limit ?? params.per_page ?? 20;
  const merged = { ...params } as Record<string, unknown>;
  merged.limit = effectiveLimit;

  if (params.filters) {
    Object.entries(params.filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') merged[k] = v;
    });
    delete merged.filters;
  }

  if (params.sort) merged.sort = params.sort;
  if (params.direction) merged.direction = params.direction;

  // remove old per_page if present to avoid confusion
  if ('per_page' in merged) delete merged.per_page;

  const res = await api.get<PaginatedResponse<Subsidiary>>(BASE, { params: merged });
  return res.data;
};

export const getSubsidiary = async (id: string): Promise<Subsidiary | null> => {
  const res = await api.get(`${BASE}/${id}`);
  // API sometimes returns { data: Subsidiary } (index-like) or the Subsidiary object directly (show endpoint)
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Subsidiary;
    return res.data as Subsidiary;
  }
  return null;
};

export const createSubsidiary = async (payload: Partial<Subsidiary>): Promise<Subsidiary> => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  // If API returned full object, normalize and return
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    // If API already returned the full object (has name/company etc), return it
    const hasFields = ('name' in maybe) || ('company' in maybe);
    if (hasFields) return maybe as Subsidiary;
    // otherwise fetch the full resource
    return (await getSubsidiary(maybe.id)) as Subsidiary;
  }
  throw new Error('Invalid response from create subsidiary');
};

export const updateSubsidiary = async (id: string, payload: Partial<Subsidiary>): Promise<Subsidiary> => {
  await api.put(`${BASE}/${id}`, payload);
  // After update, fetch fresh resource
  const fresh = await getSubsidiary(id);
  if (!fresh) throw new Error('Failed to fetch subsidiary after update');
  return fresh;
};

export const deleteSubsidiary = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

export const listCompanies = async () => {
  const res = await api.get<{ data: Company[] }>('/admin/company', { params: { per_page: 200 } });
  return res.data.data;
};

export default {
  listSubsidiaries,
  getSubsidiary,
  createSubsidiary,
  updateSubsidiary,
  deleteSubsidiary,
  listCompanies,
};
