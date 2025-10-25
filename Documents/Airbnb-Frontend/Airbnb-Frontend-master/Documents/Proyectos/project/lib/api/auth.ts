/**
 * Servicios de autenticación para conectar con el backend real
 * Implementa persistencia de sesión JWT según mejores prácticas
 */

import { apiClient } from './config';

// Interfaces para tipado de las respuestas del backend
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  data?: {
    user?: User;
    token?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Servicios de autenticación que se conectan al backend real
 */
export const authService = {
  /**
   * Iniciar sesión con email y contraseña
   * POST /api/auth/login
   * Implementa guardado correcto de token y usuario según mejores prácticas
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const loginData: LoginRequest = { email, password };
      console.log('🔍 [authService] Enviando datos de login:', loginData);
      
      const response = await apiClient.post<AuthResponse>('/api/auth/login', loginData);
      console.log('🔍 [authService] Respuesta COMPLETA del backend:', JSON.stringify(response, null, 2));
      
      // ✅ GUARDAR TOKEN Y USUARIO según recomendaciones del backend
      // El backend devuelve los datos dentro de un objeto 'data'
      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      
      if (response.success && token && user) {
        console.log('✅ [authService] Login exitoso, guardando token y usuario');
        console.log('🔍 [authService] Token recibido:', token.substring(0, 20) + '...');
        console.log('🔍 [authService] Usuario recibido:', user.name);
        
        // Guardar token en localStorage
        localStorage.setItem('airbnb_auth_token', token);
        console.log('🔍 [authService] Token guardado en localStorage con clave: airbnb_auth_token');
        
        // Guardar información del usuario
        localStorage.setItem('user', JSON.stringify(user));
        console.log('🔍 [authService] Usuario guardado en localStorage');
        
        // Sincronizar con apiClient para futuras peticiones
        apiClient.setAuthToken(token);
        console.log('🔍 [authService] Token sincronizado con apiClient');
        
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem('airbnb_auth_token');
        console.log('🔍 [authService] Verificación - Token guardado:', savedToken ? 'SÍ' : 'NO');
        if (savedToken) {
          console.log('🔍 [authService] Token verificado:', savedToken.substring(0, 20) + '...');
        }
        
        console.log('✅ [authService] Token y usuario guardados correctamente');
      } else {
        console.log('❌ [authService] No se recibió token o usuario válido');
        console.log('  - response.success:', response.success);
        console.log('  - response.data:', response.data);
        console.log('  - user:', user);
        console.log('  - token:', token);
      }
      
      return response;
    } catch (error) {
      console.log('💥 [authService] Error en login:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  /**
   * Registrar nuevo usuario
   * POST /api/auth/register
   * Implementa guardado correcto de token y usuario según mejores prácticas
   */
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const registerData: RegisterRequest = { email, password, name };
      console.log('🔍 [authService] Enviando datos de registro:', { email, name });
      
      const response = await apiClient.post<AuthResponse>('/api/auth/register', registerData);
      console.log('🔍 [authService] Respuesta del backend:', response);
      
      // ✅ GUARDAR TOKEN Y USUARIO según recomendaciones del backend
      // El backend devuelve los datos dentro de un objeto 'data'
      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      
      if (response.success && token && user) {
        console.log('✅ [authService] Registro exitoso, guardando token y usuario');
        console.log('🔍 [authService] Token recibido:', token.substring(0, 20) + '...');
        console.log('🔍 [authService] Usuario recibido:', user.name);
        
        // Guardar token en localStorage
        localStorage.setItem('airbnb_auth_token', token);
        console.log('🔍 [authService] Token guardado en localStorage con clave: airbnb_auth_token');
        
        // Guardar información del usuario
        localStorage.setItem('user', JSON.stringify(user));
        console.log('🔍 [authService] Usuario guardado en localStorage');
        
        // Sincronizar con apiClient para futuras peticiones
        apiClient.setAuthToken(token);
        console.log('🔍 [authService] Token sincronizado con apiClient');
        
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem('airbnb_auth_token');
        console.log('🔍 [authService] Verificación - Token guardado:', savedToken ? 'SÍ' : 'NO');
        if (savedToken) {
          console.log('🔍 [authService] Token verificado:', savedToken.substring(0, 20) + '...');
        }
        
        console.log('✅ [authService] Token y usuario guardados correctamente');
      } else {
        console.log('❌ [authService] No se recibió token o usuario válido');
        console.log('  - response.success:', response.success);
        console.log('  - response.data:', response.data);
        console.log('  - user:', user);
        console.log('  - token:', token);
      }
      
      return response;
    } catch (error) {
      console.log('💥 [authService] Error en registro:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  /**
   * Cerrar sesión
   * POST /api/auth/logout
   * Implementa logout correcto según recomendaciones del backend
   */
  async logout(): Promise<AuthResponse> {
    try {
      // Opcional: notificar al backend
      await authenticatedFetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('💥 [authService] Error en logout del backend:', error);
    } finally {
      // ✅ SIEMPRE limpiar el frontend según recomendaciones
      localStorage.removeItem('airbnb_auth_token');
      localStorage.removeItem('user');
      
      // Sincronizar con apiClient
      apiClient.removeAuthToken();
      
      console.log('✅ [authService] Sesión cerrada correctamente');
    }
    
    return {
      success: true,
      message: 'Sesión cerrada correctamente'
    };
  },

  /**
   * Verificar token de autenticación
   * GET /api/auth/verify
   */
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>('/api/auth/verify', {
        'Authorization': `Bearer ${token}`
      });
      
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Token inválido'
      };
    }
  },

  /**
   * Solicitar recuperación de contraseña
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/forgot-password', { email });
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  /**
   * Resetear contraseña con token
   * POST /api/auth/reset-password
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/reset-password', {
        token,
        newPassword
      });
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },


  /**
   * Obtener perfil del usuario autenticado
   * GET /api/auth/me
   */
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>('/api/auth/me');
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  /**
   * Renovar token JWT
   * POST /api/auth/refresh
   * Implementa renovación automática de tokens según la guía
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const currentToken = localStorage.getItem('airbnb_auth_token');
      if (!currentToken) {
        return {
          success: false,
          message: 'No hay token para renovar'
        };
      }

      console.log('🔄 [authService] Renovando token...');
      const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
        token: currentToken
      });

      if (response.success && response.token) {
        console.log('✅ [authService] Token renovado exitosamente');
        
        // Actualizar token en localStorage y apiClient
        localStorage.setItem('airbnb_auth_token', response.token);
        apiClient.setAuthToken(response.token);
        
        // Si también se devuelve información del usuario, actualizarla
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      console.error('💥 [authService] Error renovando token:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error renovando token'
      };
    }
  },

  /**
   * Verificar si el usuario está autenticado
   * Función recomendada por el backend para verificar sesión al cargar la página
   */
  async checkAuthStatus(): Promise<User | false> {
    const token = localStorage.getItem('airbnb_auth_token');
    
    if (!token) {
      console.log('🔍 [authService] No hay token, usuario no autenticado');
      return false;
    }
    
    try {
      console.log('🔍 [authService] Verificando token con el backend...');
      const response = await apiClient.get<AuthResponse>('/api/auth/me');
      
      if (response.success && response.user) {
        console.log('✅ [authService] Token válido, usuario autenticado:', response.user.name);
        return response.user;
      } else {
        console.log('❌ [authService] Token inválido, limpiando storage');
        localStorage.removeItem('airbnb_auth_token');
        localStorage.removeItem('user');
        return false;
      }
    } catch (error) {
      console.error('💥 [authService] Error verificando autenticación:', error);
      return false;
    }
  }
};

/**
 * Función helper para hacer peticiones autenticadas
 * Envía JWT en todas las peticiones según recomendaciones del backend
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('airbnb_auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers
  });
};

// Utilidades para manejo de tokens (compatibilidad con el sistema actual)
export const tokenStorage = {
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      // Guardar en localStorage para el AuthContext
      localStorage.setItem('airbnb_auth_token', token);
      
      // Guardar en cookies para el middleware
      // En desarrollo (HTTP) no usar Secure, en producción (HTTPS) sí
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `airbnb_auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict${isSecure ? '; Secure' : ''}`;
      
      // Sincronizar con apiClient
      apiClient.setAuthToken(token);
      
      console.log('🔐 [tokenStorage] Token guardado en localStorage, cookies y apiClient');
    }
  },
  
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('airbnb_auth_token');
      console.log('🔐 [tokenStorage] Token recuperado:', token ? 'existe' : 'no existe');
      return token;
    }
    return null;
  },
  
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('airbnb_auth_token');
      
      // Eliminar cookie
      document.cookie = 'airbnb_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Sincronizar con apiClient
      apiClient.removeAuthToken();
      
      console.log('🔐 [tokenStorage] Token eliminado de localStorage, cookies y apiClient');
    }
  }
};
