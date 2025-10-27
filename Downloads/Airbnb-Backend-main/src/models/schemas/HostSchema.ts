import mongoose, { Document, Schema } from 'mongoose';
import { urlValidator } from './validationUtils';
import { getCollectionOptions } from './baseSchemas';

export interface IHostProperty extends Document {
  hostId: string;
  title: string;
  description: string;
  location: string; // Simplificado como string
  propertyType: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms?: number; // Opcional
  bathrooms?: number; // Opcional
  amenities: string[];
  images: string[];
  rules?: string[];
  isActive: boolean;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const HostPropertySchema = new Schema<IHostProperty>({
  hostId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  propertyType: {
    type: String,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  bedrooms: {
    type: Number,
    required: false,
    min: 0,
    default: 1
  },
  bathrooms: {
    type: Number,
    required: false,
    min: 0,
    default: 1
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  rules: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, getCollectionOptions('host_properties'));

// Indexes
HostPropertySchema.index({ hostId: 1, status: 1 });
HostPropertySchema.index({ 'location.city': 1, pricePerNight: 1 });
HostPropertySchema.index({ maxGuests: 1 });

export const HostPropertyModel = mongoose.model<IHostProperty>('HostProperty', HostPropertySchema);
