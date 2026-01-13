import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { getApiInfo, healthCheck } from './controllers/health.controller';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import invoiceRoutes from './routes/invoice.routes';
import productRoutes from './routes/product.routes';
import { morganStream } from './utils/logger';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());

// HTTP request logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: morganStream }));
app.use(express.json());

// Root & Health Check
app.get('/', getApiInfo);
app.get('/health', healthCheck);

// API Routes
app.use('/api/v1', productRoutes);
app.use('/api/v1', invoiceRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
