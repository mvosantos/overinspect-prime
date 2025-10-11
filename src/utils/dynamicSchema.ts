import { z } from 'zod';

type ServiceTypeFieldRaw = {
  name: string;
  label?: string;
  default_value?: unknown;
  visible?: boolean;
  required?: boolean;
  field_type?: string | null;
};

// Build a Zod schema shape from service_type_fields and return defaults for useForm
export function buildZodSchemaFromFields(fields: ServiceTypeFieldRaw[]): { schema: z.ZodObject<Record<string, z.ZodTypeAny>>; defaults: Record<string, unknown> } {
  const shape: Record<string, z.ZodTypeAny> = {};
  const defaults: Record<string, unknown> = {};
  // helper to build a schema for a single field
  const makeSchemaForField = (f: ServiceTypeFieldRaw): { key: string; schema?: z.ZodTypeAny; defaultProvided?: boolean } => {
    const key = f.name;
    const typeHint = String(f.field_type ?? 'string').toLowerCase();
    let schema: z.ZodTypeAny;

    const isNumeric = typeHint.includes('int') || typeHint === 'number' || typeHint.includes('float') || typeHint.includes('decimal');
    const isBool = typeHint.includes('bool');
    const isDate = typeHint.includes('date') || typeHint.includes('time');

    if (isNumeric) {
      schema = z.preprocess((v) => {
        if (v === '' || v == null) return undefined;
        const parsed = typeof v === 'number' ? v : Number(String(v));
        return Number.isNaN(parsed) ? undefined : parsed;
      }, f.required ? z.number() : z.number().optional());
    } else if (isBool) {
      schema = z.preprocess((v) => {
        if (v === '' || v == null) return undefined;
        if (typeof v === 'boolean') return v;
        const s = String(v).toLowerCase();
        if (s === 'true' || s === '1') return true;
        if (s === 'false' || s === '0') return false;
        return Boolean(v);
      }, f.required ? z.boolean() : z.boolean().optional());
    } else if (isDate) {
      schema = z.preprocess((v) => {
        if (!v) return undefined;
        const d = v instanceof Date ? v : new Date(String(v));
        return Number.isNaN(d.getTime()) ? undefined : d;
      }, f.required ? z.date() : z.date().optional());
    } else {
      // accept numbers, objects and nulls for string-like fields by coercing to string
      schema = z.preprocess((v) => {
        if (v === '' || v == null || v === undefined) return undefined;
        if (typeof v === 'string') return v;
        // For objects that have a `name` or `id`, prefer `name` if present
        if (typeof v === 'object') {
          const obj = v as Record<string, unknown>;
          if (obj && obj.name && typeof obj.name === 'string') return obj.name;
          if (obj && obj.id && typeof obj.id === 'string') return obj.id;
        }
        // fallback: stringify numbers/booleans/others
        return String(v);
      }, f.required ? z.string().min(1, `${f.label ?? key} é obrigatório`) : z.string().optional());
    }

    if (f.required && (isNumeric || isBool || isDate)) {
      schema = schema.refine((v) => v !== undefined && v !== null, { message: `${f.label ?? key} é obrigatório` });
    }

    const defaultProvided = f.default_value !== undefined && f.default_value !== null && f.default_value !== '';
    return { key, schema, defaultProvided };
  };

  // top-level fields (those without a dot) are processed into the root shape
  const nestedByPrefix: Record<string, ServiceTypeFieldRaw[]> = {};
  for (const f of fields) {
    if (!f.visible) continue;
    // support legacy/alternate naming conventions where nested collection
    // fields are sent using prefixes like `service_foo` or `payment_bar`.
    if (f.name.startsWith('service_')) {
      // convert to a payments-like nested entry under 'services' with dot syntax
      const rest = f.name.slice('service_'.length);
      nestedByPrefix['services'] = nestedByPrefix['services'] ?? [];
      nestedByPrefix['services'].push({ ...f, name: `services.${rest}` });
      continue;
    }
    if (f.name.startsWith('payment_') || f.name.startsWith('payments_')) {
      const rest = f.name.replace(/^payment_s?_/, '').replace(/^payments?_/, '');
      nestedByPrefix['payments'] = nestedByPrefix['payments'] ?? [];
      nestedByPrefix['payments'].push({ ...f, name: `payments.${rest}` });
      continue;
    }
    if (f.name.includes('.')) {
      const [prefix] = f.name.split('.', 1);
      nestedByPrefix[prefix] = nestedByPrefix[prefix] ?? [];
      nestedByPrefix[prefix].push(f);
      continue;
    }
    const { key, schema, defaultProvided } = makeSchemaForField(f);
    if (schema) shape[key] = schema;
    if (defaultProvided) defaults[key] = f.default_value as unknown;
  }

  // handle payments[] nested schema if present
  if (nestedByPrefix['payments'] && nestedByPrefix['payments'].length > 0) {
    const paymentsFields = nestedByPrefix['payments'];
    const itemShape: Record<string, z.ZodTypeAny> = {};
    for (const pf of paymentsFields) {
      // field name like 'payments.unit_price' -> itemKey 'unit_price'
      const parts = pf.name.split('.');
      const itemKey = parts.slice(1).join('.');
      if (!pf.visible) continue;
      // build schema for nested field but adjust key
      const cloned: ServiceTypeFieldRaw = { ...pf, name: itemKey };
  const { schema } = makeSchemaForField(cloned);
      if (schema) itemShape[itemKey] = schema as z.ZodTypeAny;
    }

    // attach payments array schema
    shape['payments'] = z.array(z.object(itemShape)).optional().default([]);
    defaults['payments'] = [];
  }

  // handle services[] nested schema if present (legacy service_ prefixed fields)
  if (nestedByPrefix['services'] && nestedByPrefix['services'].length > 0) {
    const servicesFields = nestedByPrefix['services'];
    const itemShape: Record<string, z.ZodTypeAny> = {};
    for (const sf of servicesFields) {
      const parts = sf.name.split('.');
      const itemKey = parts.slice(1).join('.');
      if (!sf.visible) continue;
      const cloned: ServiceTypeFieldRaw = { ...sf, name: itemKey };
  const { schema } = makeSchemaForField(cloned);
      if (schema) itemShape[itemKey] = schema as z.ZodTypeAny;
    }

    shape['services'] = z.array(z.object(itemShape)).optional().default([]);
    defaults['services'] = [];
  }

  return { schema: z.object(shape) as z.ZodObject<Record<string, z.ZodTypeAny>>, defaults };
}
