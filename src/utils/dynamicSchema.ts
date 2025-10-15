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
    const effectiveRequired = Boolean(f.required);
    const typeHint = String(f.field_type ?? 'string').toLowerCase();
    let schema: z.ZodTypeAny;

  // Broaden detection: accept many SQL/DB type hints and common variants
  const numericTokens = ['int', 'number', 'float', 'decimal', 'numeric', 'double', 'real', 'bigint', 'smallint'];
  const boolTokens = ['bool', 'boolean', 'tinyint', 'bit'];
  const dateTokens = ['date', 'time', 'datetime', 'timestamp', 'timestamptz'];

  const containsAny = (tokens: string[]) => tokens.some((tok) => typeHint.includes(tok));

  const isNumeric = containsAny(numericTokens);
  const isBool = containsAny(boolTokens);
  const isDate = containsAny(dateTokens);

    if (isNumeric) {
      schema = z.preprocess((v) => {
        if (v === '' || v == null) return undefined;
        const parsed = typeof v === 'number' ? v : Number(String(v));
        return Number.isNaN(parsed) ? undefined : parsed;
      }, effectiveRequired ? z.number() : z.number().optional());
    } else if (isBool) {
      schema = z.preprocess((v) => {
        if (v === '' || v == null) return undefined;
        if (typeof v === 'boolean') return v;
        const s = String(v).toLowerCase();
        if (s === 'true' || s === '1') return true;
        if (s === 'false' || s === '0') return false;
        return Boolean(v);
      }, effectiveRequired ? z.boolean() : z.boolean().optional());
    } else if (isDate) {
      schema = z.preprocess((v) => {
        if (!v) return undefined;
        const d = v instanceof Date ? v : new Date(String(v));
        return Number.isNaN(d.getTime()) ? undefined : d;
      }, effectiveRequired ? z.date() : z.date().optional());
    } else {
      // accept numbers, objects and nulls for string-like fields by coercing to string
      // Important: for required string fields we must preserve empty string ('') so
      // Zod's `min(1)` will produce a clean "campo é obrigatório" message instead
      // of the generic "expected string, received undefined" that happens when the
      // preprocess returns undefined.
      schema = z.preprocess((v) => {
        // null/undefined => undefined (leave as missing)
        if (v == null) return undefined;
        // empty string: preserve for required fields so `min(1)` triggers;
        // for optional fields, convert empty string to undefined to allow omission.
        if (v === '') return f.required ? '' : undefined;
        if (typeof v === 'string') return v;
        // For objects that have a `name` or `id`, prefer `name` if present
        if (typeof v === 'object') {
          const obj = v as Record<string, unknown>;
          if (obj && obj.name && typeof obj.name === 'string') return obj.name;
          if (obj && obj.id && typeof obj.id === 'string') return obj.id;
        }
        // fallback: stringify numbers/booleans/others
        return String(v);
      }, effectiveRequired ? z.string().min(1, `${f.label ?? key} é obrigatório`) : z.string().optional());
    }

    if (effectiveRequired && (isNumeric || isBool || isDate)) {
      schema = schema.refine((v) => v !== undefined && v !== null, { message: `${f.label ?? key} é obrigatório` });
    }

    const defaultProvided = f.default_value !== undefined && f.default_value !== null && f.default_value !== '';
    return { key, schema, defaultProvided };
  };

  // top-level fields (those without a dot) are processed into the root shape
  const nestedByPrefix: Record<string, ServiceTypeFieldRaw[]> = {};
  for (const f of fields) {
    // The attachments area is handled separately by AttachmentsSection and
    // should NOT be included in the dynamic zod/schema rules. Skip any
    // service type field that belongs to the attachments area or table.
    // At runtime the field objects may include `area` or `table` properties
    // even if the TS type doesn't list them, so check both.
    const runtimeArea = (f as unknown as Record<string, unknown>)?.area as string | undefined;
    const runtimeTable = (f as unknown as Record<string, unknown>)?.table as string | undefined;
    if (runtimeArea === 'attachments' || runtimeTable === 'attachments') continue;
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

  // Special-case mapping: some service type configurations use a top-level
  // `service_description` field name that should affect the payments
  // line-item `description`. If present and visible, map it into the
  // payments nestedByPrefix so the generated payments[].description schema
  // will reflect the same `required`/`default_value` metadata.
  try {
    const svcDesc = fields.find((ff) => ff && typeof ff === 'object' && ff.name === 'service_description');
    if (svcDesc && (svcDesc as ServiceTypeFieldRaw).visible) {
      const already = (nestedByPrefix['payments'] ?? []).some((pf) => (pf.name.endsWith('.description') || pf.name === 'payments.description'));
      if (!already) {
        nestedByPrefix['payments'] = nestedByPrefix['payments'] ?? [];
        // create a synthetic payments.description entry using svcDesc metadata
        nestedByPrefix['payments'].push({ ...(svcDesc as ServiceTypeFieldRaw), name: 'payments.description' });
      }
    }
  } catch {
    // ignore any mapping errors
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

  // Note: removed ad-hoc compatibility fallbacks previously present here.
  // The schema generator now relies on broader heuristics above to infer
  // correct types (numeric/date/bool/string). If a specific field still
  // requires a custom mapping, add it near the makeSchemaForField logic.

  return { schema: z.object(shape) as z.ZodObject<Record<string, z.ZodTypeAny>>, defaults };
}
