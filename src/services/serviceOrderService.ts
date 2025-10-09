import BaseService from './BaseService';
import api from './api';

class ServiceOrderService extends BaseService {
  constructor() {
    super('/inspection/service-order');
  }

  async list(params: Record<string, unknown> = {}) {
    const res = await api.get(this.basePath, { params });
    return res.data;
  }

  async get(id: string) {
    const res = await api.get(`${this.basePath}/${id}`);
    return res.data;
  }

  async create(payload: unknown) {
    const res = await api.post(this.basePath, payload);
    return res.data;
  }

  async update(id: string, payload: unknown) {
    const res = await api.put(`${this.basePath}/${id}`, payload);
    return res.data;
  }

  async remove(id: string) {
    const res = await api.delete(`${this.basePath}/${id}`);
    return res.data;
  }

  async uploadAttachment(formData: FormData) {
    // POST to an attachment endpoint; adjust path if backend differs
    const res = await api.post(`${this.basePath}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async deleteAttachment(attachmentId: string) {
    const res = await api.delete(`${this.basePath}/attachment/${attachmentId}`);
    return res.data;
  }
}

export default new ServiceOrderService();
