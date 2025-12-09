import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import productRoutes from './routes/product.routes';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', productRoutes);

export default app;
