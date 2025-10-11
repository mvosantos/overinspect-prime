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
}
