export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reservation' | 'payment' | 'review' | 'system';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'reservation' | 'payment' | 'review' | 'system';
  data?: any;
}

export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  preferences?: {
    reservations: boolean;
    payments: boolean;
    reviews: boolean;
    system: boolean;
  };
}
