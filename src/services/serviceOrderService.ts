import BaseService from './BaseService';
import api from './api';
import AttachmentService from './AttachmentService';

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
  // Before creating, remove nested objects and upload new attachments via presigned URLs
  const pl = payload as Record<string, unknown>;
      // ensure attachments node exists so backend receives an empty array when no attachments
      if (!Array.isArray(pl.attachments)) pl.attachments = [];
      // remove nested objects in arrays
      if (Array.isArray(pl.services)) {
        (pl.services as unknown[]).forEach((it) => { if (it && typeof it === 'object') delete (it as Record<string, unknown>).service; });
      }
      if (Array.isArray(pl.payments)) {
        (pl.payments as unknown[]).forEach((it) => { if (it && typeof it === 'object') delete (it as Record<string, unknown>).document_type; });
      }
      if (Array.isArray(pl.schedules)) {
        (pl.schedules as unknown[]).forEach((it) => { if (it && typeof it === 'object') delete (it as Record<string, unknown>).user; });
      }

      // upload attachments using presigned url flow if any
      if (Array.isArray(pl.attachments)) {
        type Uploadable = Record<string, unknown> & { filename?: string; fileObject?: Blob; created_at?: unknown };
        const uploadables = (pl.attachments as unknown[]).filter((a) => a && typeof a === 'object' && !(a as Record<string, unknown>).created_at && (a as Record<string, unknown>).fileObject) as Uploadable[];
        if (uploadables.length > 0) {
          await Promise.all(uploadables.map(async (file) => {
            const presign = await AttachmentService.getPresign(String(file.filename ?? ''), 'service_order');
            const presignedName = presign.filename;
            const presignUrl = presign.presign_data?.url;
            if (presign.id) file.id = presign.id;
            file.name = presignedName;
            file.filename = presignedName;
            await AttachmentService.uploadToPresign(String(presignUrl), file.fileObject as Blob);
            delete file.fileObject;
          }));
        }
      }

    if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[ServiceOrderService] final create payload attachments:', pl.attachments);
    const res = await api.post(this.basePath, pl);
    return res.data;
  }

  async update(id: string, payload: unknown) {
  const pl = payload as Record<string, unknown>;
      // ensure attachments node exists so backend receives an array even when empty
      if (!Array.isArray(pl.attachments)) pl.attachments = [];
      // do not send attachments already on server - but preserve the array (may become empty)
      if (Array.isArray(pl.attachments)) {
        pl.attachments = (pl.attachments as unknown[]).filter((att) => !(att && typeof att === 'object' && (att as Record<string, unknown>).created_at));
      }

      // remove nested objects in arrays
      if (Array.isArray(pl.services)) {
        (pl.services as unknown[]).forEach((it) => { if (it && typeof it === 'object') delete (it as Record<string, unknown>).service; });
      }
      if (Array.isArray(pl.payments)) {
        (pl.payments as unknown[]).forEach((it) => { if (it && typeof it === 'object') delete (it as Record<string, unknown>).document_type; });
      }
      if (Array.isArray(pl.schedules)) {
        (pl.schedules as unknown[]).forEach((it) => { if (it && typeof it === 'object') delete (it as Record<string, unknown>).user; });
      }

      // upload new attachments via presigned flow
      if (Array.isArray(pl.attachments)) {
        type Uploadable = Record<string, unknown> & { filename?: string; fileObject?: Blob; created_at?: unknown };
        const uploadables = (pl.attachments as unknown[]).filter((a) => a && typeof a === 'object' && !(a as Record<string, unknown>).created_at && (a as Record<string, unknown>).fileObject) as Uploadable[];
        if (uploadables.length > 0) {
          await Promise.all(uploadables.map(async (file) => {
            const presign = await AttachmentService.getPresign(String(file.filename ?? ''), 'service_order');
            const presignedName = presign.filename;
            const presignUrl = presign.presign_data?.url;
            if (presign.id) file.id = presign.id;
            file.name = presignedName;
            file.filename = presignedName;
            await AttachmentService.uploadToPresign(String(presignUrl), file.fileObject as Blob);
            delete file.fileObject;
          }));
        }
      }

    if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[ServiceOrderService] final update payload attachments:', pl.attachments);
    const res = await api.put(`${this.basePath}/${id}`, pl);
    return res.data;
  }

  async remove(id: string) {
    const res = await api.delete(`${this.basePath}/${id}`);
    return res.data;
  }

  // Presigned upload flow handled inside create/update

  async deleteAttachment(attachmentId: string) {
    return AttachmentService.deleteAttachment(attachmentId);
  }
}

export default new ServiceOrderService();
