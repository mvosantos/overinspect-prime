
import api from './api';
import { parseToDateOrOriginal } from '../utils/dateHelpers';
import { format } from 'date-fns';

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
    // clone payload so we can adjust date formatting for readings before sending
    const body: Record<string, unknown> = { ...(payload as Record<string, unknown> || {}) };
    try {
      const maybe = body['tally_operation_readings'];
      if (Array.isArray(maybe)) {
        const mapped = maybe.map((r) => {
          const rec = (r && typeof r === 'object') ? ({ ...(r as Record<string, unknown>) }) : {} as Record<string, unknown>;
          try {
            const dval = rec['date'];
            if (dval) {
              const parsed = parseToDateOrOriginal(dval);
              if (parsed instanceof Date) rec['date'] = format(parsed, 'yyyy-MM-dd HH:mm:ss');
              else rec['date'] = String(dval);
            }
          } catch {
            // ignore formatting errors, leave value as-is
          }
          return rec;
        });
        body['tally_operation_readings'] = mapped;
      }
    } catch {
      // ignore
    }

    const res = await api.put(`${BASE_PATH}/${id}`, body);
    return res.data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`);
  }

  // Remove a single reading by id. Backend exposes a dedicated endpoint for
  // reading deletion at /operation/tally/reading/{id}.
  async removeReading(id: string): Promise<void> {
    await api.delete(`/operation/tally/reading/${id}`);
  }
}

export default new OperationTallyService();
