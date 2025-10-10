import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { Site } from '../models/Site';

const BASE = '/inspection/site';

export type SiteFilters = {
  name?: string;
  document?: string;
};

export type SiteListParams = ListParams<SiteFilters>;

const list: CrudService<Site>['list'] = async (params: SiteListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Site>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Site>['get'] = async (id: string) => {
  const res = await api.get<Site | { data: Site }>(`${BASE}/${id}`);
  const body = res.data;
  if (body && typeof body === 'object') {
    const asObj = body as Record<string, unknown>;
    const maybe = asObj.data;
    if (maybe && typeof maybe === 'object') return maybe as Site;
    return body as Site;
  }
  return null;
};

const create: CrudService<Site>['create'] = async (payload: Partial<Site>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as Site;
    return (await get(maybe.id)) as Site;
  }
  throw new Error('Invalid response from create client');
};

const update: CrudService<Site>['update'] = async (id: string, payload: Partial<Site>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch client after update');
  return fresh;
};

const remove: CrudService<Site>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const service: CrudService<Site> & { listAll?: () => Promise<Site[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default service;
