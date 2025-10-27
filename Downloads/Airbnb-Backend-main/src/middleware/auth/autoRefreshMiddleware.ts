/**
 * 🔄 MIDDLEWARE DE RENOVACIÓN AUTOMÁTICA DE TOKENS
 * 
 * 📝 DESCRIPCIÓN:
 * Middleware que verifica si un token está próximo a expirar y lo renueva automáticamente.
 * Útil para mantener sesiones activas sin interrupciones.
 * 
 * 🔧 CARACTERÍSTICAS:
 * - Verifica si el token está próximo a expirar
 * - Renueva automáticamente el token si es necesario
 * - Agrega el nuevo token a la respuesta
 * - Mantiene la sesión activa sin intervención del usuario
 */

import { Response, NextFunction } from 'express';
import { verifyToken, refreshToken, shouldRefreshToken, extractTokenFromHeader } from '../../utils/jwt';
import { AuthenticatedRequest } from '../../types/auth';

export const autoRefreshMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      next();
      return;
    }
    
    // Verificar si el token es válido
    const decoded = verifyToken(token);
    if (!decoded) {
      next();
      return;
    }
    
    // Verificar si el token necesita renovación
    if (shouldRefreshToken(token)) {
      console.log('🔄 Token próximo a expirar, renovando automáticamente...');
      
      const newToken = refreshToken(token);
      
      if (newToken) {
        console.log('✅ Token renovado exitosamente');
        
        // Agregar el nuevo token a la respuesta
        res.setHeader('X-New-Token', newToken);
        res.setHeader('X-Token-Refreshed', 'true');
        
        // Actualizar el usuario en el request con el nuevo token
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
      } else {
        console.log('❌ No se pudo renovar el token');
      }
    }
    
    next();
  } catch (error) {
    console.error('Error en autoRefreshMiddleware:', error);
    next();
  }
};

/**
 * 🔄 Middleware para rutas que requieren renovación automática
 * Aplica renovación automática solo a rutas específicas
 */
export const withAutoRefresh = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Aplicar renovación automática
  autoRefreshMiddleware(req, res, next);
};

export default {
  autoRefreshMiddleware,
  withAutoRefresh
};
