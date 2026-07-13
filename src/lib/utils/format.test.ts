import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatCompact,
  formatNumber,
  getChangeColor,
  timeAgo,
} from '@/lib/utils/format';

describe('formatCurrency', () => {
  it('returns "-" for undefined', () => {
    expect(formatCurrency(undefined as unknown as number)).toBe('-');
  });

  it('returns "-" for null', () => {
    expect(formatCurrency(null as unknown as number)).toBe('-');
  });

  it('formats USD by default', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats very small values with 6 decimals', () => {
    const result = formatCurrency(0.00000123);
    expect(result).toContain('0.00');
    expect(result).not.toBe('-');
  });

  it('formats very small negative values with 6 decimals', () => {
    const result = formatCurrency(-0.00000123);
    expect(result).toContain('-');
  });

  it('formats large values', () => {
    const result = formatCurrency(1000000);
    expect(result).toBe('$1,000,000.00');
  });

  it('supports different currencies', () => {
    const result = formatCurrency(100, 'EUR');
    expect(result).toContain('€');
  });

  it('handles boundary at 0.01', () => {
    const result = formatCurrency(0.01);
    expect(result).toBe('$0.01');
  });
});

describe('formatPercent', () => {
  it('returns "-" for undefined', () => {
    expect(formatPercent(undefined as unknown as number)).toBe('-');
  });

  it('returns "-" for null', () => {
    expect(formatPercent(null as unknown as number)).toBe('-');
  });

  it('adds + prefix for positive values', () => {
    const result = formatPercent(5.5);
    expect(result.startsWith('+')).toBe(true);
    expect(result).toContain('5.50%');
  });

  it('no + for negative values', () => {
    const result = formatPercent(-3.25);
    expect(result.startsWith('-')).toBe(true);
  });

  it('no + for zero', () => {
    const result = formatPercent(0);
    expect(result.startsWith('+')).toBe(false);
    expect(result).toContain('0.00%');
  });

  it('converts value from percentage points', () => {
    const result = formatPercent(100);
    expect(result).toContain('100.00%');
  });
});

describe('formatCompact', () => {
  it('returns "-" for undefined', () => {
    expect(formatCompact(undefined as unknown as number)).toBe('-');
  });

  it('returns "-" for null', () => {
    expect(formatCompact(null as unknown as number)).toBe('-');
  });

  it('formats large numbers compactly', () => {
    const result = formatCompact(1500000);
    expect(result).toContain('M');
  });

  it('formats thousands', () => {
    const result = formatCompact(5000);
    expect(result).toContain('K');
  });

  it('formats small numbers', () => {
    const result = formatCompact(42);
    expect(result).toBe('42');
  });
});

describe('formatNumber', () => {
  it('returns "-" for undefined', () => {
    expect(formatNumber(undefined as unknown as number)).toBe('-');
  });

  it('returns "-" for null', () => {
    expect(formatNumber(null as unknown as number)).toBe('-');
  });

  it('formats with default 2 decimals', () => {
    const result = formatNumber(123.456);
    expect(result).toBe('123.46');
  });

  it('formats with custom decimals', () => {
    const result = formatNumber(123.456, 4);
    expect(result).toBe('123.4560');
  });

  it('handles integers', () => {
    const result = formatNumber(100);
    expect(result).toBe('100.00');
  });
});

describe('getChangeColor', () => {
  it('returns gain for positive values', () => {
    expect(getChangeColor(5)).toBe('text-gain');
  });

  it('returns loss for negative values', () => {
    expect(getChangeColor(-5)).toBe('text-loss');
  });

  it('returns neutral for zero', () => {
    expect(getChangeColor(0)).toBe('text-neutral');
  });
});

describe('timeAgo', () => {
  it('returns "-" for falsy timestamp', () => {
    expect(timeAgo(0)).toBe('-');
    expect(timeAgo(null as unknown as number)).toBe('-');
  });

  it('returns a relative time string', () => {
    const now = Date.now();
    const result = timeAgo(now);
    expect(result).not.toBe('-');
    expect(result).toContain('ago');
  });

  it('returns "-" for invalid timestamp', () => {
    expect(timeAgo(NaN)).toBe('-');
  });

  it('returns "-" for timestamp that causes date-fns error', () => {
    const result = timeAgo(1);
    expect(result).not.toBe('-');
  });
});