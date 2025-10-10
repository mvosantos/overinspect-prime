import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { Exporter } from '../models/Exporter';

const BASE = '/admin/exporter';

export type ExporterFilters = {
  name?: string;
  document?: string;
};

export type ExporterListParams = ListParams<ExporterFilters>;

const list: CrudService<Exporter>['list'] = async (params: ExporterListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Exporter>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Exporter>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Exporter;
    return res.data as Exporter;
  }
  return null;
};

const create: CrudService<Exporter>['create'] = async (payload: Partial<Exporter>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as Exporter;
    return (await get(maybe.id)) as Exporter;
  }
  throw new Error('Invalid response from create exporter');
};

const update: CrudService<Exporter>['update'] = async (id: string, payload: Partial<Exporter>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch exporter after update');
  return fresh;
};

const remove: CrudService<Exporter>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const exporterService: CrudService<Exporter> & { listAll?: () => Promise<Exporter[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default exporterService;
