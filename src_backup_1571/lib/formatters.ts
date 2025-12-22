import { format, parseISO } from 'date-fns';

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd-MM-yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd-MM-yyyy HH:mm');
  } catch {
    return dateString;
  }
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US').format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function toISODate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}
