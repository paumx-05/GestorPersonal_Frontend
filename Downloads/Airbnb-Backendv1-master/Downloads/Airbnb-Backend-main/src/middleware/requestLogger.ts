/**
 * MIDDLEWARE DE LOGGING DE REQUESTS
 * Registra todas las peticiones HTTP con métricas
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RequestWithId extends Request {
  requestId?: string;
  startTime?: number;
}

export const requestLogger = (req: RequestWithId, res: Response, next: NextFunction): void => {
  // Generar ID único para el request
  req.requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.startTime = Date.now();

  // Log del request entrante
  logger.info(`Incoming ${req.method} ${req.path}`, {
    requestId: req.requestId,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    type: 'request_start'
  });

  // Interceptar el método end de response para logging
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = Date.now() - (req.startTime || 0);
    const userId = (req as any).user?.userId;

    // Log del response
    logger.logRequest(
      req.method,
      req.path,
      res.statusCode,
      responseTime,
      userId
    );

    // Llamar al método original
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};
