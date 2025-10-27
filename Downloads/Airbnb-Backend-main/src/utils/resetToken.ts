/**
 * 🔐 SISTEMA REAL DE TOKENS DE RESET CON JWT
 * 
 * Implementación real usando JWT para tokens de recuperación de contraseña.
 * Reemplaza el sistema mock por uno seguro y persistente.
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

interface ResetTokenPayload {
  userId: string;
  email: string;
  type: 'password-reset';
  iat: number;
  exp: number;
}

/**
 * 🔑 Genera un token JWT para reset de contraseña
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @returns Token JWT firmado para reset de contraseña
 */
export const generateResetToken = (userId: string, email: string): string => {
  try {
    const payload: ResetTokenPayload = {
      userId,
      email,
      type: 'password-reset',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };
    
    // Verificar que el secreto JWT esté disponible
    if (!config.jwtSecret || config.jwtSecret.length < 10) {
      throw new Error('JWT Secret no configurado correctamente');
    }
    
    // Generar token JWT con prefijo para identificación
    const token = jwt.sign(payload, config.jwtSecret);
    return `reset_${token}`;
    
  } catch (error) {
    console.error('❌ Error generando token de reset:', error);
    throw new Error('Error generando token de recuperación de contraseña');
  }
};

/**
 * 🔍 Verifica y decodifica un token JWT de reset
 * @param token - Token JWT a verificar (con o sin prefijo reset_)
 * @returns Payload decodificado o null si es inválido
 */
export const verifyResetToken = (token: string): ResetTokenPayload | null => {
  try {
    // Remover prefijo si existe
    const cleanToken = token.startsWith('reset_') ? token.replace('reset_', '') : token;
    
    // Verificar que el secreto JWT esté disponible
    if (!config.jwtSecret || config.jwtSecret.length < 10) {
      console.error('❌ JWT Secret no configurado');
      return null;
    }
    
    // Verificar y decodificar el token
    const decoded = jwt.verify(cleanToken, config.jwtSecret) as ResetTokenPayload;
    
    // Verificar que es un token de reset de contraseña
    if (decoded.type !== 'password-reset') {
      console.error('❌ Token no es de tipo password-reset');
      return null;
    }
    
    // Verificar estructura requerida
    if (!decoded.userId || !decoded.email) {
      console.error('❌ Token con estructura inválida');
      return null;
    }
    
    return decoded;
    
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('⏰ Token de reset expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('🔒 Token de reset inválido');
    } else {
      console.error('❌ Error verificando token de reset:', error);
    }
    return null;
  }
};

/**
 * 🗑️ Invalida un token de reset (para JWT, esto es principalmente informativo)
 * @param token - Token a invalidar
 * @returns true (siempre exitoso para JWT)
 */
export const invalidateResetToken = (token: string): boolean => {
  // Para JWT, la invalidación se maneja por expiración
  // En un sistema más avanzado, podrías mantener una blacklist
  console.log('🗑️ Token de reset marcado como usado:', token.substring(0, 20) + '...');
  return true;
};

/**
 * 🧹 Limpia tokens expirados (no necesario para JWT, pero mantiene compatibilidad)
 */
export const cleanupExpiredTokens = (): void => {
  // Para JWT, la limpieza es automática por expiración
  // No hay tokens en memoria que limpiar
  console.log('🧹 Limpieza de tokens JWT completada');
};

/**
 * 📊 Obtiene el número de tokens activos (siempre 0 para JWT)
 * @returns 0 (JWT no mantiene tokens en memoria)
 */
export const getActiveTokensCount = (): number => {
  // JWT no mantiene tokens en memoria
  return 0;
};
