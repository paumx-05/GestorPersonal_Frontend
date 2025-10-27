import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: 'reservation' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export interface INotificationSettings extends Document {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  preferences: {
    reservations: boolean;
    payments: boolean;
    reviews: boolean;
    system: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['reservation', 'payment', 'review', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  isRead: {
    type: Boolean,
    default: false
  },
  data: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'notifications'
});

const NotificationSettingsSchema = new Schema<INotificationSettings>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  preferences: {
    reservations: { type: Boolean, default: true },
    payments: { type: Boolean, default: true },
    reviews: { type: Boolean, default: true },
    system: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  collection: 'notification_settings'
});

// Indexes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
export const NotificationSettingsModel = mongoose.model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);
