import { format, parseISO, isValid, parse } from 'date-fns';

// Try parse flexible ISO / common formats
const tryParseDate = (v: unknown): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v !== 'string') return null;

  // try parse ISO first
  const d1 = parseISO(v);
  if (isValid(d1)) return d1;

  const formats = ['yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm', 'yyyy-MM-dd', "dd/MM/yyyy", "dd/MM/yyyy HH:mm"];
  for (const f of formats) {
    try {
      const p = parse(v, f, new Date());
      if (isValid(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
};

export const formatForPayload = (v: unknown): unknown => {
  if (!v) return v;
  const d = tryParseDate(v);
  if (!d) return v;
  return format(d, 'yyyy-MM-dd HH:mm');
};

export const parseToDateOrOriginal = (v: unknown): unknown => {
  if (!v) return v;
  const d = tryParseDate(v);
  return d ?? v;
};

export const formatShortDate = (v: unknown): string => {
  if (!v) return '';
  const d = tryParseDate(v);
  if (!d) return String(v ?? '');
  return format(d, 'dd/MM/yyyy');
};

export const formatShortDateTime = (v: unknown): string => {
  if (!v) return '';
  const d = tryParseDate(v);
  if (!d) return String(v ?? '');
  return format(d, 'dd/MM/yyyy HH:mm');
};

// Explicit helpers for API payload formatting
// Date-only (yyyy-MM-dd)
export const formatDateOnlyForApi = (v: unknown): string | null => {
  if (!v) return null;
  const d = tryParseDate(v);
  if (!d) return null;
  return format(d, 'yyyy-MM-dd');
};

// Date+time with seconds (yyyy-MM-dd H:mm:ss)
// Note: uses single 'H' to match the requested pattern (hour without leading zero).
export const formatDateTimeForApi = (v: unknown): string | null => {
  if (!v) return null;
  const d = tryParseDate(v);
  if (!d) return null;
  // Use HH for zero-padded 24-hour format
  return format(d, 'yyyy-MM-dd HH:mm:ss');
};
