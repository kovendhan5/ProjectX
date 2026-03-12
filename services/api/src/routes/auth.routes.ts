import { Router } from 'express';
import { getMe, login } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/v1/auth/login  — obtain a JWT (rate-limited)
router.post('/login', writeLimiter, login);

// GET /api/v1/auth/me — return current user (requires valid Bearer token)
router.get('/me', authenticate, getMe);

export default router;
