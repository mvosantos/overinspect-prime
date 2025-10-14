import type { QueryClient } from '@tanstack/react-query';
import { normalizeListResponse } from './apiHelpers';

type ListFn = (params: Record<string, unknown>) => Promise<unknown>;

type CreateAutocompleteOptions<T> = {
  listFn: ListFn;
  qc: QueryClient;
  cacheKeyRoot: string; // e.g. 'document_type'
  setSuggestions: (items: T[]) => void;
  setCache?: (updater: (prev: Record<string, T>) => Record<string, T>) => void;
  per_page?: number;
  filterKey?: string; // default 'name'
};

export function createAutocompleteComplete<T = unknown>(opts: CreateAutocompleteOptions<T>) {
  const perPage = opts.per_page ?? 20;
  const filterKey = opts.filterKey ?? 'name';

  return async (e: { query: string }) => {
    const q = e.query;
    try {
      const res = await opts.listFn({ per_page: perPage, filters: { [filterKey]: q } });
      const items = normalizeListResponse<T>(res);
      opts.setSuggestions(items ?? []);
  (items ?? []).forEach((it) => { const id = (it as unknown as { id?: string })?.id; if (id) opts.qc.setQueryData([opts.cacheKeyRoot, id], it); });
      if (opts.setCache) {
        opts.setCache((prev) => {
          const next = { ...(prev || {}) } as Record<string, T>;
    (items ?? []).forEach((it) => { const id = (it as unknown as { id?: string })?.id; if (id) next[id] = it as T; });
          return next;
        });
      }
    } catch {
      opts.setSuggestions([]);
    }
  };
}
