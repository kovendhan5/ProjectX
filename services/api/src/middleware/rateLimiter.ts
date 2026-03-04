import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter — applies to all API routes.
 * 100 requests per 15-minute window per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.',
  },
});

/**
 * Stricter rate limiter for write (mutation) endpoints.
 * 20 requests per 15-minute window per IP.
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many write requests. Please try again later.',
  },
});
