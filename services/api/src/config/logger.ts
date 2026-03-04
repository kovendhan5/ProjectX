import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  // In production, output structured JSON (no transport needed)
  ...(process.env.NODE_ENV === 'production' && {
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
});

export default logger;
