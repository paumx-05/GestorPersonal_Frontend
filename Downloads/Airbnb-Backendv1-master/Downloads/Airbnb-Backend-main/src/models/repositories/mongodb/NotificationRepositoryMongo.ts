/**
 * 🎯 REPOSITORY MONGODB DE NOTIFICACIONES
 */

import { INotificationRepository } from '../../interfaces/INotificationRepository';
import { Notification, NotificationSettings } from '../../../types/notifications';
import { NotificationModel, NotificationSettingsModel } from '../../schemas/NotificationSchema';

export class NotificationRepositoryMongo implements INotificationRepository {
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification = new NotificationModel(notification);
    const savedNotification = await newNotification.save();
    return this.mapToNotification(savedNotification);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 });
    return notifications.map(notification => this.mapToNotification(notification));
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const result = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true }
    );
    return !!result;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const result = await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result.modifiedCount > 0;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    const result = await NotificationModel.findByIdAndDelete(notificationId);
    return !!result;
  }

  async clearAllNotifications(userId: string): Promise<boolean> {
    try {
      const result = await NotificationModel.deleteMany({ userId });
      return result.deletedCount >= 0; // Retornar true incluso si no hay notificaciones que eliminar
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }

  async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    let settings = await NotificationSettingsModel.findOne({ userId });
    
    if (!settings) {
      settings = new NotificationSettingsModel({
        userId,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingEmails: true
      });
      await settings.save();
    }
    
    return this.mapToNotificationSettings(settings);
  }

  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const updatedSettings = await NotificationSettingsModel.findOneAndUpdate(
      { userId },
      { ...settings, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    return this.mapToNotificationSettings(updatedSettings);
  }

  async createTestNotification(userId: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'system',
      title: 'Notificación de Prueba',
      message: 'Esta es una notificación de prueba del sistema.',
      isRead: false
    });
  }

  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    const total = await NotificationModel.countDocuments();
    const unread = await NotificationModel.countDocuments({ isRead: false });
    
    const byType = await NotificationModel.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    return {
      total,
      unread,
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };
  }

  private mapToNotification(mongoNotification: any): Notification {
    return {
      id: mongoNotification._id.toString(),
      userId: mongoNotification.userId,
      type: mongoNotification.type,
      title: mongoNotification.title,
      message: mongoNotification.message,
      isRead: mongoNotification.isRead,
      data: mongoNotification.data,
      createdAt: mongoNotification.createdAt.toISOString()
    };
  }

  private mapToNotificationSettings(mongoSettings: any): NotificationSettings {
    return {
      userId: mongoSettings.userId,
      emailNotifications: mongoSettings.emailNotifications,
      pushNotifications: mongoSettings.pushNotifications,
      smsNotifications: mongoSettings.smsNotifications,
      marketingEmails: mongoSettings.marketingEmails || false
    };
  }
}
