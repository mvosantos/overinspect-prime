import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { OperationType } from '../models/OperationType';

const BASE = '/admin/operation-type';

export type OperationTypeFilters = {
  name?: string;
  document?: string;
};

export type OperationTypeListParams = ListParams<OperationTypeFilters>;

const list: CrudService<OperationType>['list'] = async (params: OperationTypeListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<OperationType>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<OperationType>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as OperationType;
    return res.data as OperationType;
  }
  return null;
};

const create: CrudService<OperationType>['create'] = async (payload: Partial<OperationType>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as OperationType;
    return (await get(maybe.id)) as OperationType;
  }
  throw new Error('Invalid response from create operationType');
};

const update: CrudService<OperationType>['update'] = async (id: string, payload: Partial<OperationType>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch operationType after update');
  return fresh;
};

const remove: CrudService<OperationType>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const operationTypeService: CrudService<OperationType> & { listAll?: () => Promise<OperationType[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default operationTypeService;
