import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSettings extends Document {
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
    marketing: boolean;
    propertyUpdates: boolean;
    searchAlerts: boolean;
    muteAll: boolean;
  };
  privacy: {
    showProfile: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    theme: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sound: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    propertyUpdates: { type: Boolean, default: true },
    searchAlerts: { type: Boolean, default: true },
    muteAll: { type: Boolean, default: false }
  },
  privacy: {
    showProfile: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: true }
  },
  preferences: {
    language: { type: String, default: 'es' },
    timezone: { type: String, default: 'America/Mexico_City' },
    currency: { type: String, default: 'MXN' },
    theme: { type: String, default: 'light', enum: ['light', 'dark', 'auto'] }
  }
}, {
  timestamps: true,
  collection: 'user_settings'
});

export const UserSettingsModel = mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);

