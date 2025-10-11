import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { ServiceOrderStatus } from '../models/ServiceOrderStatus';

const BASE = '/inspection/service-order-status';

export type ServiceOrderStatusFilters = {
  name?: string;
  document?: string;
};

export type ServiceOrderStatusListParams = ListParams<ServiceOrderStatusFilters>;

const list: CrudService<ServiceOrderStatus>['list'] = async (params: ServiceOrderStatusListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<ServiceOrderStatus>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<ServiceOrderStatus>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as ServiceOrderStatus;
    return res.data as ServiceOrderStatus;
  }
  return null;
};

const create: CrudService<ServiceOrderStatus>['create'] = async (payload: Partial<ServiceOrderStatus>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as ServiceOrderStatus;
    return (await get(maybe.id)) as ServiceOrderStatus;
  }
  throw new Error('Invalid response from create ServiceOrderStatus');
};

const update: CrudService<ServiceOrderStatus>['update'] = async (id: string, payload: Partial<ServiceOrderStatus>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch ServiceOrderStatus after update');
  return fresh;
};

const remove: CrudService<ServiceOrderStatus>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const service: CrudService<ServiceOrderStatus> & { listAll?: () => Promise<ServiceOrderStatus[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default service;
