/**
 * Interceptor de Axios para renovación automática de tokens JWT
 * Implementa la renovación automática según la guía FRONTEND_TOKEN_REFRESH_GUIDE.md
 */

import { apiClient } from './config';

// Variable para evitar múltiples intentos de renovación simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

/**
 * Procesar la cola de peticiones fallidas después de renovar el token
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Interceptor de respuesta para manejar tokens expirados
 */
export const setupResponseInterceptor = () => {
  // Interceptor de respuesta para manejar tokens expirados
  const originalRequest = apiClient.request.bind(apiClient);
  
  apiClient.request = async function<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${apiClient['baseURL']}${endpoint}`, {
        ...options,
        headers: {
          ...apiClient['defaultHeaders'],
          ...options.headers,
          // Agregar token de autenticación si existe
          ...(apiClient.getAuthToken() ? { 'Authorization': `Bearer ${apiClient.getAuthToken()}` } : {})
        }
      });

      // Verificar si el servidor envió un nuevo token en los headers
      const newToken = response.headers.get('x-new-token');
      if (newToken) {
        console.log('🔄 [authInterceptor] Token renovado automáticamente');
        apiClient.setAuthToken(newToken);
        localStorage.setItem('airbnb_auth_token', newToken);
      }

      // Si la respuesta es exitosa, devolverla
      if (response.ok) {
        const data = await response.json();
        return data;
      }

      // Si el error es 403 (token expirado) y no hemos intentado renovar
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.error?.message === 'Token inválido o expirado' && !isRefreshing) {
          console.log('🔄 [authInterceptor] Token expirado, intentando renovar...');
          
          isRefreshing = true;
          
          try {
            const currentToken = apiClient.getAuthToken();
            if (currentToken) {
              // Intentar renovar el token
              const refreshResponse = await fetch(`${apiClient['baseURL']}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ token: currentToken })
              });
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                const newToken = refreshData.data?.token || refreshData.token;
                
                if (newToken) {
                  console.log('✅ [authInterceptor] Token renovado exitosamente');
                  
                  // Actualizar el token en el cliente y localStorage
                  apiClient.setAuthToken(newToken);
                  localStorage.setItem('airbnb_auth_token', newToken);
                  
                  // Procesar la cola de peticiones fallidas
                  processQueue(null, newToken);
                  
                  // Reintentar la petición original con el nuevo token
                  const retryResponse = await fetch(`${apiClient['baseURL']}${endpoint}`, {
                    ...options,
                    headers: {
                      ...apiClient['defaultHeaders'],
                      ...options.headers,
                      'Authorization': `Bearer ${newToken}`
                    }
                  });
                  
                  if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    return retryData;
                  }
                }
              }
            }
          } catch (refreshError) {
            console.error('💥 [authInterceptor] Error renovando token:', refreshError);
            processQueue(refreshError, null);
            
            // Si no se puede renovar, limpiar tokens y redirigir al login
            apiClient.removeAuthToken();
            localStorage.removeItem('airbnb_auth_token');
            localStorage.removeItem('user');
            
            // Redirigir al login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          } finally {
            isRefreshing = false;
          }
        }
      }

      // Si llegamos aquí, la petición falló por otra razón
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      console.error('💥 [authInterceptor] Error en petición:', error);
      throw error;
    }
  };
};

/**
 * Interceptor de petición para agregar token automáticamente
 * Simplificado para evitar conflictos con la lógica existente
 */
export const setupRequestInterceptor = () => {
  console.log('🔧 [authInterceptor] Configurando interceptor de petición...');
  // El ApiClient ya maneja los tokens automáticamente, no necesitamos sobrescribir
  console.log('✅ [authInterceptor] Interceptor de petición configurado');
};

/**
 * Configurar todos los interceptores
 */
export const setupAuthInterceptors = () => {
  console.log('🔧 [authInterceptor] Configurando interceptores de autenticación...');
  setupRequestInterceptor();
  setupResponseInterceptor();
  console.log('✅ [authInterceptor] Interceptores configurados correctamente');
};

// Configurar interceptores automáticamente al importar el módulo
setupAuthInterceptors();
