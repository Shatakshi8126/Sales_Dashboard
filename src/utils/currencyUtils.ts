/**
 * Centralized Indian Currency (INR) and Number Formatting Utilities
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrNoDecimalsFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-IN');

/**
 * Formats a number as standard Indian Rupee string: e.g. ₹1,25,000.50
 */
export function formatINR(value: number | null | undefined, includeDecimals = true): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0.00';
  }
  return includeDecimals ? inrFormatter.format(value) : inrNoDecimalsFormatter.format(value);
}

/**
 * Formats large amounts compactly for charts and metric badges (e.g. ₹7.07L, ₹45.2K)
 */
export function formatCompactINR(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 10000000) { // 1 Crore
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) { // 1 Lakh
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) { // 1 Thousand
    return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

/**
 * Formats regular integers / counts with Indian commas (e.g. 1,000)
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return numberFormatter.format(value);
}

/**
 * Formats percentage values (e.g. +14.2% or -5.1%)
 */
export function formatGrowth(value: number | null | undefined): { text: string; isPositive: boolean; isNeutral: boolean } {
  if (value === null || value === undefined || isNaN(value)) {
    return { text: 'N/A', isPositive: false, isNeutral: true };
  }
  const isPositive = value > 0;
  const isNeutral = Math.abs(value) < 0.01;
  const prefix = isPositive ? '+' : '';
  return {
    text: `${prefix}${value.toFixed(1)}%`,
    isPositive,
    isNeutral,
  };
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(1)}%`;
}
