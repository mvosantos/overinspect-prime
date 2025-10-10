import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { City } from '../models/City';

const BASE = '/admin/city';

export type CityFilters = {
  name?: string;
  document?: string;
};

export type CityListParams = ListParams<CityFilters>;

const list: CrudService<City>['list'] = async (params: CityListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<City>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<City>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as City;
    return res.data as City;
  }
  return null;
};

const create: CrudService<City>['create'] = async (payload: Partial<City>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as City;
    return (await get(maybe.id)) as City;
  }
  throw new Error('Invalid response from create city');
};

const update: CrudService<City>['update'] = async (id: string, payload: Partial<City>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch city after update');
  return fresh;
};

const remove: CrudService<City>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const cityService: CrudService<City> & { listAll?: () => Promise<City[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default cityService;
