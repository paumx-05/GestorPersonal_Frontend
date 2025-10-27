/**
 * 🎯 INTERFAZ DE REPOSITORIO DE PAGOS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Interfaz que define el contrato para todas las operaciones de pagos.
 * Garantiza compatibilidad entre implementaciones Mock y MongoDB.
 */

import { PaymentMethod, Transaction, CheckoutData } from '../../types/payments';

export interface IPaymentRepository {
  // 💳 FUNCIONES DE MÉTODOS DE PAGO
  addPaymentMethod(userId: string, paymentData: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod>;
  getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  deletePaymentMethod(userId: string, methodId: string): Promise<boolean>;
  
  // 💰 FUNCIONES DE TRANSACCIONES
  createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | null>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction | null>;
  
  // 🧮 FUNCIONES DE CÁLCULO
  calculatePricing(propertyId: string, checkIn: string, checkOut: string, guests: number): Promise<{
    nights: number;
    basePrice: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency: string;
  }>;
  
  // ✅ FUNCIONES DE VALIDACIÓN
  validatePaymentData(paymentData: any): Promise<boolean>;
  
  // 🔄 FUNCIONES DE PROCESAMIENTO
  processPayment(checkoutData: CheckoutData): Promise<Transaction>;
  
  // 🏷️ FUNCIONES DE UTILIDAD
  getCardBrand(cardNumber: string): string;
}
