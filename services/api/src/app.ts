import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { getApiInfo, healthCheck } from './controllers/health.controller';
import { authenticate, optionalAuthenticate, validateJwtSecurityConfig } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import invoiceRoutes from './routes/invoice.routes';
import productRoutes from './routes/product.routes';

const app: Express = express();

validateJwtSecurityConfig();

// Security headers
app.use(helmet());
app.disable('x-powered-by');

// CORS — allow only whitelisted origins in production
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3002,http://localhost:3004')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Request logging (JSON in prod, coloured in dev)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global rate limiter
app.use(globalLimiter);

const authRequired = process.env.AUTH_REQUIRED
  ? process.env.AUTH_REQUIRED === 'true'
  : process.env.NODE_ENV === 'production';

const apiAuthMiddleware = authRequired ? authenticate : optionalAuthenticate;

// Public endpoints — no auth required
app.get('/', getApiInfo);
app.get('/health', healthCheck);

// Protected API Routes — JWT required
app.use('/api/v1', apiAuthMiddleware, productRoutes);
app.use('/api/v1', apiAuthMiddleware, invoiceRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
