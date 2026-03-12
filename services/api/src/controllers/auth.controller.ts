import { Request, Response } from 'express';
import { generateToken, JwtPayload } from '../middleware/auth';

interface DemoUser {
  email: string;
  password: string;
  userId: string;
  role: JwtPayload['role'];
}

/** Demo credential store — replace with a real User model + bcrypt in production */
const getDemoUsers = (): DemoUser[] => [
  {
    email: 'admin@demo.com',
    password: process.env.DEMO_ADMIN_PASSWORD || 'Demo1234!',
    userId: 'user-admin-001',
    role: 'admin',
  },
  {
    email: 'pharmacy@demo.com',
    password: process.env.DEMO_PHARMACY_PASSWORD || 'Demo1234!',
    userId: 'user-pharmacy-001',
    role: 'pharmacy',
  },
  {
    email: 'regulator@demo.com',
    password: process.env.DEMO_REGULATOR_PASSWORD || 'Demo1234!',
    userId: 'user-regulator-001',
    role: 'regulator',
  },
];

/**
 * POST /api/v1/auth/login
 * Returns a signed JWT for valid demo credentials.
 * In production: query a User table and compare with bcrypt.
 */
export const login = (req: Request, res: Response): void => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  // Constant-time comparison is not critical here since this is a demo store,
  // but use generic message to avoid user enumeration.
  const user = getDemoUsers().find((u) => u.email === email && u.password === password);

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = generateToken({
    userId: user.userId,
    email: user.email,
    role: user.role,
  });

  res.json({
    token,
    expiresIn: '24h',
    user: {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
  });
};

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user (requires valid Bearer token).
 */
export const getMe = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user: req.user });
};
