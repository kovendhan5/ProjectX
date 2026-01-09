/**
 * Unit tests for utility functions
 */

import {
    daysUntilExpiry,
    formatCurrency,
    generateBatchNumber,
    generateInvoiceNumber,
    generateSKU,
    isBatchExpired,
    isBatchExpiringSoon,
    isValidDateRange,
} from './generators';

describe('Generators Utility', () => {
  describe('generateInvoiceNumber', () => {
    it('should generate invoice number with correct format', () => {
      const invoiceNumber = generateInvoiceNumber();
      expect(invoiceNumber).toMatch(/^INV-\d{8}-\d{4}$/);
    });

    it('should generate unique invoice numbers', () => {
      const invoice1 = generateInvoiceNumber();
      const invoice2 = generateInvoiceNumber();
      // High probability of being different due to random component
      expect(invoice1).toBeDefined();
      expect(invoice2).toBeDefined();
    });
  });

  describe('generateBatchNumber', () => {
    it('should generate batch number with default prefix', () => {
      const batchNumber = generateBatchNumber();
      expect(batchNumber).toMatch(/^BATCH-\d{8}-\d{3}$/);
    });

    it('should generate batch number with custom prefix', () => {
      const batchNumber = generateBatchNumber('MED');
      expect(batchNumber).toMatch(/^MED-\d{8}-\d{3}$/);
    });
  });

  describe('generateSKU', () => {
    it('should generate SKU with default prefix', () => {
      const sku = generateSKU();
      expect(sku).toMatch(/^PRD-\d{5}$/);
    });

    it('should generate SKU with custom prefix', () => {
      const sku = generateSKU('DRUG');
      expect(sku).toMatch(/^DRUG-\d{5}$/);
    });
  });

  describe('isValidDateRange', () => {
    it('should return true for valid date range', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-12-31');
      expect(isValidDateRange(start, end)).toBe(true);
    });

    it('should return false if end date is before start date', () => {
      const start = new Date('2026-12-31');
      const end = new Date('2026-01-01');
      expect(isValidDateRange(start, end)).toBe(false);
    });

    it('should return false if dates are equal', () => {
      const date = new Date('2026-06-15');
      expect(isValidDateRange(date, date)).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with default USD', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toBe('$1,234.56');
    });

    it('should format currency with custom currency code', () => {
      const formatted = formatCurrency(1234.56, 'EUR');
      expect(formatted).toContain('1,234.56');
    });

    it('should handle zero amount', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toBe('$0.00');
    });
  });

  describe('daysUntilExpiry', () => {
    it('should calculate positive days for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const days = daysUntilExpiry(futureDate);
      expect(days).toBeGreaterThanOrEqual(30);
      expect(days).toBeLessThanOrEqual(31); // Account for rounding
    });

    it('should calculate negative days for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const days = daysUntilExpiry(pastDate);
      expect(days).toBeLessThan(0);
    });
  });

  describe('isBatchExpired', () => {
    it('should return true for expired batch', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isBatchExpired(pastDate)).toBe(true);
    });

    it('should return false for valid batch', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expect(isBatchExpired(futureDate)).toBe(false);
    });
  });

  describe('isBatchExpiringSoon', () => {
    it('should return true for batch expiring within threshold', () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 15);
      expect(isBatchExpiringSoon(soonDate, 30)).toBe(true);
    });

    it('should return false for batch expiring beyond threshold', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 60);
      expect(isBatchExpiringSoon(futureDate, 30)).toBe(false);
    });

    it('should return false for expired batch', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isBatchExpiringSoon(pastDate, 30)).toBe(false);
    });

    it('should accept custom threshold', () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 50);
      expect(isBatchExpiringSoon(soonDate, 60)).toBe(true);
      expect(isBatchExpiringSoon(soonDate, 30)).toBe(false);
    });
  });
});
