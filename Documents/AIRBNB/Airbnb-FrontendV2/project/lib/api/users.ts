/**
 * Servicios de API para la colección de usuarios
 * Basado en la documentación de la API del backend de Airbnb
 */

import { apiClient } from './config';

// Interfaces para la colección de usuarios
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  preferences?: {
    language: string;
    currency: string;
    notifications: boolean;
  };
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  preferences?: {
    language: string;
    currency: string;
    notifications: boolean;
  };
}

export interface UserResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface UsersListResponse {
  success: boolean;
  data?: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isVerified?: boolean;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Servicios de la colección de usuarios
 */
export const usersService = {
  /**
   * Obtener todos los usuarios con paginación
   * GET /api/users
   */
  async getAllUsers(params: UserSearchParams = {}): Promise<UsersListResponse> {
    try {
      console.log('🔍 [usersService] Obteniendo lista de usuarios...');
      
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.isVerified !== undefined) queryParams.append('isVerified', params.isVerified.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<UsersListResponse>(endpoint);
      
      if (response.success) {
        console.log('✅ [usersService] Usuarios obtenidos:', response.data?.total || 0);
      } else {
        console.log('❌ [usersService] Error obteniendo usuarios:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [usersService] Error obteniendo usuarios:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener un usuario por ID
   * GET /api/users/:id
   */
  async getUserById(id: string): Promise<UserResponse> {
    try {
      console.log('🔍 [usersService] Obteniendo usuario:', id);
      
      const response = await apiClient.get<UserResponse>(`/api/users/${id}`);
      
      if (response.success) {
        console.log('✅ [usersService] Usuario obtenido:', response.data?.firstName);
      } else {
        console.log('❌ [usersService] Usuario no encontrado:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [usersService] Error obteniendo usuario:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Crear un nuevo usuario
   * POST /api/users
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      console.log('🔍 [usersService] Creando usuario:', userData.email);
      
      const response = await apiClient.post<UserResponse>('/api/users', userData);
      
      if (response.success) {
        console.log('✅ [usersService] Usuario creado:', response.data?.id);
      } else {
        console.log('❌ [usersService] Error creando usuario:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [usersService] Error creando usuario:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Actualizar un usuario existente
   * PUT /api/users/:id
   */
  async updateUser(id: string, userData: UpdateUserRequest): Promise<UserResponse> {
    try {
      console.log('🔍 [usersService] Actualizando usuario:', id);
      
      const response = await apiClient.put<UserResponse>(`/api/users/${id}`, userData);
      
      if (response.success) {
        console.log('✅ [usersService] Usuario actualizado:', response.data?.firstName);
      } else {
        console.log('❌ [usersService] Error actualizando usuario:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [usersService] Error actualizando usuario:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Eliminar un usuario
   * DELETE /api/users/:id
   */
  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔍 [usersService] Eliminando usuario:', id);
      
      const response = await apiClient.delete<{ success: boolean; message?: string }>(`/api/users/${id}`);
      
      if (response.success) {
        console.log('✅ [usersService] Usuario eliminado exitosamente');
      } else {
        console.log('❌ [usersService] Error eliminando usuario:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [usersService] Error eliminando usuario:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Buscar usuarios por criterios
   * GET /api/users/search
   */
  async searchUsers(searchTerm: string, params: UserSearchParams = {}): Promise<UsersListResponse> {
    try {
      console.log('🔍 [usersService] Buscando usuarios:', searchTerm);
      
      const searchParams = {
        ...params,
        search: searchTerm
      };
      
      return await this.getAllUsers(searchParams);
    } catch (error) {
      console.error('💥 [usersService] Error buscando usuarios:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener estadísticas de usuarios
   * GET /api/users/stats
   */
  async getUserStats(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      console.log('🔍 [usersService] Obteniendo estadísticas de usuarios...');
      
      const response = await apiClient.get<{ success: boolean; data?: any; message?: string }>('/api/users/stats');
      
      if (response.success) {
        console.log('✅ [usersService] Estadísticas obtenidas');
      } else {
        console.log('❌ [usersService] Error obteniendo estadísticas:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [usersService] Error obteniendo estadísticas:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Activar/desactivar usuario
   * PATCH /api/users/:id/status
   */
  async toggleUserStatus(id: string, isActive: boolean): Promise<UserResponse> {
    try {
      console.log('🔍 [usersService] Cambiando estado del usuario:', id, 'a', isActive);
      
      const response = await apiClient.patch<UserResponse>(`/api/users/${id}/status`, { isActive });
      
      if (response.success) {
        console.log('✅ [usersService] Estado del usuario actualizado');
      } else {
        console.log('❌ [usersService] Error actualizando estado:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [usersService] Error actualizando estado:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Verificar usuario
   * PATCH /api/users/:id/verify
   */
  async verifyUser(id: string): Promise<UserResponse> {
    try {
      console.log('🔍 [usersService] Verificando usuario:', id);
      
      const response = await apiClient.patch<UserResponse>(`/api/users/${id}/verify`);
      
      if (response.success) {
        console.log('✅ [usersService] Usuario verificado');
      } else {
        console.log('❌ [usersService] Error verificando usuario:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [usersService] Error verificando usuario:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }
};
