/**
 * Servicios de API para actualización de perfil de usuario
 * Integración con backend real según documentación FRONTEND_PROFILE_UPDATE_INTEGRATION.md
 */

import { apiClient } from './config';

// Interfaces para actualización de perfil
export interface ProfileUpdateData {
  name?: string;
  description?: string | null;
  avatar?: File;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  description: string | null;
  avatar: string | null;
  updatedAt: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data?: ProfileData;
  errors?: ValidationError[];
}

/**
 * Servicio para actualizar el perfil del usuario autenticado
 * PATCH /api/profile
 */
export const profileService = {
  /**
   * Actualizar perfil del usuario autenticado
   * Soporta actualización parcial: solo envía los campos que deseas actualizar
   * 
   * @param data - Datos a actualizar (name, description, avatar)
   * @returns Respuesta con datos actualizados del perfil
   */
  async updateProfile(data: ProfileUpdateData): Promise<ProfileUpdateResponse> {
    try {
      console.log('🔍 [profileService] Actualizando perfil...');

      // Determinar si hay archivo para usar FormData
      let body: FormData | string;
      let headers: Record<string, string> = {};

      if (data.avatar) {
        // Usar FormData para subir avatar
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description !== undefined) {
          formData.append('description', data.description || '');
        }
        formData.append('avatar', data.avatar);
        body = formData;
        // NO incluir Content-Type para FormData - el navegador lo hace automáticamente
      } else {
        // Usar JSON para solo name y description
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description })
        });
      }

      // Realizar petición PATCH usando request directamente
      // apiClient.request maneja FormData correctamente
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile`;
      const token = apiClient.getAuthToken();
      
      const fetchHeaders: HeadersInit = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' })
      };

      const response = await fetch(url, {
        method: 'PATCH',
        headers: fetchHeaders,
        body: body instanceof FormData ? body : body as string,
      });

      const responseData: ProfileUpdateResponse = await response.json();

      if (!response.ok) {
        console.log('❌ [profileService] Error del servidor:', response.status);
        return responseData;
      }

      if (responseData.success && responseData.data) {
        console.log('✅ [profileService] Perfil actualizado exitosamente');
        console.log('🔍 [profileService] Datos recibidos:', JSON.stringify(responseData.data, null, 2));
        
        // ⚠️ Construir URL del proxy para evitar problemas de CORS
        if (responseData.data.avatar) {
          const { getAvatarUrl } = await import('@/lib/utils/avatar');
          const originalUrl = responseData.data.avatar;
          responseData.data.avatar = getAvatarUrl(originalUrl) || originalUrl;
          console.log('🔍 [profileService] Avatar URL convertida:', originalUrl, '→', responseData.data.avatar);
        }
        
        return responseData;
      } else {
        console.log('❌ [profileService] Error actualizando perfil:', responseData.message);
        return responseData;
      }
    } catch (error) {
      console.error('💥 [profileService] Error actualizando perfil:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
        errors: []
      };
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/profile (si existe) o GET /api/auth/me
   */
  async getProfile(): Promise<ProfileData | null> {
    try {
      console.log('🔍 [profileService] Obteniendo perfil...');
      
      // Intentar obtener desde /api/profile o usar /api/auth/me
      const response = await apiClient.get<{ success: boolean; data?: ProfileData }>('/api/profile');
      
      if (response.success && response.data) {
        console.log('✅ [profileService] Perfil obtenido');
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('💥 [profileService] Error obteniendo perfil:', error);
      return null;
    }
  }
};

