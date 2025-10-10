import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { Client } from '../models/Client';

const BASE = '/inspection/client';

export type ClientFilters = {
  name?: string;
  document?: string;
};

export type ClientListParams = ListParams<ClientFilters>;

const list: CrudService<Client>['list'] = async (params: ClientListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Client>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Client>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Client;
    return res.data as Client;
  }
  return null;
};

const create: CrudService<Client>['create'] = async (payload: Partial<Client>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as Client;
    return (await get(maybe.id)) as Client;
  }
  throw new Error('Invalid response from create client');
};

const update: CrudService<Client>['update'] = async (id: string, payload: Partial<Client>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch client after update');
  return fresh;
};

const remove: CrudService<Client>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const service: CrudService<Client> & { listAll?: () => Promise<Client[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default service;
