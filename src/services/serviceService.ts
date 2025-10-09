import api from './api';
import type { ApiPaginatedResponse, CrudService } from '../models/apiTypes';
import type { Service, ServiceListParams } from '../models/service';

const BASE = '/inspection/service';

const listServices: CrudService<Service>['list'] = async (params: ServiceListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Service>>(BASE, { params: merged });
  return res.data;
};

const getService: CrudService<Service>['get'] = async (id: string): Promise<Service | null> => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Service;
    return res.data as Service;
  }
  return null;
};

const createService: CrudService<Service>['create'] = async (payload: Partial<Service>): Promise<Service> => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('company' in maybe);
    if (hasFields) return maybe as Service;
    return (await getService(maybe.id)) as Service;
  }
  throw new Error('Invalid response from create service');
};

const updateService: CrudService<Service>['update'] = async (id: string, payload: Partial<Service>): Promise<Service> => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await getService(id);
  if (!fresh) throw new Error('Failed to fetch service after update');
  return fresh;
};

const deleteService: CrudService<Service>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const defaultExport: CrudService<Service> = {
  list: listServices,
  get: getService,
  create: createService,
  update: updateService,
  remove: deleteService,
};

export default defaultExport;
