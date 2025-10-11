import api from './api';
import type { ApiPaginatedResponse, CrudService, ListParams } from '../models/apiTypes';
import type { Product } from '../models/Product';

const BASE = '/inspection/product';

export type ProductFilters = {
  name?: string;
  document?: string;
};

export type ProductListParams = ListParams<ProductFilters>;

const list: CrudService<Product>['list'] = async (params: ProductListParams = {}) => {
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

  const res = await api.get<ApiPaginatedResponse<Product>>(BASE, { params: merged });
  return res.data;
};

const get: CrudService<Product>['get'] = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  if (res.data && typeof res.data === 'object') {
    if ('data' in res.data && res.data.data) return res.data.data as Product;
    return res.data as Product;
  }
  return null;
};

const create: CrudService<Product>['create'] = async (payload: Partial<Product>) => {
  const res = await api.post(BASE, payload);
  const body = res.data;
  const maybe = (body && typeof body === 'object') ? (body.data ?? body) : null;
  if (maybe && maybe.id) {
    const hasFields = ('name' in maybe) || ('id' in maybe);
    if (hasFields) return maybe as Product;
    return (await get(maybe.id)) as Product;
  }
  throw new Error('Invalid response from create product');
};

const update: CrudService<Product>['update'] = async (id: string, payload: Partial<Product>) => {
  await api.put(`${BASE}/${id}`, payload);
  const fresh = await get(id);
  if (!fresh) throw new Error('Failed to fetch product after update');
  return fresh;
};

const remove: CrudService<Product>['remove'] = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

const productService: CrudService<Product> & { listAll?: () => Promise<Product[]> } = {
  list,
  get,
  create,
  update,
  remove,
};

export default productService;
