import api from './api';
import type { ApiPaginatedResponse, CrudService } from '../models/apiTypes';
import type { Subsidiary, SubsidiaryListParams } from '../models/subsidiary';
import type { Company } from '../models/company';

const BASE = '/admin/subsidiary';

const listSubsidiaries: CrudService<Subsidiary>['list'] = async (params: SubsidiaryListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Subsidiary>>(BASE, { params: merged });
  return res.data;
};

const getSubsidiary: CrudService<Subsidiary>['get'] = async (id: string): Promise<Subsidiary | null> => {
  const res = await api.get(`${BASE}/${id}`);
  // API sometimes returns { data: Subsidiary } (index-like) or the Subsidiary object directly (show endpoint)
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Subsidiary;
    return res.data as Subsidiary;
  }
  return null;
};

const createSubsidiary: CrudService<Subsidiary>['create'] = async (payload: Partial<Subsidiary>): Promise<Subsidiary> => {
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

const updateSubsidiary: CrudService<Subsidiary>['update'] = async (id: string, payload: Partial<Subsidiary>): Promise<Subsidiary> => {
  await api.put(`${BASE}/${id}`, payload);
  // After update, fetch fresh resource
  const fresh = await getSubsidiary(id);
  if (!fresh) throw new Error('Failed to fetch subsidiary after update');
  return fresh;
};

const deleteSubsidiary: CrudService<Subsidiary>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

export const listCompanies = async () => {
  const res = await api.get<{ data: Company[] }>('/admin/company', { params: { per_page: 200 } });
  return res.data.data;
};



// Maintain backward-compatible default export with both old function names and new contract
const defaultExport: CrudService<Subsidiary> & { listCompanies(): Promise<Company[]> } = {
  list: listSubsidiaries,
  get: getSubsidiary,
  create: createSubsidiary,
  update: updateSubsidiary,
  remove: deleteSubsidiary,
  listCompanies,
};

export default defaultExport;
