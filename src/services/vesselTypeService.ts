import api from './api';
import type { CrudService, ListParams, ApiPaginatedResponse } from '../models/apiTypes';
import type { VesselType } from '../models/VesselType';

const BASE = '/inspection/vessel-type';

const list: CrudService<VesselType>['list'] = async (params: ListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<VesselType>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<VesselType>['get'] = async (id: string) => {
  const res = await api.get<VesselType | { data: VesselType }>(`${BASE}/${id}`);
  const body = res.data;
  if (body && typeof body === 'object') {
    const asObj = body as Record<string, unknown>;
    const maybe = asObj.data;
    if (maybe && typeof maybe === 'object') return maybe as VesselType;
    return body as VesselType;
  }
  return null;
};

const vesselTypeService: Partial<CrudService<VesselType>> = { list, get };
export default vesselTypeService;
