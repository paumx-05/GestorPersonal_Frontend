/**
 * Hook personalizado para manejar la renovación automática de tokens
 * Implementa la renovación automática según la guía FRONTEND_TOKEN_REFRESH_GUIDE.md
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UseTokenRefreshOptions {
  // Intervalo en milisegundos para verificar la renovación (por defecto 14 minutos)
  checkInterval?: number;
  // Tiempo antes de la expiración para renovar (por defecto 5 minutos)
  refreshBeforeExpiry?: number;
}

export const useTokenRefresh = (options: UseTokenRefreshOptions = {}) => {
  const { refreshToken } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    checkInterval = 14 * 60 * 1000, // 14 minutos
    refreshBeforeExpiry = 5 * 60 * 1000 // 5 minutos
  } = options;

  useEffect(() => {
    console.log('🔄 [useTokenRefresh] Configurando renovación automática de tokens...');
    
    const checkAndRefreshToken = async () => {
      try {
        const token = localStorage.getItem('airbnb_auth_token');
        if (!token) {
          console.log('🔍 [useTokenRefresh] No hay token, saltando renovación');
          return;
        }

        // Decodificar el token para obtener la fecha de expiración
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000; // Convertir a milisegundos
          const now = Date.now();
          const timeUntilExpiry = exp - now;

          console.log('🔍 [useTokenRefresh] Tiempo hasta expiración:', Math.round(timeUntilExpiry / 1000 / 60), 'minutos');

          // Si el token expira en menos de refreshBeforeExpiry, renovarlo
          if (timeUntilExpiry < refreshBeforeExpiry) {
            console.log('🔄 [useTokenRefresh] Token próximo a expirar, renovando...');
            await refreshToken();
          } else {
            console.log('✅ [useTokenRefresh] Token aún válido, no es necesario renovar');
          }
        } catch (error) {
          console.error('💥 [useTokenRefresh] Error decodificando token:', error);
          // Si no se puede decodificar el token, intentar renovar
          await refreshToken();
        }
      } catch (error) {
        console.error('💥 [useTokenRefresh] Error en renovación automática:', error);
      }
    };

    // Ejecutar inmediatamente
    checkAndRefreshToken();

    // Configurar intervalo
    intervalRef.current = setInterval(checkAndRefreshToken, checkInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🧹 [useTokenRefresh] Limpiando intervalo de renovación');
      }
    };
  }, [refreshToken, checkInterval, refreshBeforeExpiry]);

  return {
    // Función para renovar manualmente
    refreshToken: async () => {
      try {
        await refreshToken();
        console.log('✅ [useTokenRefresh] Token renovado manualmente');
      } catch (error) {
        console.error('💥 [useTokenRefresh] Error en renovación manual:', error);
      }
    }
  };
};
