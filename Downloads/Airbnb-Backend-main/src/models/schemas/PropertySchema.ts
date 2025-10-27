import mongoose, { Document, Schema } from 'mongoose';
import { urlValidator } from './validationUtils';
import { locationSchema, userReferenceSchema, getCollectionOptions } from './baseSchemas';

export interface IProperty extends Document {
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  propertyType: 'entire' | 'private' | 'shared';
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  host: {
    id: string;
    name: string;
    avatar: string;
    isSuperhost: boolean;
  };
  rating: number;
  reviewCount: number;
  instantBook: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>({
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
  location: locationSchema,
  propertyType: {
    type: String,
    enum: ['entire', 'private', 'shared'],
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
    max: 20
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    validate: urlValidator
  }],
  host: {
    ...userReferenceSchema.obj,
    isSuperhost: { type: Boolean, default: false }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0
  },
  instantBook: {
    type: Boolean,
    default: false
  }
}, getCollectionOptions('properties'));

// Indexes
PropertySchema.index({ 'location.city': 1, propertyType: 1 });
PropertySchema.index({ pricePerNight: 1, maxGuests: 1 });
PropertySchema.index({ rating: -1, instantBook: 1 });

export const PropertyModel = mongoose.model<IProperty>('Property', PropertySchema);
