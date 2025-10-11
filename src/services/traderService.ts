import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { Trader } from '../models/Trader';

const BASE = '/inspection/trader';

export type TraderFilters = {
  name?: string;
  document?: string;
};

export type TraderListParams = ListParams<TraderFilters>;

const list: CrudService<Trader>['list'] = async (params: TraderListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Trader>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Trader>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Trader;
    return res.data as Trader;
  }
  return null;
};

const create: CrudService<Trader>['create'] = async (payload: Partial<Trader>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as Trader;
    return (await get(maybe.id)) as Trader;
  }
  throw new Error('Invalid response from create trader');
};

const update: CrudService<Trader>['update'] = async (id: string, payload: Partial<Trader>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch trader after update');
  return fresh;
};

const remove: CrudService<Trader>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const traderService: CrudService<Trader> & { listAll?: () => Promise<Trader[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default traderService;
