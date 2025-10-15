export function parseNumberUniversal(v?: string | number | null) {
  if (v === null || v === undefined) return NaN;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/\./g, '').replace(/,/g, '.');
  const n = Number(s);
  return isNaN(n) ? NaN : n;
}

export function formatNumberFixed(v?: string | number | null, decimals = 2): string {
  const n = parseNumberUniversal(v);
  if (Number.isNaN(n)) return Number(0).toFixed(decimals);
  return Number(n).toFixed(decimals);
}
