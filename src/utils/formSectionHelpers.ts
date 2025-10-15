export type FieldMeta = {
  name: string;
  label?: string;
  default_value?: unknown;
  visible?: boolean;
  required?: boolean;
  field_type?: string | null;
  area?: string | null;
};

export const metaFor = (fields: FieldMeta[] | undefined) => (name: string) => (fields || []).find((f) => f.name === name) as FieldMeta | undefined;

export const showIfVisible = (fields: FieldMeta[] | undefined) => (name: string) => !!(metaFor(fields)(name) && metaFor(fields)(name)?.visible === true);

export const isRequired = (fields: FieldMeta[] | undefined) => (name: string) => !!(metaFor(fields)(name) && metaFor(fields)(name)?.required === true);

export const paymentsAreaVisible = (fields: FieldMeta[] | undefined) => () => {
  if (!fields || fields.length === 0) return true;
  return (fields || []).some((f) => {
    if (!f) return false;
    const isPaymentName = f.name.startsWith('payment_') || f.name.startsWith('payments_') || f.area === 'payments' || f.name.includes('payments.');
    return isPaymentName && f.visible === true;
  });
};

export function getErrorMessage(errors: Record<string, unknown> | undefined, name: string) {
  if (!errors) return '';
  const e = errors[name] as unknown;
  if (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) {
    const m = (e as Record<string, unknown>).message;
    return typeof m === 'string' ? m : '';
  }
  return '';
}

export const makeFormFieldMapper = (formFields: Record<string, ((idx: number) => string) | string>) => (apiName: string, idx?: number) => {
  const f = formFields[apiName];
  if (!f) return apiName;
  if (typeof f === 'string') return f;
  return typeof idx === 'number' ? f(idx) : f(0);
};
