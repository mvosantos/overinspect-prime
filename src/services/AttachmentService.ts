import api from './api';
import axios from 'axios';
import { ATTACHMENT_UPLOAD_PATH, ATTACHMENT_DELETE_PATH } from '../config/attachment';

type PresignResponse = {
  id?: string;
  filename: string;
  presign_data?: { url: string };
};

export default class AttachmentService {
  static async getPresign(filename: string, path = 'service_order'): Promise<PresignResponse> {
    const payload = { filename, path };
    const res = await api.post<PresignResponse>(ATTACHMENT_UPLOAD_PATH, payload);
    if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[AttachmentService] presign response', res.data);
    return res.data;
  }

  static async uploadToPresign(url: string, file: Blob | File) {
    try {
      await axios.put(url, file, {
        headers: { 'Content-Type': (file as Blob).type || 'application/octet-stream' },
      });
      if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[AttachmentService] uploadToPresign success for url', url);
    } catch (err) {
      if (typeof console !== 'undefined' && typeof console.error === 'function') console.error('[AttachmentService] uploadToPresign error for url', url, err);
      throw err;
    }
  }

  static async deleteAttachment(id: string) {
    const res = await api.delete(ATTACHMENT_DELETE_PATH(id));
    return res.data;
  }

  static async downloadAttachment(id: string): Promise<string> {
    // First ask the server for a downloadable URL. Modern backend returns
    // { url: 'https://...r2.cloudflare...' } which we should use directly.
    try {
      const res = await api.post(`/admin/attachment/download`, { attachment_id: id });
      const body = res.data;

      // If the server returned a string URL directly
      if (body && typeof body === 'string') {
        return body;
      }

      // If the server returned an object with a `url` property (Cloudflare R2)
      if (body && typeof body === 'object') {
        const b = body as Record<string, unknown>;
        if (typeof b.url === 'string') return b.url;
      }

      // Fallback: request the endpoint as a blob and return an object URL
      try {
        const blobRes = await api.post(`/admin/attachment/download`, { attachment_id: id }, { responseType: 'blob' });
        const blob = blobRes.data as Blob;
        return URL.createObjectURL(blob);
      } catch (innerErr) {
        if (typeof console !== 'undefined' && typeof console.error === 'function') console.error('[AttachmentService] downloadAttachment blob fallback error', innerErr);
        throw innerErr;
      }
    } catch (err) {
      if (typeof console !== 'undefined' && typeof console.error === 'function') console.error('[AttachmentService] downloadAttachment error', err);
      throw err;
    }
  }
}
