import api from './api';
import type { ApiPaginatedResponse, CrudService } from '../models/apiTypes';
import type { ServiceListParams } from '../models/service';
import type { BusinessUnit } from '../models/businessUnit';


const BASE = '/admin/business-unit';

const listBusinessUnits: CrudService<BusinessUnit>['list'] = async (params: ServiceListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<BusinessUnit>>(BASE, { params: merged });
  return res.data;
};

const getBusinessUnit: CrudService<BusinessUnit>['get'] = async (id: string): Promise<BusinessUnit | null> => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as BusinessUnit;
    return res.data as BusinessUnit;
  }
  return null;
};

const createBusinessUnit: CrudService<BusinessUnit>['create'] = async (payload: Partial<BusinessUnit>): Promise<BusinessUnit> => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('business_unit' in maybe);
    if (hasFields) return maybe as BusinessUnit;
    return (await getBusinessUnit(maybe.id)) as BusinessUnit;
  }
  throw new Error('Invalid response from create BusinessUnit');
};

const updateBusinessUnit: CrudService<BusinessUnit>['update'] = async (id: string, payload: Partial<BusinessUnit>): Promise<BusinessUnit> => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await getBusinessUnit(id);
  if (!fresh) throw new Error('Failed to fetch BusinessUnit after update');
  return fresh;
};

const deleteBusinessUnit: CrudService<BusinessUnit>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const defaultExport: CrudService<BusinessUnit> = {
  list: listBusinessUnits,
  get: getBusinessUnit,
  create: createBusinessUnit,
  update: updateBusinessUnit,
  remove: deleteBusinessUnit,
};

export default defaultExport;
