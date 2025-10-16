import BaseService from './BaseService';
import type { AttachmentType } from '../models/AttachmentType';

class AttachmentTypeService extends BaseService {
  constructor() {
    super('/admin/attachment-type');
  }

  // For this resource we only need list/get but keep the generic methods available
  async listTypes(params?: Record<string, unknown>) {
    return this.list<AttachmentType>(params);
  }

  async getType(id: string) {
    return this.get<AttachmentType>(id);
  }
}

export default new AttachmentTypeService();
