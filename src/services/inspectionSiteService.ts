import api from './api';
import type { ApiPaginatedResponse, CrudService } from '../models/apiTypes';
import type { InspectionSite, InspectionSiteListParams } from '../models/inspectionSite';
import type { Company } from '../models/company';
import companyService from './companyService';

const BASE = '/inspection/inspection-site';

const listInspectionSites: CrudService<InspectionSite>['list'] = async (params: InspectionSiteListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<InspectionSite>>(BASE, { params: merged });
  return res.data;
};

const getInspectionSite: CrudService<InspectionSite>['get'] = async (id: string): Promise<InspectionSite | null> => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as InspectionSite;
    return res.data as InspectionSite;
  }
  return null;
};

const createInspectionSite: CrudService<InspectionSite>['create'] = async (payload: Partial<InspectionSite>): Promise<InspectionSite> => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('company' in maybe);
    if (hasFields) return maybe as InspectionSite;
    return (await getInspectionSite(maybe.id)) as InspectionSite;
  }
  throw new Error('Invalid response from create inspection site');
};

const updateInspectionSite: CrudService<InspectionSite>['update'] = async (id: string, payload: Partial<InspectionSite>): Promise<InspectionSite> => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await getInspectionSite(id);
  if (!fresh) throw new Error('Failed to fetch inspection site after update');
  return fresh;
};

const deleteInspectionSite: CrudService<InspectionSite>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const listCompanies = async (): Promise<Company[]> => {
  // reuse companyService for company listing
  return (await companyService.list({ per_page: 200 })).data as Company[];
};

const defaultExport: CrudService<InspectionSite> & { listCompanies(): Promise<Company[]> } = {
  list: listInspectionSites,
  get: getInspectionSite,
  create: createInspectionSite,
  update: updateInspectionSite,
  remove: deleteInspectionSite,
  listCompanies,
};

export default defaultExport;
