import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { Currency } from '../models/Currency';

const BASE = '/admin/currency';

export type CurrencyFilters = {
  name?: string;
  document?: string;
};

export type CurrencyListParams = ListParams<CurrencyFilters>;

const list: CrudService<Currency>['list'] = async (params: CurrencyListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Currency>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Currency>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Currency;
    return res.data as Currency;
  }
  return null;
};

const create: CrudService<Currency>['create'] = async (payload: Partial<Currency>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as Currency;
    return (await get(maybe.id)) as Currency;
  }
  throw new Error('Invalid response from create currency');
};

const update: CrudService<Currency>['update'] = async (id: string, payload: Partial<Currency>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch currency after update');
  return fresh;
};

const remove: CrudService<Currency>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const currencyService: CrudService<Currency> & { listAll?: () => Promise<Currency[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default currencyService;
