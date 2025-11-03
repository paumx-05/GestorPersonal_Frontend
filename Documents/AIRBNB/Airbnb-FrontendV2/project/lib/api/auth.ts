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
  description?: string | null;
  createdAt: string;
  role: 'admin' | 'user'; // Rol del usuario - REQUERIDO - debe venir del backend
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
 * Función helper para convertir URL de avatar a proxy (evita CORS)
 */
function convertAvatarToProxy(avatarUrl: string | null | undefined): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }
  
  // Si ya es una URL del proxy, devolverla tal cual
  if (avatarUrl.includes('/api/proxy/avatar')) {
    return avatarUrl;
  }
  
  // Si es una URL relativa (empieza con /), usar el proxy
  if (avatarUrl.startsWith('/')) {
    return `/api/proxy/avatar?path=${encodeURIComponent(avatarUrl)}`;
  }
  
  // Si es URL del backend local, convertir a proxy
  if (avatarUrl.startsWith('http://localhost:5000/') || avatarUrl.startsWith('http://127.0.0.1:5000/')) {
    const path = avatarUrl.replace(/^https?:\/\/[^/]+/, '');
    return `/api/proxy/avatar?path=${encodeURIComponent(path)}`;
  }
  
  // Si no tiene protocolo, usar proxy
  if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
    const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
    return `/api/proxy/avatar?path=${encodeURIComponent(path)}`;
  }
  
  // Si es una URL externa completa (https://...), usar directamente
  return avatarUrl;
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
      // 🚨 MODO DEMO TEMPORAL - Para probar el flujo de cambio de contraseña
      const DEMO_MODE = process.env.NODE_ENV === 'development';
      const DEMO_CREDENTIALS = [
        { email: 'demo@airbnb.com', password: 'demo1234' },
        { email: 'admin@airbnb.com', password: 'Admin1234!' },
        { email: 'ana1@gmail.com', password: '123456789' }
      ];
      
      if (DEMO_MODE && DEMO_CREDENTIALS.some(cred => cred.email === email && cred.password === password)) {
        console.log('🎭 [authService] MODO DEMO ACTIVADO - Simulando login exitoso');
        
        const demoUser: User = {
          id: 'demo-user-123',
          email: email,
          name: email.split('@')[0],
          avatar: undefined,
          createdAt: new Date().toISOString(),
          role: email === 'admin@airbnb.com' ? 'admin' : 'user' // Asignar role según email en modo demo
        };
        
        const demoToken = 'demo-jwt-token-' + Date.now();
        
        // Guardar token y usuario usando tokenStorage
        tokenStorage.set(demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        console.log('✅ [authService] Login demo exitoso, token y usuario guardados');
        
        return {
          success: true,
          user: demoUser,
          token: demoToken,
          message: 'Login exitoso (modo demo)'
        };
      }
      
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
        console.log('🔍 [authService] Usuario recibido del backend:', JSON.stringify(user, null, 2));
        console.log('🔍 [authService] Rol del usuario:', user.role || 'NO ESPECIFICADO');
        
        // Verificar que el backend devolvió el campo role
        if (!user.role) {
          console.error('❌ [authService] ERROR: El backend NO devolvió el campo "role" en la respuesta de login');
          console.error('❌ [authService] Esto es CRÍTICO: sin el campo role no se pueden verificar permisos de admin');
          console.error('❌ [authService] Respuesta completa:', JSON.stringify(response, null, 2));
          console.error('❌ [authService] Por favor, verifica que el backend devuelva el campo "role" en el objeto user');
          // Asignar 'user' por defecto, pero esto es temporal hasta que el backend se corrija
          user.role = 'user';
          console.warn('⚠️ [authService] Asignando role="user" por defecto (TEMPORAL)');
        }
        
        // ⚠️ Verificar campo name
        if (!user.name || !user.name.trim()) {
          console.warn('⚠️ [authService] El backend NO devolvió el campo "name" válido en login');
          console.warn('⚠️ [authService] Name recibido:', user.name);
          console.warn('⚠️ [authService] Se mantendrá el valor actual o se usará "Usuario" por defecto');
        }
        
        // ⚠️ Verificar campos description y avatar
        if (user.description === undefined) {
          console.warn('⚠️ [authService] El backend NO devolvió el campo "description" en login');
          console.warn('⚠️ [authService] Se guardará como null (el backend debería devolverlo)');
          user.description = null;
        }
        if (user.avatar === undefined) {
          console.warn('⚠️ [authService] El backend NO devolvió el campo "avatar" en login');
          console.warn('⚠️ [authService] Se guardará como undefined (el backend debería devolverlo)');
        }
        
        console.log('🔍 [authService] Campos verificados en login:');
        console.log('  - name:', user.name || 'NO DEFINIDO');
        console.log('  - description:', user.description ?? 'NO DEFINIDO');
        console.log('  - avatar:', user.avatar ?? 'NO DEFINIDO');
        
        // Usar tokenStorage para guardar token (localStorage + cookies + apiClient)
        tokenStorage.set(token);
        console.log('🔍 [authService] Token guardado con tokenStorage');
        
        // Guardar información del usuario (incluyendo el role, description, avatar)
        localStorage.setItem('user', JSON.stringify(user));
        console.log('🔍 [authService] Usuario guardado en localStorage:');
        console.log('  - role:', user.role);
        console.log('  - description:', user.description ?? 'NO DEFINIDO');
        console.log('  - avatar:', user.avatar ?? 'NO DEFINIDO');
        
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
        
        // Usar tokenStorage para guardar token (localStorage + cookies + apiClient)
        tokenStorage.set(token);
        console.log('🔍 [authService] Token guardado con tokenStorage');
        
        // Guardar información del usuario
        localStorage.setItem('user', JSON.stringify(user));
        console.log('🔍 [authService] Usuario guardado en localStorage');
        
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
   * POST /api/auth/reset-password (endpoint local de Next.js)
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Usar el endpoint local de Next.js en lugar del backend externo
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();
      return data;
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
   * IMPORTANTE: Debe devolver el campo 'role' en el objeto user
   */
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>('/api/auth/me');
      
      console.log('🔍 [authService.getProfile] Respuesta completa del backend:', JSON.stringify(response, null, 2));
      
      // Verificar que el usuario tenga el campo role
      const user = response.data?.user || response.user;
      if (user) {
        if (!user.role) {
          console.warn('⚠️ [authService] El backend no devolvió el campo "role" en /api/auth/me');
          console.warn('⚠️ [authService] Respuesta recibida:', JSON.stringify(response, null, 2));
        }
        
        // ⚠️ Verificar campo name
        if (!user.name || !user.name.trim()) {
          console.warn('⚠️ [authService.getProfile] El backend NO devolvió el campo "name" válido');
          console.warn('⚠️ [authService.getProfile] Name recibido:', user.name);
          console.warn('⚠️ [authService.getProfile] El usuario en localStorage mantendrá su name anterior');
        } else {
          console.log('✅ [authService.getProfile] Campo "name" recibido:', user.name);
        }
        
        // ⚠️ Verificar campos description y avatar
        if (user.description === undefined) {
          console.warn('⚠️ [authService.getProfile] El backend NO devolvió el campo "description"');
          console.warn('⚠️ [authService.getProfile] El usuario en localStorage mantendrá su description anterior');
        } else {
          console.log('✅ [authService.getProfile] Campo "description" recibido:', user.description);
        }
        
        if (user.avatar === undefined) {
          console.warn('⚠️ [authService.getProfile] El backend NO devolvió el campo "avatar"');
          console.warn('⚠️ [authService.getProfile] El usuario en localStorage mantendrá su avatar anterior');
        } else {
          console.log('✅ [authService.getProfile] Campo "avatar" recibido:', user.avatar);
        }
        
        // ⚠️ MERGE: Preservar campos que el backend no devuelve
        const cachedUserStr = localStorage.getItem('user');
        const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;
        
        if (cachedUser) {
          const mergedUser = {
            ...user,
            // Para name: usar backend si existe y no está vacío, sino mantener local
            name: user.name && user.name.trim() 
              ? user.name.trim() 
              : (cachedUser.name || user.name || 'Usuario'),
            description: user.description !== undefined ? user.description : (cachedUser.description ?? null),
            avatar: user.avatar !== undefined 
              ? convertAvatarToProxy(user.avatar)
              : (cachedUser.avatar ?? undefined),
          };
          
          // Actualizar response con el usuario merged
          if (response.user) {
            response.user = mergedUser;
          }
          if (response.data?.user) {
            response.data.user = mergedUser;
          }
          
          console.log('🔍 [authService.getProfile] Usuario después del merge:');
          console.log('  - name (backend):', user.name);
          console.log('  - name (cached):', cachedUser.name);
          console.log('  - name (final):', mergedUser.name);
          console.log('  - description (backend):', user.description);
          console.log('  - description (cached):', cachedUser.description);
          console.log('  - description (final):', mergedUser.description);
          console.log('  - avatar (backend):', user.avatar);
          console.log('  - avatar (cached):', cachedUser.avatar);
          console.log('  - avatar (final):', mergedUser.avatar);
        }
      }
      
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
        
        // Actualizar token usando tokenStorage
        tokenStorage.set(response.token);
        
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
      
      // Obtener usuario actual de localStorage como backup
      const cachedUserStr = localStorage.getItem('user');
      const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;
      
      const response = await apiClient.get<AuthResponse>('/api/auth/me');
      
      console.log('🔍 [authService] Respuesta del backend:', JSON.stringify(response, null, 2));
      
      // El backend puede devolver el usuario en response.user o response.data.user
      const backendUser = response.user || response.data?.user;
      
      if (response.success && backendUser) {
        console.log('✅ [authService] Token válido, usuario autenticado:', backendUser.name);
        
        // Verificar que el usuario tenga el campo role
        if (!backendUser.role) {
          console.warn('⚠️ [authService] El backend no devolvió el campo "role" en /api/auth/me');
          console.warn('⚠️ [authService] Usuario recibido:', JSON.stringify(backendUser, null, 2));
          console.warn('⚠️ [authService] Esto puede causar problemas con las funciones de admin');
          // Por defecto, asumir 'user' si no viene el role
          backendUser.role = 'user';
        }
        
        // ⚠️ MERGE INTELIGENTE: Preservar campos que el backend podría no devolver
        // Si el backend no devuelve 'description', 'avatar' o 'name' es vacío, mantener los valores locales
        const mergedUser: User = {
          ...backendUser,
          // Para name: usar backend si existe y no está vacío, sino mantener local
          name: backendUser.name && backendUser.name.trim() 
            ? backendUser.name.trim() 
            : (cachedUser?.name || backendUser.name || 'Usuario'),
          // Solo usar valores del backend si existen, sino mantener los locales
          description: backendUser.description !== undefined 
            ? backendUser.description 
            : (cachedUser?.description ?? null),
          avatar: backendUser.avatar !== undefined 
            ? convertAvatarToProxy(backendUser.avatar)
            : (cachedUser?.avatar ?? undefined),
        };
        
        console.log('🔍 [authService] Usuario después del merge:');
        console.log('  - name (backend):', backendUser.name);
        console.log('  - name (cached):', cachedUser?.name);
        console.log('  - name (final):', mergedUser.name);
        console.log('  - description (backend):', backendUser.description);
        console.log('  - description (cached):', cachedUser?.description);
        console.log('  - description (final):', mergedUser.description);
        console.log('  - avatar (backend):', backendUser.avatar);
        console.log('  - avatar (cached):', cachedUser?.avatar);
        console.log('  - avatar (final):', mergedUser.avatar);
        
        // Guardar el usuario merged en localStorage
        localStorage.setItem('user', JSON.stringify(mergedUser));
        
        return mergedUser;
      } else {
        console.log('❌ [authService] Token inválido, limpiando storage');
        console.log('  - response.success:', response.success);
        console.log('  - response.user:', response.user);
        console.log('  - response.data:', response.data);
        console.log('  - user extraído:', backendUser);
        console.log('  - response.message:', response.message);
        localStorage.removeItem('airbnb_auth_token');
        localStorage.removeItem('user');
        return false;
      }
    } catch (error) {
      console.error('💥 [authService] Error verificando autenticación:', error);
      // No limpiar el storage en caso de error de red, solo si es error de autenticación
      if (error instanceof Error && error.message.includes('401')) {
        console.log('❌ [authService] Error 401, limpiando storage');
        localStorage.removeItem('airbnb_auth_token');
        localStorage.removeItem('user');
      }
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
      const maxAge = 7 * 24 * 60 * 60; // 7 días
      document.cookie = `airbnb_auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      
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
