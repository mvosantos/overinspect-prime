import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { Shipper } from '../models/Shipper';

const BASE = '/inspection/shipper';

export type ShipperFilters = {
  name?: string;
  document?: string;
};

export type ShipperListParams = ListParams<ShipperFilters>;

const list: CrudService<Shipper>['list'] = async (params: ShipperListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Shipper>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Shipper>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Shipper;
    return res.data as Shipper;
  }
  return null;
};

const create: CrudService<Shipper>['create'] = async (payload: Partial<Shipper>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as Shipper;
    return (await get(maybe.id)) as Shipper;
  }
  throw new Error('Invalid response from create shipper');
};

const update: CrudService<Shipper>['update'] = async (id: string, payload: Partial<Shipper>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch shipper after update');
  return fresh;
};

const remove: CrudService<Shipper>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const shipperService: CrudService<Shipper> & { listAll?: () => Promise<Shipper[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default shipperService;
