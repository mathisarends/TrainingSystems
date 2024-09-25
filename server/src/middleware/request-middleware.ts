import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger.js';

// Custom Middleware für HTTP-Request-Logging
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Event-Listener, der ausgeführt wird, wenn die Antwort fertig ist
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${duration}ms`,
      queryParams: req.query,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
  });

  next();
};

export default requestLogger;
