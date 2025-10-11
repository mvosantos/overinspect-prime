import api from './api';
import type { ApiPaginatedResponse, CrudService } from '../models/apiTypes';
import type { DocumentType } from '../models/DocumentType';
import type { ServiceListParams } from '../models/service';

const BASE = '/admin/document-type';

const listDocumentTypes: CrudService<DocumentType>['list'] = async (params: ServiceListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<DocumentType>>(BASE, { params: merged });
  return res.data;
};

const getDocumentType: CrudService<DocumentType>['get'] = async (id: string): Promise<DocumentType | null> => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as DocumentType;
    return res.data as DocumentType;
  }
  return null;
};

const createDocumentType: CrudService<DocumentType>['create'] = async (payload: Partial<DocumentType>): Promise<DocumentType> => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe);
    if (hasFields) return maybe as DocumentType;
    return (await getDocumentType(maybe.id)) as DocumentType;
  }
  throw new Error('Invalid response from create document type');
};

const updateDocumentType: CrudService<DocumentType>['update'] = async (id: string, payload: Partial<DocumentType>): Promise<DocumentType> => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await getDocumentType(id);
  if (!fresh) throw new Error('Failed to fetch DocumentType after update');
  return fresh;
};

const deleteDocumentType: CrudService<DocumentType>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const defaultExport: CrudService<DocumentType> = {
  list: listDocumentTypes,
  get: getDocumentType,
  create: createDocumentType,
  update: updateDocumentType,
  remove: deleteDocumentType,
};

export default defaultExport;
