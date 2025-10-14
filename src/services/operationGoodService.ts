
import api from './api';

import type { CrudService, ApiPaginatedResponse, ListParams } from '../models/apiTypes';
import type { GoodOperation } from '../models/service_order/goods/GoodOperation';

// Removido: usar ListParams<{ service_order_id?: string }>

const BASE_PATH = '/operation/good';

// Create/Update DTOs are permissive: most fields are optional because
// forms typically submit a subset of GoodOperation fields.
export type GoodOperationCreateDto = Partial<Omit<GoodOperation, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>> & { service_order_id?: string };
export type GoodOperationUpdateDto = Partial<GoodOperationCreateDto>;

class OperationGoodService implements CrudService<GoodOperation, GoodOperationCreateDto, GoodOperationUpdateDto> {
  async list(params?: ListParams<{ service_order_id?: string }>): Promise<ApiPaginatedResponse<GoodOperation>> {
    const res = await api.get(BASE_PATH, { params });
    return res.data;
  }

  async get(id: string): Promise<GoodOperation | null> {
    const res = await api.get(`${BASE_PATH}/${id}`);
    return res.data ?? null;
  }

  async create(payload: GoodOperationCreateDto): Promise<GoodOperation> {
    const res = await api.post(BASE_PATH, payload);
    return res.data;
  }

  async update(id: string, payload: GoodOperationUpdateDto): Promise<GoodOperation> {
    const res = await api.put(`${BASE_PATH}/${id}`, payload);
    return res.data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`);
  }
}

export default new OperationGoodService();
