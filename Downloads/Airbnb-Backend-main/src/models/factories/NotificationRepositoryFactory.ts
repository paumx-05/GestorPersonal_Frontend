/**
 * 🏭 FACTORY DE REPOSITORY DE NOTIFICACIONES
 */

import { INotificationRepository } from '../interfaces/INotificationRepository';
import { NotificationRepositoryMongo } from '../repositories/mongodb/NotificationRepositoryMongo';

export class NotificationRepositoryFactory {
  private static instance: INotificationRepository;

  static create(): INotificationRepository {
    if (!this.instance) {
      this.instance = new NotificationRepositoryMongo();
    }
    
    return this.instance;
  }

  static reset(): void {
    this.instance = null as any;
  }

  static getCurrentType(): string {
    return 'mongodb';
  }
}
