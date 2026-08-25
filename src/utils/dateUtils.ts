import { 
  format, 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear, 
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  differenceInCalendarDays,
  parseISO,
  isValid
} from 'date-fns';
import { QuickDatePreset } from '../types/sales';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface ComparisonRange {
  current: { start: Date; end: Date };
  previous: { start: Date; end: Date };
}

/**
 * Calculates start and end Date objects for preset date filters based on anchor date (defaults to now)
 */
export function getDateRangeForPreset(
  preset: QuickDatePreset, 
  anchorDate: Date = new Date(),
  customStart?: string | null,
  customEnd?: string | null,
  month?: number | null,
  year?: number | null,
  specificDate?: string | null
): { start: Date | null; end: Date | null; label: string } {
  switch (preset) {
    case 'specificDate': {
      if (specificDate) {
        const parsed = parseISO(specificDate);
        if (isValid(parsed)) {
          const start = startOfDay(parsed);
          const end = endOfDay(parsed);
          return { start, end, label: format(parsed, 'd MMMM yyyy') }; // e.g. "15 May 2026"
        }
      }
      return { start: null, end: null, label: 'Specific Date' };
    }
    case 'today': {
      const start = startOfDay(anchorDate);
      const end = endOfDay(anchorDate);
      return { start, end, label: 'Today' };
    }
    case 'yesterday': {
      const yesterday = subDays(anchorDate, 1);
      const start = startOfDay(yesterday);
      const end = endOfDay(yesterday);
      return { start, end, label: 'Yesterday' };
    }
    case 'last7days': {
      const start = startOfDay(subDays(anchorDate, 6));
      const end = endOfDay(anchorDate);
      return { start, end, label: 'Last 7 Days' };
    }
    case 'last30days': {
      const start = startOfDay(subDays(anchorDate, 29));
      const end = endOfDay(anchorDate);
      return { start, end, label: 'Last 30 Days' };
    }
    case 'thisMonth': {
      const start = startOfMonth(anchorDate);
      const end = endOfMonth(anchorDate);
      return { start, end, label: format(anchorDate, 'MMMM yyyy') };
    }
    case 'lastMonth': {
      const lastMonth = subMonths(anchorDate, 1);
      const start = startOfMonth(lastMonth);
      const end = endOfMonth(lastMonth);
      return { start, end, label: format(lastMonth, 'MMMM yyyy') };
    }
    case 'thisQuarter': {
      const start = startOfQuarter(anchorDate);
      const end = endOfQuarter(anchorDate);
      return { start, end, label: `Q${Math.floor(anchorDate.getMonth() / 3) + 1} ${anchorDate.getFullYear()}` };
    }
    case 'thisYear': {
      const start = startOfYear(anchorDate);
      const end = endOfYear(anchorDate);
      return { start, end, label: `Year ${anchorDate.getFullYear()}` };
    }
    case 'allTime': {
      return { start: null, end: null, label: 'All Time' };
    }
    case 'monthYear': {
      if (month && year) {
        const targetDate = new Date(year, month - 1, 1);
        const start = startOfMonth(targetDate);
        const end = endOfMonth(targetDate);
        return { start, end, label: format(targetDate, 'MMMM yyyy') };
      }
      return { start: null, end: null, label: 'Selected Month' };
    }
    case 'custom': {
      const s = customStart ? parseISO(customStart) : null;
      const e = customEnd ? parseISO(customEnd) : null;
      const validS = s && isValid(s) ? startOfDay(s) : null;
      const validE = e && isValid(e) ? endOfDay(e) : null;
      const label = validS && validE 
        ? `${format(validS, 'MMM d, yyyy')} - ${format(validE, 'MMM d, yyyy')}`
        : 'Custom Range';
      return { start: validS, end: validE, label };
    }
    default:
      return { start: null, end: null, label: 'All Time' };
  }
}

/**
 * Calculates the equivalent previous comparison period
 * e.g., if current is single date May 15 (1 day), previous is May 14 (1 day)
 * if current is Jan 1 - Jan 15 (15 days), previous is Dec 17 - Dec 31 (15 days)
 */
export function getPreviousPeriodRange(start: Date | null, end: Date | null): { prevStart: Date | null; prevEnd: Date | null } {
  if (!start || !end) {
    return { prevStart: null, prevEnd: null };
  }
  const daysDiff = differenceInCalendarDays(end, start) + 1;
  const prevEnd = endOfDay(subDays(start, 1));
  const prevStart = startOfDay(subDays(prevEnd, daysDiff - 1));
  return { prevStart, prevEnd };
}

/**
 * Checks whether a given ISO date string or Date object falls between start and end (inclusive)
 */
export function isDateInRange(dateStrOrObj: string | Date, start: Date | null, end: Date | null): boolean {
  if (!start && !end) return true;
  
  const d = typeof dateStrOrObj === 'string' ? parseISO(dateStrOrObj) : dateStrOrObj;
  if (!isValid(d)) return false;

  const time = d.getTime();
  if (start && time < start.getTime()) return false;
  if (end && time > end.getTime()) return false;
  return true;
}

/**
 * Formats a date string safely
 */
export function formatDate(dateStr: string | null | undefined, fmt: string = 'MMM dd, yyyy'): string {
  if (!dateStr) return 'N/A';
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return dateStr;
    return format(parsed, fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  return formatDate(dateStr, 'MMM dd, yyyy · HH:mm');
}
