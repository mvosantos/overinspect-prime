import BaseService from './BaseService';
import api from './api';

class ServiceTypeService extends BaseService {
  constructor() {
    super('/inspection/service-type');
  }

  async getByServiceTypeId(service_type_id: string) {
    // Call GET /inspection/service-type/{service_type_id}
    const res = await api.get(`${this.basePath}/${service_type_id}`);
    return res.data as unknown;
  }

  async listAll() {
    // returns array of service types (try per_page large to fetch all)
    const res = await api.get(this.basePath, { params: { per_page: 500 } });
    // response may be { data: [...] } or the array directly
    const body = res.data as unknown;
    if (body && typeof body === 'object' && 'data' in (body as Record<string, unknown>)) {
      const rec = body as Record<string, unknown>;
      const data = rec.data as unknown;
      if (Array.isArray(data)) return data as unknown[];
    }
    if (Array.isArray(body)) return body as unknown[];
    return [] as unknown[];
  }

  async updateFields(service_type_id: string, fields: unknown) {
    // PUT to /inspection/service-type-field/{service_type_id}
    const url = `/inspection/service-type-field/${service_type_id}`;
    const res = await api.put(url, { service_type_fields: fields });
    return res.data;
  }
}

export default new ServiceTypeService();
