import type { QueryClient } from '@tanstack/react-query';

export type SetCacheFn<T> = (updater: (prev: Record<string, T>) => Record<string, T>) => void;

// Generic helper to resolve AutoComplete value to an object for display
export function resolveAutoCompleteValue<T extends { id?: string }>(
  suggestions: T[],
  cache: Record<string, T> | undefined,
  fieldValue: unknown,
  qc?: QueryClient | undefined,
  cacheKey?: string | undefined,
): T | unknown {
  // If field already stores the full object, just return it
  if (fieldValue && typeof fieldValue === 'object') return fieldValue as T;
  const id = String(fieldValue ?? '');
  if (!id) return fieldValue;
  // Try suggestions first (fresh search results)
  const found = suggestions.find((s) => s.id === id);
  if (found) return found;
  // Then try local component cache
  if (cache && id in cache) return cache[id];
  // Finally, if a react-query client and cacheKey were provided, try reading cached full object
  try {
    if (qc && cacheKey) {
      const qd = qc.getQueryData([cacheKey, id]) as T | undefined;
      if (qd && typeof qd === 'object') return qd;
    }
  } catch {
    // ignore failures reading from query cache
  }
  // fallback to raw value
  return fieldValue;
}

// Factory to create a generic onChange handler for AutoComplete fields that select an object with `id`.
// Options:
// - objectFieldKey: optional form field name to set the full object (e.g. 'first_site')
// - setFormValue: optional react-hook-form setValue function
// - setCache: optional state setter to keep local cache for suggestions
// - cacheKey: optional cache key to store the object in react-query
// - qc: optional QueryClient to call qc.setQueryData([cacheKey, id], obj)
export function makeAutoCompleteOnChange<T extends { id?: string }>(opts: {
  objectFieldKey?: string;
  setFormValue?: (name: string, value: unknown) => void;
  setCache?: SetCacheFn<T> | undefined;
  cacheKey?: string | undefined;
  qc?: QueryClient | undefined;
}) {
  const { objectFieldKey, setFormValue, setCache, cacheKey, qc } = opts;
  return (fieldOnChange: (v: unknown) => void) => (e: { value: unknown }) => {
    const value = e.value;
    if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
      const id = (value as Record<string, unknown>).id as string;
      fieldOnChange(id);
      if (setCache) {
        setCache((prev) => ({ ...prev, [id]: value as T }));
      }
      if (objectFieldKey && setFormValue) setFormValue(objectFieldKey, value as T);
      if (cacheKey && qc) qc.setQueryData([cacheKey, id], value as T);
    } else {
      fieldOnChange(String(value ?? '') || null);
      if (objectFieldKey && setFormValue) setFormValue(objectFieldKey, undefined);
    }
  };
}

// Utility to seed a local cache and react-query cache for an object
export function seedCachedObject<T extends { id?: string }>(
  obj: T | undefined,
  id: string | undefined,
  setCache: SetCacheFn<T>,
  qc?: QueryClient | undefined,
  cacheKey?: string,
) {
  if (!obj || !id) return;
  setCache((prev) => ({ ...(prev || {}), [id]: obj }));
  try {
    if (qc && cacheKey) qc.setQueryData([cacheKey, id], obj);
  } catch {
    // ignore
  }
}

// Resolve configured field name (cfg may be undefined)
export function resolveFieldName(cfg: { name?: string } | undefined, fallback: string) {
  return cfg?.name ?? fallback;
}

// Resolve default value for a form field: prefer explicit itemValue, then cfg.default_value, else fallback (or null)
export function resolveFieldDefault(cfg: { default_value?: unknown } | undefined, itemValue: unknown, fallback?: unknown) {
  if (itemValue !== undefined && itemValue !== null) return itemValue;
  if (cfg && cfg.default_value !== undefined) return cfg.default_value;
  return fallback ?? null;
}
