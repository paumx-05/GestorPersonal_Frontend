/**
 * Servicios de API para notificaciones
 * Basado en la documentación de la API del backend de Airbnb
 */

import { apiClient } from './config';
import {
  Notification,
  NotificationResponse,
  NotificationsListResponse,
  NotificationOperationResponse,
  validateNotification,
  validateNotificationsListResponse,
  validateNotificationOperationResponse,
} from '@/schemas/notifications';

/**
 * Servicios de notificaciones que se conectan al backend real
 */
export const notificationsService = {
  /**
   * Obtener todas las notificaciones del usuario autenticado
   * GET /api/notifications
   * 
   * @returns Promise<NotificationsListResponse> - Array con todas las notificaciones del usuario
   */
  async getAllNotifications(): Promise<NotificationsListResponse> {
    try {
      console.log('🔍 [notificationsService] Obteniendo todas las notificaciones...');
      
      const endpoint = process.env.NEXT_PUBLIC_NOTIFICATIONS_ENDPOINT || '/api/notifications';
      const response = await apiClient.get<any>(endpoint);
      
      console.log('📥 [notificationsService] Respuesta completa del backend:', JSON.stringify(response, null, 2));
      
      // Normalizar la respuesta antes de validar
      let normalizedResponse = response;
      
      // Si data es un objeto, intentar extraer el array de notificaciones
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        console.log('⚠️ [notificationsService] data es un objeto, normalizando...');
        
        // Intentar encontrar el array en diferentes propiedades comunes
        const dataObj = response.data as any;
        const notificationsArray = 
          dataObj.notifications || 
          dataObj.notification || 
          dataObj.items || 
          dataObj.data || 
          Object.values(dataObj).find((val: any) => Array.isArray(val));
        
        if (Array.isArray(notificationsArray)) {
          console.log('✅ [notificationsService] Array encontrado en objeto, normalizando respuesta');
          normalizedResponse = {
            ...response,
            data: notificationsArray,
          };
        } else {
          console.log('⚠️ [notificationsService] No se encontró array en el objeto data, intentando validar como está');
        }
      }
      
      // Validar respuesta normalizada con Zod
      let validatedResponse: NotificationsListResponse;
      try {
        validatedResponse = validateNotificationsListResponse(normalizedResponse);
      } catch (validationError: any) {
        console.error('❌ [notificationsService] Error de validación Zod:', validationError);
        console.log('🔍 [notificationsService] Intentando extraer datos manualmente...');
        
        // Si la validación falla, intentar extraer datos manualmente
        if (response.success && response.data) {
          let notifications: Notification[] = [];
          
          if (Array.isArray(response.data)) {
            notifications = response.data.map((n: any) => {
              try {
                return validateNotification(n);
              } catch {
                return null;
              }
            }).filter((n: Notification | null): n is Notification => n !== null);
          } else if (typeof response.data === 'object') {
            // Buscar array en el objeto
            const dataObj = response.data as any;
            const array = dataObj.notifications || dataObj.notification || dataObj.items || 
                         Object.values(dataObj).find((val: any) => Array.isArray(val));
            
            if (Array.isArray(array)) {
              notifications = array.map((n: any) => {
                try {
                  return validateNotification(n);
                } catch {
                  return null;
                }
              }).filter((n: Notification | null): n is Notification => n !== null);
            }
          }
          
          return {
            success: true,
            data: notifications,
            message: response.message,
          };
        }
        
        throw validationError;
      }
      
      // Normalizar data después de validar (por si viene en objeto)
      if (validatedResponse.success && validatedResponse.data) {
        let finalData = validatedResponse.data;
        
        // Si data es un objeto después de la validación, extraer el array
        if (typeof finalData === 'object' && !Array.isArray(finalData)) {
          const dataObj = finalData as any;
          finalData = dataObj.notifications || dataObj.notification || dataObj.items || 
                     Object.values(dataObj).find((val: any) => Array.isArray(val)) || [];
        }
        
        validatedResponse.data = Array.isArray(finalData) ? finalData : [];
        console.log('✅ [notificationsService] Notificaciones obtenidas:', validatedResponse.data.length);
      } else {
        console.log('❌ [notificationsService] Error obteniendo notificaciones:', validatedResponse.message);
      }
      
      return validatedResponse;
    } catch (error) {
      console.error('💥 [notificationsService] Error obteniendo notificaciones:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  },

  /**
   * Obtener una notificación por ID
   * GET /api/notifications/:id
   * 
   * @param id - ID de la notificación
   * @returns Promise<NotificationResponse> - Notificación individual
   */
  async getNotificationById(id: string): Promise<NotificationResponse> {
    try {
      console.log('🔍 [notificationsService] Obteniendo notificación:', id);
      
      const endpoint = `/api/notifications/${id}`;
      const response = await apiClient.get<any>(endpoint);
      
      console.log('📥 [notificationsService] Respuesta:', JSON.stringify(response, null, 2));
      
      // Validar respuesta
      const validatedResponse = validateNotificationOperationResponse(response);
      
      if (validatedResponse.success && validatedResponse.data) {
        const notification = validateNotification(validatedResponse.data);
        return {
          success: true,
          data: notification,
          message: validatedResponse.message,
        };
      }
      
      return {
        success: validatedResponse.success,
        message: validatedResponse.message || 'Notificación no encontrada',
      };
    } catch (error) {
      console.error('💥 [notificationsService] Error obteniendo notificación:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  },

  /**
   * Marcar una notificación como leída
   * PUT /api/notifications/:id/read
   * 
   * @param id - ID de la notificación
   * @returns Promise<NotificationOperationResponse> - Respuesta de la operación
   */
  async markAsRead(id: string): Promise<NotificationOperationResponse> {
    try {
      console.log('🔍 [notificationsService] Marcando notificación como leída:', id);
      
      // Intentar endpoint estándar primero
      let endpoint = `/api/notifications/${id}/read`;
      let response;
      
      try {
        response = await apiClient.put<any>(endpoint, {});
        console.log('✅ [notificationsService] Notificación marcada como leída (endpoint estándar)');
      } catch (error: any) {
        // Si falla con 404, intentar endpoint alternativo
        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
          console.log('⚠️ [notificationsService] Endpoint estándar no encontrado, intentando alternativo...');
          endpoint = `/api/notifications/${id}`;
          response = await apiClient.put<any>(endpoint, { isRead: true });
          console.log('✅ [notificationsService] Notificación marcada como leída (endpoint alternativo)');
        } else {
          throw error;
        }
      }
      
      console.log('📥 [notificationsService] Respuesta:', JSON.stringify(response, null, 2));
      
      const validatedResponse = validateNotificationOperationResponse(response);
      return validatedResponse;
    } catch (error) {
      console.error('💥 [notificationsService] Error marcando notificación como leída:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   * PUT /api/notifications/read-all
   * 
   * @returns Promise<NotificationOperationResponse> - Respuesta de la operación
   */
  async markAllAsRead(): Promise<NotificationOperationResponse> {
    try {
      console.log('🔍 [notificationsService] Marcando todas las notificaciones como leídas...');
      
      // Intentar endpoint estándar primero
      let endpoint = '/api/notifications/read-all';
      let response;
      
      try {
        response = await apiClient.put<any>(endpoint, {});
        console.log('✅ [notificationsService] Todas las notificaciones marcadas como leídas (endpoint estándar)');
      } catch (error: any) {
        // Si falla con 404, intentar endpoint alternativo
        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
          console.log('⚠️ [notificationsService] Endpoint estándar no encontrado, intentando alternativo...');
          endpoint = '/api/notifications/read-all';
          response = await apiClient.post<any>(endpoint, {});
          console.log('✅ [notificationsService] Todas las notificaciones marcadas como leídas (endpoint alternativo)');
        } else {
          throw error;
        }
      }
      
      console.log('📥 [notificationsService] Respuesta:', JSON.stringify(response, null, 2));
      
      const validatedResponse = validateNotificationOperationResponse(response);
      return validatedResponse;
    } catch (error) {
      console.error('💥 [notificationsService] Error marcando todas las notificaciones como leídas:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  },

  /**
   * Eliminar una notificación
   * DELETE /api/notifications/:id
   * 
   * @param id - ID de la notificación
   * @returns Promise<NotificationOperationResponse> - Respuesta de la operación
   */
  async deleteNotification(id: string): Promise<NotificationOperationResponse> {
    try {
      console.log('🔍 [notificationsService] Eliminando notificación:', id);
      
      // Intentar endpoint estándar primero
      let endpoint = `/api/notifications/${id}`;
      let response;
      
      try {
        response = await apiClient.delete<any>(endpoint);
        console.log('✅ [notificationsService] Notificación eliminada (endpoint estándar)');
      } catch (error: any) {
        // Si falla con 404, intentar endpoint alternativo
        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
          console.log('⚠️ [notificationsService] Endpoint estándar no encontrado, intentando alternativo...');
          endpoint = `/api/user/notifications/${id}`;
          response = await apiClient.delete<any>(endpoint);
          console.log('✅ [notificationsService] Notificación eliminada (endpoint alternativo)');
        } else {
          throw error;
        }
      }
      
      console.log('📥 [notificationsService] Respuesta:', JSON.stringify(response, null, 2));
      
      const validatedResponse = validateNotificationOperationResponse(response);
      return validatedResponse;
    } catch (error) {
      console.error('💥 [notificationsService] Error eliminando notificación:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  },
};

