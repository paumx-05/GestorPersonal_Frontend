import mongoose, { Document, Schema } from 'mongoose';
import { validateDateRange } from './validationUtils';

export interface ICartItem extends Document {
  userId: string;
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  pricePerNight: number;
  totalNights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
  expiresAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  userId: {
    type: String,
    required: true
  },
  propertyId: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  totalNights: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  cleaningFee: {
    type: Number,
    required: true,
    min: 0
  },
  serviceFee: {
    type: Number,
    required: true,
    min: 0
  },
  taxes: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true,
  collection: 'cart_items'
});

// Indexes
CartItemSchema.index({ userId: 1, expiresAt: 1 });

// TTL index to automatically clean expired items
CartItemSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Validation: checkOut must be after checkIn
CartItemSchema.pre('save', validateDateRange);

export const CartItemModel = mongoose.model<ICartItem>('CartItem', CartItemSchema);
