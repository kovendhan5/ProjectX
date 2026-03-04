import dotenv from 'dotenv';
import app from './app';
import prisma from './config/db';
import logger from './config/logger';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`[server]: Server is running at http://localhost:${PORT}`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received: shutting down gracefully`);
  server.close(async () => {
    logger.info('HTTP server closed');
    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

