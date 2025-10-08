import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { Company } from '../models/company';

const BASE = '/admin/company';

export type CompanyFilters = {
  name?: string;
  document?: string;
};

export type CompanyListParams = ListParams<CompanyFilters>;

const list: CrudService<Company>['list'] = async (params: CompanyListParams = {}) => {
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

  if ('per_page' in merged) delete merged.per_page;

  const res = await api.get<ApiPaginatedResponse<Company>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Company>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Company;
    return res.data as Company;
  }
  return null;
};

const create: CrudService<Company>['create'] = async (payload: Partial<Company>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as Company;
    return (await get(maybe.id)) as Company;
  }
  throw new Error('Invalid response from create company');
};

const update: CrudService<Company>['update'] = async (id: string, payload: Partial<Company>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch company after update');
  return fresh;
};

const remove: CrudService<Company>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const service: CrudService<Company> & { listAll?: () => Promise<Company[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default service;
