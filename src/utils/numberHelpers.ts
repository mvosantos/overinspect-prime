export function parseNumberUniversal(v?: string | number | null) {
  if (v === null || v === undefined) return NaN;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/\./g, '').replace(/,/g, '.');
  const n = Number(s);
  return isNaN(n) ? NaN : n;
}
