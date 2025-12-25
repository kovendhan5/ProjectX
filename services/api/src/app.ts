import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { healthCheck, getApiInfo } from './controllers/health.controller';
import invoiceRoutes from './routes/invoice.routes';
import productRoutes from './routes/product.routes';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Root & Health Check
app.get('/', getApiInfo);
app.get('/health', healthCheck);

// API Routes
app.use('/api/v1', productRoutes);
app.use('/api/v1', invoiceRoutes);

export default app;
