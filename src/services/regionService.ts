import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { Region } from '../models/Region';

const BASE = '/admin/region';

export type RegionFilters = {
  name?: string;
  document?: string;
};

export type RegionListParams = ListParams<RegionFilters>;

const list: CrudService<Region>['list'] = async (params: RegionListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Region>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Region>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Region;
    return res.data as Region;
  }
  return null;
};

const create: CrudService<Region>['create'] = async (payload: Partial<Region>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as Region;
    return (await get(maybe.id)) as Region;
  }
  throw new Error('Invalid response from create region');
};

const update: CrudService<Region>['update'] = async (id: string, payload: Partial<Region>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch region after update');
  return fresh;
};

const remove: CrudService<Region>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const regionService: CrudService<Region> & { listAll?: () => Promise<Region[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default regionService;
