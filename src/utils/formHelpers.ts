import type { QueryClient } from '@tanstack/react-query';

export type SetCacheFn<T> = (updater: (prev: Record<string, T>) => Record<string, T>) => void;

// Generic helper to resolve AutoComplete value to an object for display
export function resolveAutoCompleteValue<T extends { id?: string }>(
  suggestions: T[],
  cache: Record<string, T> | undefined,
  fieldValue: unknown,
): T | unknown {
  if (fieldValue && typeof fieldValue === 'object') return fieldValue as T;
  const id = String(fieldValue ?? '');
  if (!id) return fieldValue;
  const found = suggestions.find((s) => s.id === id);
  if (found) return found;
  if (cache && id in cache) return cache[id];
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
