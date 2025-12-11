import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3003; // Different port from API

const server = app.listen(PORT, () => {
  console.log(`[blockchain]: Service running at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Blockchain service closed');
  });
});
