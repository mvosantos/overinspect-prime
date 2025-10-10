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

  for (const f of fields) {
    if (!f.visible) continue;
    const key = f.name;
    const typeHint = String(f.field_type ?? 'string').toLowerCase();

    let schema: z.ZodTypeAny;

    // choose base zod type based on hint and whether field is required
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
      schema = f.required ? z.string().min(1, `${f.label ?? key} é obrigatório`) : z.string().optional();
    }

    // For non-string primitive types when required, add a friendly message
    if (f.required && (isNumeric || isBool || isDate)) {
      schema = schema.refine((v) => v !== undefined && v !== null, { message: `${f.label ?? key} é obrigatório` });
    }

    if (f.default_value !== undefined && f.default_value !== null && f.default_value !== '') {
      defaults[key] = f.default_value;
    }

    shape[key] = schema;
  }

  return { schema: z.object(shape) as z.ZodObject<Record<string, z.ZodTypeAny>>, defaults };
}
