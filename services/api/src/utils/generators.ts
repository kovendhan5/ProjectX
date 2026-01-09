/**
 * Utility functions for generating unique identifiers
 */

/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-XXXX
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `INV-${year}${month}${day}-${random}`;
}

/**
 * Generate a unique batch number
 * Format: BATCH-YYYYMMDD-XXX
 */
export function generateBatchNumber(prefix: string = 'BATCH'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return `${prefix}-${year}${month}${day}-${random}`;
}

/**
 * Generate a unique SKU
 * Format: PREFIX-XXXXX
 */
export function generateSKU(prefix: string = 'PRD'): string {
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `${prefix}-${random}`;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Calculate days until expiry
 */
export function daysUntilExpiry(expiryDate: Date): number {
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if batch is expired
 */
export function isBatchExpired(expiryDate: Date): boolean {
  return daysUntilExpiry(expiryDate) < 0;
}

/**
 * Check if batch is expiring soon (within 30 days)
 */
export function isBatchExpiringSoon(expiryDate: Date, daysThreshold: number = 30): boolean {
  const days = daysUntilExpiry(expiryDate);
  return days > 0 && days <= daysThreshold;
}
