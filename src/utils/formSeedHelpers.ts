import type { ServiceOrder } from '../models/serviceOrder';
import type { FormServiceItemSubmission, FormPaymentItemSubmission, FormScheduleItemSubmission } from '../models/serviceOrder';

// Map server `services` (service_order_services) into form `services` items
export function mapServicesSourceToForm(src?: ServiceOrder['services']): FormServiceItemSubmission[] {
  if (!Array.isArray(src)) return [];
  return src.map((s) => {
    try {
  const o = (s as unknown) as Record<string, unknown> | undefined;
      let serviceId: string | null = null;
      if (o) {
        if (typeof o.service_id === 'string') serviceId = o.service_id;
        else if (typeof o.service_id === 'number') serviceId = String(o.service_id);
        else if (o.service && typeof o.service === 'object') {
          const svc = o.service as Record<string, unknown>;
          if (typeof svc.id === 'string') serviceId = svc.id;
        }
      }
      const unit_price = o && (typeof o.unit_price === 'string' || typeof o.unit_price === 'number') ? String(o.unit_price) : '0.00';
      const quantity = o && (typeof o.quantity === 'string' || typeof o.quantity === 'number') ? String(o.quantity) : '0';
      const total_price = o && (typeof o.total_price === 'string' || typeof o.total_price === 'number') ? String(o.total_price) : '0.00';
      const scope = o && typeof o.scope === 'string' ? o.scope : '';
      return {
        service_id: serviceId ?? null,
        unit_price,
        quantity,
        total_price,
        scope,
      } as FormServiceItemSubmission;
    } catch {
      return { service_id: null, unit_price: '0.00', quantity: '0', total_price: '0.00', scope: '' } as FormServiceItemSubmission;
    }
  });
}

// Map server `payments` into form payments
export function mapPaymentsSourceToForm(src?: ServiceOrder['payments']): FormPaymentItemSubmission[] {
  if (!Array.isArray(src)) return [];
  return src.map((p) => {
    try {
  const o = (p as unknown) as Record<string, unknown> | undefined;
      const id = o && (typeof o.id === 'string' || typeof o.id === 'number') ? String(o.id) : undefined;
      const description = o && typeof o.description === 'string' ? o.description : '';
      const document_type_id = o && (typeof o.document_type_id === 'string' || typeof o.document_type_id === 'number') ? String(o.document_type_id) : null;
      const document_number = o && typeof o.document_number === 'string' ? o.document_number : '';
      const unit_price = o && (typeof o.unit_price === 'string' || typeof o.unit_price === 'number') ? String(o.unit_price) : '0.00';
      const quantity = o && (typeof o.quantity === 'string' || typeof o.quantity === 'number') ? String(o.quantity) : '0';
      const total_price = o && (typeof o.total_price === 'string' || typeof o.total_price === 'number') ? String(o.total_price) : '0.00';
      return { id, description, document_type_id: document_type_id as unknown as string | null, document_number, unit_price, quantity, total_price } as FormPaymentItemSubmission;
    } catch {
      return { id: undefined, description: '', document_type_id: null, document_number: '', unit_price: '0.00', quantity: '0', total_price: '0.00' } as FormPaymentItemSubmission;
    }
  });
}

// Map server `schedules` into form schedules
export function mapSchedulesSourceToForm(src?: ServiceOrder['schedules']): FormScheduleItemSubmission[] {
  if (!Array.isArray(src)) return [];
  return src.map((s) => {
    try {
  const o = (s as unknown) as Record<string, unknown> | undefined;
      const id = o && (typeof o.id === 'string' || typeof o.id === 'number') ? String(o.id) : undefined;
      const user_id = o && (typeof o.user_id === 'string' || typeof o.user_id === 'number') ? String(o.user_id) : null;
      const date = o && (typeof o.date === 'string' || o.date instanceof Date) ? (o.date as string | Date) : null;
      return { id, user_id, date } as FormScheduleItemSubmission;
    } catch {
      return { id: undefined, user_id: null, date: null } as FormScheduleItemSubmission;
    }
  });
}
