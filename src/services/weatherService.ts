import api from './api';
import type { CrudService, ListParams, ApiPaginatedResponse } from '../models/apiTypes';
import type { Weather } from '../models/Weather';

const BASE = '/inspection/weather';

const list: CrudService<Weather>['list'] = async (params: ListParams = {}) => {
  const effectiveLimit = params.limit ?? (params.per_page ?? 20);
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

  const res = await api.get<ApiPaginatedResponse<Weather>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Weather>['get'] = async (id: string) => {
  const res = await api.get<Weather | { data: Weather }>(`${BASE}/${id}`);
  const body = res.data;
  if (body && typeof body === 'object') {
    const asObj = body as Record<string, unknown>;
    const maybe = asObj.data;
    if (maybe && typeof maybe === 'object') return maybe as Weather;
    return body as Weather;
  }
  return null;
};

const weatherService: Partial<CrudService<Weather>> = { list, get };
export default weatherService;
