import { formatDistanceToNow } from 'date-fns';

export function formatCurrency(value: number, currency: string = 'USD'): string {
  if (value === undefined || value === null) return '-';
  
  if (value < 0.01 && value > -0.01 && value !== 0) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  if (value === undefined || value === null) return '-';
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);

  return value > 0 ? `+${formatted}` : formatted;
}

export function formatCompact(value: number): string {
  if (value === undefined || value === null) return '-';

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (value === undefined || value === null) return '-';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-gain';
  if (value < 0) return 'text-loss';
  return 'text-neutral';
}

export function timeAgo(timestamp: number): string {
  if (!timestamp) return '-';
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return '-';
  }
}
