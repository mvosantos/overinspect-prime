import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { PackingType } from '../models/PackingType';

const BASE = '/admin/packing-type';

export type PackingTypeFilters = {
  name?: string;
  document?: string;
};

export type PackingTypeListParams = ListParams<PackingTypeFilters>;

const list: CrudService<PackingType>['list'] = async (params: PackingTypeListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<PackingType>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<PackingType>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as PackingType;
    return res.data as PackingType;
  }
  return null;
};

const create: CrudService<PackingType>['create'] = async (payload: Partial<PackingType>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as PackingType;
    return (await get(maybe.id)) as PackingType;
  }
  throw new Error('Invalid response from create shipper');
};

const update: CrudService<PackingType>['update'] = async (id: string, payload: Partial<PackingType>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch shipper after update');
  return fresh;
};

const remove: CrudService<PackingType>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const shipperService: CrudService<PackingType> & { listAll?: () => Promise<PackingType[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default shipperService;
