import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { CargoType } from '../models/CargoType';

const BASE = '/admin/cargo-type';

export type CargoTypeFilters = {
  name?: string;
  document?: string;
};

export type CargoTypeListParams = ListParams<CargoTypeFilters>;

const list: CrudService<CargoType>['list'] = async (params: CargoTypeListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<CargoType>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<CargoType>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as CargoType;
    return res.data as CargoType;
  }
  return null;
};

const create: CrudService<CargoType>['create'] = async (payload: Partial<CargoType>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as CargoType;
    return (await get(maybe.id)) as CargoType;
  }
  throw new Error('Invalid response from create cargoType');
};

const update: CrudService<CargoType>['update'] = async (id: string, payload: Partial<CargoType>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch cargoType after update');
  return fresh;
};

const remove: CrudService<CargoType>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const cargoTypeService: CrudService<CargoType> & { listAll?: () => Promise<CargoType[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default cargoTypeService;
