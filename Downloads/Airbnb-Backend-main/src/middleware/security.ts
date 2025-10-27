/**
 * MIDDLEWARE DE SEGURIDAD AVANZADA
 * Protecciones adicionales contra ataques comunes
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Lista de IPs bloqueadas (en producción usar Redis o base de datos)
const blockedIPs = new Set<string>();

/**
 * 🔒 HEADERS DE SEGURIDAD COMPLETOS
 * Implementa todos los headers de seguridad estándar recomendados por OWASP
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Headers de seguridad completos
  res.set({
    // Identificación del servidor
    'X-Powered-By': 'Express/Node.js',
    
    // Prevenir MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevenir clickjacking
    'X-Frame-Options': 'DENY',
    
    // Protección XSS (legacy, pero aún útil para navegadores antiguos)
    'X-XSS-Protection': '1; mode=block',
    
    // Política de referrer
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permisos de características del navegador
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    
    // Content Security Policy (CSP)
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    
    // HTTP Strict Transport Security (HSTS)
    // Solo habilitar en producción con HTTPS
    ...(process.env.NODE_ENV === 'production' ? {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    } : {}),
    
    // Prevenir DNS prefetching
    'X-DNS-Prefetch-Control': 'off',
    
    // Deshabilitar descarga de recursos no seguros
    'X-Download-Options': 'noopen',
    
    // Cache control para contenido sensible
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  next();
};

export const ipBlocking = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (blockedIPs.has(ip)) {
    logger.warn(`Blocked IP attempted access: ${ip}`, {
      path: req.path,
      userAgent: req.get('User-Agent'),
      type: 'ip_blocked'
    });

    res.status(403).json({
      success: false,
      error: { message: 'Acceso denegado' }
    });
    return;
  }

  next();
};

export const requestSizeLimiter = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSize) {
      logger.warn(`Request too large: ${contentLength} bytes`, {
        path: req.path,
        ip: req.ip,
        maxSize,
        type: 'request_too_large'
      });

      res.status(413).json({
        success: false,
        error: { message: 'Request demasiado grande' }
      });
      return;
    }

    next();
  };
};

// Función para bloquear IP (útil para admin)
export const blockIP = (ip: string): void => {
  blockedIPs.add(ip);
  logger.warn(`IP blocked: ${ip}`, { type: 'ip_blocked_admin' });
};

// Función para desbloquear IP
export const unblockIP = (ip: string): void => {
  blockedIPs.delete(ip);
  logger.info(`IP unblocked: ${ip}`, { type: 'ip_unblocked_admin' });
};
