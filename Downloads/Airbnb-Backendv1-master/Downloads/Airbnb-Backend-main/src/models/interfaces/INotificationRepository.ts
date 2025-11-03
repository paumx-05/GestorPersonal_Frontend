/**
 * 🎯 INTERFAZ DE REPOSITORIO DE NOTIFICACIONES
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Interfaz que define el contrato para todas las operaciones de notificaciones.
 * Garantiza compatibilidad entre implementaciones Mock y MongoDB.
 */

import { Notification, NotificationSettings } from '../../types/notifications';

export interface INotificationRepository {
  // 🔔 FUNCIONES DE NOTIFICACIONES
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
  deleteNotification(notificationId: string): Promise<boolean>;
  clearAllNotifications(userId: string): Promise<boolean>;
  
  // ⚙️ FUNCIONES DE CONFIGURACIÓN
  getNotificationSettings(userId: string): Promise<NotificationSettings>;
  updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings>;
  
  // 🧪 FUNCIONES DE TESTING
  createTestNotification(userId: string): Promise<Notification>;
  
  // 📊 FUNCIONES DE ESTADÍSTICAS
  getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }>;
}
