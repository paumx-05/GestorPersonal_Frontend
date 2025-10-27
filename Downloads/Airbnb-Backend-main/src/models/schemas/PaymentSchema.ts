import mongoose, { Document, Schema } from 'mongoose';
import { cardNumberValidator } from './validationUtils';

export interface IPaymentMethod extends Document {
  userId: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  cardNumber?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface ITransaction extends Document {
  userId: string;
  propertyId: string;
  reservationId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
    required: true
  },
  cardNumber: {
    type: String
    // Validación de cardNumber deshabilitada para pruebas sin integración de pago real
    // En producción, usar gateway de pago (Stripe, PayPal) que maneja validación y tokenización
  },
  cardBrand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover']
  },
  expiryMonth: {
    type: Number,
    min: 1,
    max: 12
  },
  expiryYear: {
    type: Number,
    min: new Date().getFullYear()
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'payment_methods'
});

const TransactionSchema = new Schema<ITransaction>({
  userId: {
    type: String,
    required: true
  },
  propertyId: {
    type: String,
    required: true
  },
  reservationId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  collection: 'transactions'
});

// Indexes
PaymentMethodSchema.index({ userId: 1, isDefault: 1 });
TransactionSchema.index({ userId: 1, status: 1 });

export const PaymentMethodModel = mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);
export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
