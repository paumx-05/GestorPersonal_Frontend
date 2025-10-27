import mongoose, { Document, Schema } from 'mongoose';
import { urlValidator } from './validationUtils';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  createdAt: Date;
  isActive: boolean;
  role: 'user' | 'admin';
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  avatar: { 
    type: String,
    validate: urlValidator
  },
  bio: {
    type: String,
    maxlength: 500
  },
  location: {
    type: String,
    maxlength: 100
  },
  phone: {
    type: String,
    maxlength: 20
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes
UserSchema.index({ isActive: 1 });
UserSchema.index({ role: 1 });

// Pre-save middleware
UserSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
