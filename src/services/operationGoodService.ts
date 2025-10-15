
import api from './api';
import { formatDateOnlyForApi, formatDateTimeForApi } from '../utils/dateHelpers';

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
    // Manually format date fields before sending to API (field-by-field)
  const body: Record<string, unknown> = { ...payload } as Record<string, unknown>;

    // date-only fields
    if ('date_of_loading' in body) body.date_of_loading = formatDateOnlyForApi(body.date_of_loading);
    if ('date_of_discharge' in body) body.date_of_discharge = formatDateOnlyForApi(body.date_of_discharge);

    // date-time fields (with seconds)
    if ('vessel_arrived' in body) body.vessel_arrived = formatDateTimeForApi(body.vessel_arrived);
    if ('vessel_berthed' in body) body.vessel_berthed = formatDateTimeForApi(body.vessel_berthed);
    if ('operations_commenced' in body) body.operations_commenced = formatDateTimeForApi(body.operations_commenced);
    if ('surveyor_at_terminal' in body) body.surveyor_at_terminal = formatDateTimeForApi(body.surveyor_at_terminal);
    if ('surveyor_on_board' in body) body.surveyor_on_board = formatDateTimeForApi(body.surveyor_on_board);
    if ('unlashing' in body) body.unlashing = formatDateTimeForApi(body.unlashing);
    if ('lifting_1' in body) body.lifting_1 = formatDateTimeForApi(body.lifting_1);
    if ('lifting_2' in body) body.lifting_2 = formatDateTimeForApi(body.lifting_2);
    if ('lifting_3' in body) body.lifting_3 = formatDateTimeForApi(body.lifting_3);
    if ('lifting_4' in body) body.lifting_4 = formatDateTimeForApi(body.lifting_4);
    if ('lifting_5' in body) body.lifting_5 = formatDateTimeForApi(body.lifting_5);
    if ('discharge_completed' in body) body.discharge_completed = formatDateTimeForApi(body.discharge_completed);
    if ('final_inspection' in body) body.final_inspection = formatDateTimeForApi(body.final_inspection);
    if ('surveyor_left_terminal' in body) body.surveyor_left_terminal = formatDateTimeForApi(body.surveyor_left_terminal);

    const res = await api.post(BASE_PATH, body);
    return res.data;
  }

  async update(id: string, payload: GoodOperationUpdateDto): Promise<GoodOperation> {
    // Manually format date fields before sending to API (field-by-field)
  const body: Record<string, unknown> = { ...payload } as Record<string, unknown>;

    // date-only fields
    if ('date_of_loading' in body) body.date_of_loading = formatDateOnlyForApi(body.date_of_loading);
    if ('date_of_discharge' in body) body.date_of_discharge = formatDateOnlyForApi(body.date_of_discharge);

    // date-time fields (with seconds)
    if ('vessel_arrived' in body) body.vessel_arrived = formatDateTimeForApi(body.vessel_arrived);
    if ('vessel_berthed' in body) body.vessel_berthed = formatDateTimeForApi(body.vessel_berthed);
    if ('operations_commenced' in body) body.operations_commenced = formatDateTimeForApi(body.operations_commenced);
    if ('surveyor_at_terminal' in body) body.surveyor_at_terminal = formatDateTimeForApi(body.surveyor_at_terminal);
    if ('surveyor_on_board' in body) body.surveyor_on_board = formatDateTimeForApi(body.surveyor_on_board);
    if ('unlashing' in body) body.unlashing = formatDateTimeForApi(body.unlashing);
    if ('lifting_1' in body) body.lifting_1 = formatDateTimeForApi(body.lifting_1);
    if ('lifting_2' in body) body.lifting_2 = formatDateTimeForApi(body.lifting_2);
    if ('lifting_3' in body) body.lifting_3 = formatDateTimeForApi(body.lifting_3);
    if ('lifting_4' in body) body.lifting_4 = formatDateTimeForApi(body.lifting_4);
    if ('lifting_5' in body) body.lifting_5 = formatDateTimeForApi(body.lifting_5);
    if ('discharge_completed' in body) body.discharge_completed = formatDateTimeForApi(body.discharge_completed);
    if ('final_inspection' in body) body.final_inspection = formatDateTimeForApi(body.final_inspection);
    if ('surveyor_left_terminal' in body) body.surveyor_left_terminal = formatDateTimeForApi(body.surveyor_left_terminal);

    const res = await api.put(`${BASE_PATH}/${id}`, body);
    return res.data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`);
  }
}

export default new OperationGoodService();
