import { Request, Response } from 'express';
import { NotificationRepositoryFactory } from '../../models/factories/NotificationRepositoryFactory';

const notificationRepo = NotificationRepositoryFactory.create();

// GET /api/notifications
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { limit = 50, unreadOnly = false, type } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    let notifications = await notificationRepo.getUserNotifications(userId);
    
    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.isRead);
    }

    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    notifications = notifications.slice(0, Number(limit));
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo notificaciones' }
    });
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = await notificationRepo.markAsRead(id);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Notificación no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'Notificación marcada como leída' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error marcando notificación' }
    });
  }
};

// PATCH /api/notifications/mark-all-read
export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = await notificationRepo.markAllAsRead(userId);
    const notifications = await notificationRepo.getUserNotifications(userId);
    const count = notifications.filter(n => n.isRead).length;

    res.json({
      success: true,
      data: { 
        message: `${count} notificaciones marcadas como leídas`,
        count 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error marcando notificaciones' }
    });
  }
};

// DELETE /api/notifications/:id
export const removeNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = await notificationRepo.deleteNotification(id);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Notificación no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'Notificación eliminada' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando notificación' }
    });
  }
};

// DELETE /api/notifications/clear-all
export const clearAllUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = await notificationRepo.clearAllNotifications(userId);

    res.json({
      success: true,
      data: { 
        message: 'Todas las notificaciones han sido eliminadas',
        cleared: success
      }
    });
  } catch (error) {
    console.error('Error eliminando notificaciones:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando notificaciones' }
    });
  }
};

// POST /api/notifications/test
export const createTestNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { type = 'system', title = 'Notificación de prueba', message = 'Esta es una notificación de prueba' } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validar que el tipo sea válido
    const validTypes = ['reservation', 'payment', 'review', 'system'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        error: { message: `Tipo de notificación no válido. Debe ser uno de: ${validTypes.join(', ')}` }
      });
      return;
    }

    const notification = await notificationRepo.createNotification({
      userId,
      type: type as 'reservation' | 'payment' | 'review' | 'system',
      title,
      message,
      isRead: false
    });

    res.status(201).json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    console.error('Error creando notificación de prueba:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error creando notificación de prueba' }
    });
  }
};

// GET /api/notifications/settings
export const getUserNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const settings = await notificationRepo.getNotificationSettings(userId);

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo configuración de notificaciones' }
    });
  }
};

// PUT /api/notifications/settings
export const updateUserNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { emailNotifications, pushNotifications, smsNotifications, marketingEmails } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const settings = await notificationRepo.updateNotificationSettings(userId, {
      emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : undefined,
      pushNotifications: pushNotifications !== undefined ? Boolean(pushNotifications) : undefined,
      smsNotifications: smsNotifications !== undefined ? Boolean(smsNotifications) : undefined,
      marketingEmails: marketingEmails !== undefined ? Boolean(marketingEmails) : undefined
    });

    res.json({
      success: true,
      data: { 
        settings,
        message: 'Configuración de notificaciones actualizada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando configuración de notificaciones' }
    });
  }
};
