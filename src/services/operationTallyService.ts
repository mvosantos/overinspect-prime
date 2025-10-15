
import api from './api';

import type { CrudService, ApiPaginatedResponse, ListParams } from '../models/apiTypes';
import type { TallyOperation } from '../models/tallies/TallyOperation';

// Removido: usar ListParams<{ service_order_id?: string }>

const BASE_PATH = '/operation/tally/web';

export type TallyOperationCreateDto = Omit<TallyOperation, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type TallyOperationUpdateDto = Partial<TallyOperationCreateDto>;

class OperationTallyService implements CrudService<TallyOperation, TallyOperationCreateDto, TallyOperationUpdateDto> {
  async list(params?: ListParams<{ service_order_id?: string }>): Promise<ApiPaginatedResponse<TallyOperation>> {
    const res = await api.get(BASE_PATH, { params });
    return res.data;
  }

  async get(id: string): Promise<TallyOperation | null> {
    const res = await api.get(`${BASE_PATH}/${id}`);
    return res.data ?? null;
  }

  async create(payload: TallyOperationCreateDto): Promise<TallyOperation> {
    const res = await api.post(BASE_PATH, payload);
    return res.data;
  }

  async update(id: string, payload: TallyOperationUpdateDto): Promise<TallyOperation> {
    const res = await api.put(`${BASE_PATH}/${id}`, payload);
    return res.data;  
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`);
  }
}

export default new OperationTallyService();
