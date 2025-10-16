import BaseService from './BaseService';
import type { RequestParams } from './BaseService';
import api from './api';
import { formatForPayload, formatForPayloadDateTime, tryParseDate } from '../utils/dateHelpers';
import { formatNumberFixed } from '../utils/numberHelpers';
import AttachmentService from './AttachmentService';
import type { ApiPaginatedResponse } from '../models/apiTypes';
import type { ServiceOrder, ServiceOrderSubmission } from '../models/serviceOrder';

class ServiceOrderService extends BaseService {
  constructor() {
    super('/inspection/service-order');
  }

  // placeholder - actual implementation attached to prototype below
  applyDateFormatting(pl: Record<string, unknown>): void {
    if (!pl || typeof pl !== 'object') return;
    try {
      const DATETIME_FIELDS = new Set([
        'nomination_date',
        'operation_finishes_at',
        'operation_finish_date',
      ]);
      const WEIGHT_FIELDS = new Set([
        'gross_volume_landed',
        'net_volume_landed',
        'tare_volume_landed',
        'gross_volume_invoice',
        'net_volume_invoice',
        'tare_volume_invoice',
      ]);

      const isDateKey = (key: string) => /(_at$|_date$|^nomination_date$|operation_starts_at$|operation_finishes_at$|bl_date$|cargo_arrival_date$|created_at$|updated_at$)/i.test(key);

      const formatValueForKey = (key: string, val: unknown) => {
        if (val === null || val === undefined) return val;
        // Date object -> format
        if (val instanceof Date) return DATETIME_FIELDS.has(key) ? formatForPayloadDateTime(val) : formatForPayload(val);
        // string that should be treated as date when key is date-like
        if (typeof val === 'string' && isDateKey(key)) {
          return DATETIME_FIELDS.has(key) ? formatForPayloadDateTime(val) : formatForPayload(val);
        }
        // weight fields (match exact snake_case or camelCase endings)
        const lowerKey = key.toLowerCase();
        for (const wf of Array.from(WEIGHT_FIELDS)) {
          const compact = wf.replace(/_/g, '');
          if (lowerKey === wf || lowerKey.endsWith(wf) || lowerKey.includes(compact)) {
            // keep null/empty as null
            if (val === null) return null;
            try {
              if (String(val).trim() === '') return null;
              return formatNumberFixed(String(val), 2);
            } catch {
              return val;
            }
          }
        }
        return val;
      };

      Object.keys(pl).forEach((k) => {
        try {
          const v = pl[k];
          if (v === null || v === undefined) return;
          if (v instanceof Date || typeof v === 'string' || typeof v === 'number') {
            pl[k] = formatValueForKey(k, v);
            return;
          }
          if (Array.isArray(v)) {
            pl[k] = v.map((it) => {
              if (!it || typeof it !== 'object') return it;
              const copy: Record<string, unknown> = {};
              Object.keys(it as Record<string, unknown>).forEach((ik) => {
                copy[ik] = formatValueForKey(ik, (it as Record<string, unknown>)[ik]);
              });
              return copy;
            });
            return;
          }
          if (typeof v === 'object') {
            // shallow-format object fields (e.g., nested single objects)
            const obj = v as Record<string, unknown>;
            Object.keys(obj).forEach((ik) => {
              try {
                const newVal = formatValueForKey(ik, obj[ik]);
                obj[ik] = newVal as unknown;
              } catch {
                // ignore
              }
            });
            pl[k] = obj;
          }
        } catch {
          // ignore per-key
        }
      });
    } catch {
      // ignore overall
    }
  }

  async list<T>(params?: RequestParams): Promise<ApiPaginatedResponse<T>> {
    // Delegate to BaseService and normalize items while keeping the generic signature
    const res = await super.list<T>(params);
    try {
      const normalizedData = Array.isArray(res?.data) ? (res.data as unknown[]).map((d) => this.normalizeResponse(d) as unknown as T) : [];
      return { ...res, data: normalizedData } as ApiPaginatedResponse<T>;
    } catch {
      return res;
    }
  }

  async get<T>(id: string | number): Promise<T | null> {
    // Delegate to BaseService.get to preserve behavior (including 404 -> null)
    const raw = await super.get<T>(id);
    if (raw === null || raw === undefined) return null;
    // normalize and cast to expected generic
    return this.normalizeResponse(raw as unknown) as unknown as T;
  }

  // Normalize server response (snake_case) into frontend camelCase ServiceOrder shape
  normalizeResponse(raw: unknown) {
    if (!raw || typeof raw !== 'object') return raw;
    const r = raw as Record<string, unknown>;

    const out: Record<string, unknown> = { ...r };

    // map nested arrays
    if (Array.isArray(r.service_order_services)) {
      out.services = (r.service_order_services as unknown[]).map((si) => {
        const s = si as Record<string, unknown>;
        return {
          id: s.id,
          service_id: s.service_id ?? (s.service && (s.service as Record<string, unknown>).id),
          service: s.service,
          unit_price: s.unit_price ?? s.unitPrice,
          quantity: s.quantity ?? s.qty,
          total_price: s.total_price ?? s.totalPrice,
          scope: s.scope,
          description: s.description,
          created_at: this.maybeDate(s.created_at),
          updated_at: this.maybeDate(s.updated_at),
        };
      });
    }

    if (Array.isArray(r.service_order_payments)) {
      out.payments = (r.service_order_payments as unknown[]).map((p) => {
        const pp = p as Record<string, unknown>;
        return {
          id: pp.id,
          description: pp.description,
          document_type_id: pp.document_type_id ?? (pp.document_type && (pp.document_type as Record<string, unknown>).id),
          document_type: pp.document_type,
          document_number: pp.document_number ?? pp.documentNumber,
          unit_price: pp.unit_price ?? pp.unitPrice,
          quantity: pp.quantity,
          total_price: pp.total_price ?? pp.totalPrice,
          created_at: this.maybeDate(pp.created_at),
          updated_at: this.maybeDate(pp.updated_at),
        };
      });
    }

    if (Array.isArray(r.service_order_schedules)) {
      out.schedules = (r.service_order_schedules as unknown[]).map((s) => {
        const ss = s as Record<string, unknown>;
        return {
          id: ss.id,
          user_id: ss.user_id ?? (ss.user && (ss.user as Record<string, unknown>).id),
          user: ss.user,
          date: this.maybeDate(ss.date),
          end_date: this.maybeDate(ss.end_date),
          created_at: this.maybeDate(ss.created_at),
          updated_at: this.maybeDate(ss.updated_at),
        };
      });
    }

    // attachments
    if (Array.isArray(r.attachments)) {
      out.attachments = (r.attachments as unknown[]).map((a) => {
        const aa = a as Record<string, unknown>;
        return { ...aa, created_at: this.maybeDate(aa.created_at), updated_at: this.maybeDate(aa.updated_at) };
      });
    }

    // convert some date-like scalars
    ['created_at', 'updated_at', 'deleted_at', 'operation_starts_at', 'operation_finishes_at', 'bl_date', 'cargo_arrival_date', 'report_sent_at', 'invoice_sent_at', 'invoice_payed_at'].forEach((k) => {
      if (k in r) out[k] = this.maybeDate(r[k]);
    });

    return out;
  }

  maybeDate(v: unknown) {
    if (v instanceof Date) return v;
    if (typeof v === 'string' || typeof v === 'number') {
      const parsed = tryParseDate(v);
      return parsed ?? v;
    }
    return v;
  }

  async create<T = unknown>(payload: unknown): Promise<T> {
  // Before creating, remove nested objects and upload new attachments via presigned URLs
  const pl = payload as Record<string, unknown>;
      // apply date formatting (delegated to service)
      try {
        this.applyDateFormatting(pl);
      } catch {
        // ignore
      }
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
    // Use BaseService.create to ensure consistent request/error handling (retries, normalized ApiError)
  const data = await super.create<T>(pl);
    try {
      return this.normalizeResponse(data) as unknown as T;
    } catch {
      return data as unknown as T;
    }
  }

  // Typed wrapper: accept the submission DTO and return a normalized ServiceOrder
  async createSubmission(payload: ServiceOrderSubmission) {
    const raw = await this.create<unknown>(payload as unknown);
    return this.normalizeResponse(raw as unknown) as unknown as import('../models/serviceOrder').ServiceOrder;
  }

  async update<T = unknown>(id: string, payload: unknown): Promise<T> {
  const pl = payload as Record<string, unknown>;
      // apply date formatting (delegated to service)
      try {
        this.applyDateFormatting(pl);
      } catch {
        // ignore
      }
      console.log(pl);
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
    // Delegate to BaseService.update for consistent behavior and error shaping
  const data = await super.update<T>(id, pl);
    try {
      return this.normalizeResponse(data) as unknown as T;
    } catch {
      return data as unknown as T;
    }
  }

  // Typed wrapper: accept the submission DTO and return a normalized ServiceOrder
  async updateSubmission(id: string, payload: ServiceOrderSubmission): Promise<ServiceOrder> {
    const raw = await this.update<unknown>(id, payload as unknown);
    return this.normalizeResponse(raw as unknown) as ServiceOrder;
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

// (date formatting implemented as class method)

export default new ServiceOrderService();
