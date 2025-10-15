import { describe, it, expect } from 'vitest';
import serviceOrderService from '../serviceOrderService';

describe('ServiceOrderService.applyDateFormatting', () => {
  it('formats date-only fields to yyyy-MM-dd', () => {
    const pl: Record<string, unknown> = { some_date: new Date('2025-10-30T00:00:00-03:00') };
    serviceOrderService.applyDateFormatting(pl);
    expect(pl.some_date).toBe('2025-10-30');
  });

  it('formats Date.toString() payload dates', () => {
    const raw = new Date('2025-10-16T00:00:00-03:00').toString();
    const pl: Record<string, unknown> = { nomination_date: raw };
    serviceOrderService.applyDateFormatting(pl);
    expect(pl.nomination_date).toBe('2025-10-16');
  });

  it('formats datetime whitelist fields to yyyy-MM-dd HH:mm:ss', () => {
    const pl: Record<string, unknown> = { operation_finishes_at: new Date('2025-10-30T15:45:30-03:00') };
    serviceOrderService.applyDateFormatting(pl);
    expect(pl.operation_finishes_at).toBe('2025-10-30 15:45:30');
  });

  it('formats weight fields to fixed 2 decimals strings', () => {
    const pl: Record<string, unknown> = {
      gross_volume_landed: '1.234,5',
      net_volume_invoice: 2.5,
      tare_volume_invoice: null,
    };
    serviceOrderService.applyDateFormatting(pl);
    expect(pl.gross_volume_landed).toBe('1234.50');
    expect(pl.net_volume_invoice).toBe('2.50');
    // null should remain null
    expect(pl.tare_volume_invoice).toBeNull();
  });
});
