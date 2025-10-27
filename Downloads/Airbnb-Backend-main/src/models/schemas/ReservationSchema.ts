import mongoose, { Document, Schema } from 'mongoose';
import { validateDateRange } from './validationUtils';

export interface IReservation extends Document {
  userId: string;
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>({
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
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  collection: 'reservations'
});

// Indexes
ReservationSchema.index({ userId: 1, status: 1 });
ReservationSchema.index({ propertyId: 1, status: 1 });
ReservationSchema.index({ checkIn: 1, checkOut: 1 });

// Validation: checkOut must be after checkIn
ReservationSchema.pre('save', validateDateRange);

export const ReservationModel = mongoose.model<IReservation>('Reservation', ReservationSchema);
