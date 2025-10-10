export function normalizeListResponse<T>(res: unknown): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (typeof res === 'object') {
    const r = res as Record<string, unknown>;
    if (Array.isArray(r.data)) return r.data as T[];
    if (r.data && typeof r.data === 'object') {
      const nested = r.data as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as T[];
    }
  }
  return [];
}
