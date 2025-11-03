/**
 * Servicios de API para el panel de administración
 * Métricas y estadísticas de usuarios para admins
 */

import { apiClient } from './config';

// Interfaces para métricas de administración
export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  registrationGrowth: number;
  lastUpdated: string;
}

export interface RegistrationStats {
  date: string;
  count: number;
}

export interface ActivityMetrics {
  totalLogins: number;
  loginsToday: number;
  loginsThisWeek: number;
  loginsThisMonth: number;
  averageSessionDuration: number;
  mostActiveHour: number;
}

export interface UserStats {
  totalUsers: number;
  usersByStatus: {
    active: number;
    inactive: number;
  };
  usersByVerification: {
    verified: number;
    unverified: number;
  };
  usersByGender: {
    male: number;
    female: number;
    other: number;
  };
  usersByAgeGroup: {
    '18-25': number;
    '26-35': number;
    '36-45': number;
    '46-55': number;
    '55+': number;
  };
}

export interface AdminResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Servicios de administración para métricas de usuarios
 */
export const adminService = {
  /**
   * Obtener métricas generales de usuarios
   * GET /api/users/stats
   */
  async getUserMetrics(): Promise<AdminResponse> {
    try {
      console.log('🔍 [adminService] Obteniendo métricas de usuarios...');
      
      const response = await apiClient.get<AdminResponse>('/api/users/stats');
      
      if (response.success) {
        console.log('✅ [adminService] Métricas obtenidas:', response.data);
      } else {
        console.log('❌ [adminService] Error obteniendo métricas:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [adminService] Error obteniendo métricas:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener lista de usuarios para administración
   * GET /api/users?page=1&limit=10
   */
  async getUsersForAdmin(page: number = 1, limit: number = 10): Promise<AdminResponse> {
    try {
      console.log('🔍 [adminService] Obteniendo lista de usuarios para admin...');
      
      const response = await apiClient.get<AdminResponse>(`/api/users?page=${page}&limit=${limit}`);
      
      if (response.success) {
        console.log('✅ [adminService] Lista de usuarios obtenida');
      } else {
        console.log('❌ [adminService] Error obteniendo lista:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [adminService] Error obteniendo lista:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener métricas de actividad de usuarios
   * GET /api/users/stats (incluye métricas de actividad)
   */
  async getActivityMetrics(): Promise<AdminResponse> {
    try {
      console.log('🔍 [adminService] Obteniendo métricas de actividad...');
      
      const response = await apiClient.get<AdminResponse>('/api/users/stats');
      
      if (response.success) {
        console.log('✅ [adminService] Métricas de actividad obtenidas');
      } else {
        console.log('❌ [adminService] Error obteniendo métricas de actividad:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [adminService] Error obteniendo métricas de actividad:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener estadísticas detalladas de usuarios
   * GET /api/users/stats
   */
  async getUserStats(): Promise<AdminResponse> {
    try {
      console.log('🔍 [adminService] Obteniendo estadísticas detalladas...');
      
      const response = await apiClient.get<AdminResponse>('/api/users/stats');
      
      if (response.success) {
        console.log('✅ [adminService] Estadísticas detalladas obtenidas');
      } else {
        console.log('❌ [adminService] Error obteniendo estadísticas:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [adminService] Error obteniendo estadísticas:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Verificar si el usuario actual es admin
   * Extrae el campo 'role' del perfil del usuario desde el backend
   * 
   * IMPORTANTE: El backend DEBE devolver el campo 'role' en el objeto user
   * Formato esperado: { user: { ..., role: 'admin' | 'user' } }
   */
  async checkAdminRole(): Promise<AdminResponse> {
    try {
      console.log('🔍 [adminService] Verificando rol de admin desde el backend...');
      
      // Intentar primero con /api/users/me (endpoint recomendado)
      try {
        const response = await apiClient.get<any>('/api/users/me');
        console.log('📥 [adminService] Respuesta de /api/users/me:', JSON.stringify(response, null, 2));
        
        // Extraer el usuario y su rol
        const user = response.data || response.user || response.data?.user;
        
        if (!user) {
          console.warn('⚠️ [adminService] No se encontró el objeto user en la respuesta');
          throw new Error('Usuario no encontrado en respuesta');
        }
        
        const role = user.role;
        console.log('🔍 [adminService] Rol extraído:', role);
        
        if (!role) {
          console.error('❌ [adminService] ERROR: El backend NO devolvió el campo "role"');
          console.error('❌ [adminService] Respuesta recibida:', JSON.stringify(response, null, 2));
          console.error('❌ [adminService] El backend debe incluir "role" en el objeto user');
          return { 
            success: false, 
            message: 'El backend no devolvió el campo role. Por favor, verifica la configuración del backend.' 
          };
        }
        
        if (role === 'admin') {
          console.log('✅ [adminService] Usuario es ADMIN según /api/users/me');
          return { success: true, data: { isAdmin: true } };
        } else {
          console.log('ℹ️ [adminService] Usuario tiene role:', role, '(no es admin)');
          return { success: true, data: { isAdmin: false } };
        }
      } catch (error) {
        console.log('⚠️ [adminService] Error con /api/users/me, intentando /api/auth/me:', error);
      }
      
      // Fallback: intentar con /api/auth/me
      try {
        const response = await apiClient.get<any>('/api/auth/me');
        console.log('📥 [adminService] Respuesta de /api/auth/me:', JSON.stringify(response, null, 2));
        
        // Extraer el usuario y su rol
        const user = response.user || response.data?.user || response.data;
        
        if (!user) {
          console.warn('⚠️ [adminService] No se encontró el objeto user en /api/auth/me');
          throw new Error('Usuario no encontrado');
        }
        
        const role = user.role;
        console.log('🔍 [adminService] Rol extraído de /api/auth/me:', role);
        
        if (!role) {
          console.error('❌ [adminService] ERROR: El backend NO devolvió el campo "role" en /api/auth/me');
          return { 
            success: false, 
            message: 'El backend no devolvió el campo role en /api/auth/me' 
          };
        }
        
        if (role === 'admin') {
          console.log('✅ [adminService] Usuario es ADMIN según /api/auth/me');
          return { success: true, data: { isAdmin: true } };
        } else {
          console.log('ℹ️ [adminService] Usuario tiene role:', role, '(no es admin)');
          return { success: true, data: { isAdmin: false } };
        }
      } catch (error) {
        console.error('💥 [adminService] Error con ambos endpoints:', error);
        return {
          success: false,
          message: 'Error de conexión con el servidor'
        };
      }
    } catch (error) {
      console.error('💥 [adminService] Error verificando rol:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }
};
