/**
 * Esquemas de validación para notificaciones
 * Validación runtime con Zod para datos del backend
 */

import { z } from 'zod';

// Esquema para una notificación individual
export const NotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'promo', 'error']),
  createdAt: z.string().datetime().or(z.string()), // Acepta datetime o string ISO
  isRead: z.boolean(),
  userId: z.string().optional(), // ID del usuario que recibió la notificación
});

// Esquema para respuesta de una notificación
export const NotificationResponseSchema = z.object({
  success: z.boolean(),
  data: NotificationSchema.optional(),
  message: z.string().optional(),
});

// Esquema para lista de notificaciones - acepta array directo o objeto con array dentro
export const NotificationsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.union([
    z.array(NotificationSchema), // Array directo
    z.object({
      notifications: z.array(NotificationSchema).optional(),
      notification: z.array(NotificationSchema).optional(),
      items: z.array(NotificationSchema).optional(),
    }).passthrough(), // Objeto que puede contener el array en diferentes propiedades
  ]).optional(),
  message: z.string().optional(),
});

// Esquema para respuesta genérica de operación
export const NotificationOperationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// Tipos derivados de los esquemas
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
export type NotificationsListResponse = {
  success: boolean;
  data?: Notification[]; // Siempre un array normalizado en el tipo final
  message?: string;
};
export type NotificationOperationResponse = z.infer<typeof NotificationOperationResponseSchema>;

// Funciones de validación
export function validateNotification(data: unknown): Notification {
  return NotificationSchema.parse(data);
}

export function validateNotificationResponse(data: unknown): NotificationResponse {
  return NotificationResponseSchema.parse(data);
}

export function validateNotificationsListResponse(data: unknown): NotificationsListResponse {
  const parsed = NotificationsListResponseSchema.parse(data) as {
    success: boolean;
    data?: Notification[] | { [key: string]: any };
    message?: string;
  };
  
  // Normalizar data para que siempre sea un array
  let normalizedData: Notification[] | undefined = undefined;
  
  if (parsed.data) {
    if (Array.isArray(parsed.data)) {
      normalizedData = parsed.data;
    } else if (typeof parsed.data === 'object' && parsed.data !== null) {
      // Si es un objeto, buscar el array dentro
      const dataObj = parsed.data as any;
      const array = dataObj.notifications || dataObj.notification || dataObj.items || 
                   Object.values(dataObj).find((val: any) => Array.isArray(val));
      
      if (Array.isArray(array)) {
        // Validar cada elemento del array
        normalizedData = array.map((item: any) => {
          try {
            return validateNotification(item);
          } catch {
            return null;
          }
        }).filter((n: Notification | null): n is Notification => n !== null);
      }
    }
  }
  
  return {
    success: parsed.success,
    data: normalizedData,
    message: parsed.message,
  };
}

export function validateNotificationOperationResponse(data: unknown): NotificationOperationResponse {
  return NotificationOperationResponseSchema.parse(data);
}

