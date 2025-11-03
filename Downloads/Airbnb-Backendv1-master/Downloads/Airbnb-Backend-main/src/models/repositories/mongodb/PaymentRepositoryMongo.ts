/**
 * 🎯 REPOSITORY MONGODB DE PAGOS
 */

import { IPaymentRepository } from '../../interfaces/IPaymentRepository';
import { PaymentMethod, Transaction, CheckoutData } from '../../../types/payments';
import { PaymentMethodModel, TransactionModel } from '../../schemas/PaymentSchema';

export class PaymentRepositoryMongo implements IPaymentRepository {
  async addPaymentMethod(userId: string, paymentData: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod> {
    const newMethod = new PaymentMethodModel({ ...paymentData, userId });
    const savedMethod = await newMethod.save();
    return this.mapToPaymentMethod(savedMethod);
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const methods = await PaymentMethodModel.find({ userId });
    return methods.map(method => this.mapToPaymentMethod(method));
  }

  async deletePaymentMethod(userId: string, methodId: string): Promise<boolean> {
    const result = await PaymentMethodModel.findOneAndDelete({ 
      _id: methodId, 
      userId 
    });
    return !!result;
  }

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const newTransaction = new TransactionModel(transactionData);
    const savedTransaction = await newTransaction.save();
    return this.mapToTransaction(savedTransaction);
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const transactions = await TransactionModel.find({ userId })
      .sort({ createdAt: -1 });
    return transactions.map(transaction => this.mapToTransaction(transaction));
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const transaction = await TransactionModel.findById(id);
    return transaction ? this.mapToTransaction(transaction) : null;
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | null> {
    const transaction = await TransactionModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    return transaction ? this.mapToTransaction(transaction) : null;
  }

  async calculatePricing(propertyId: string, checkIn: string, checkOut: string, guests: number): Promise<{
    nights: number;
    basePrice: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency: string;
  }> {
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = 100;
    const subtotal = basePrice * nights;
    const cleaningFee = 25;
    const serviceFee = subtotal * 0.1;
    const taxes = (subtotal + cleaningFee + serviceFee) * 0.1;
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      nights,
      basePrice,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total,
      currency: 'USD'
    };
  }

  async validatePaymentData(paymentData: any): Promise<boolean> {
    // Validar que los datos de pago existan y tengan los campos requeridos
    if (!paymentData) return false;
    
    // Validar número de tarjeta
    if (!paymentData.cardNumber || paymentData.cardNumber.length < 13) return false;
    
    // Validar CVV
    if (!paymentData.cvv || paymentData.cvv.length < 3) return false;
    
    // Validar expiry
    if (!paymentData.expiryMonth || !paymentData.expiryYear) return false;
    if (paymentData.expiryMonth < 1 || paymentData.expiryMonth > 12) return false;
    if (paymentData.expiryYear < new Date().getFullYear()) return false;
    
    // Validar nombre del titular
    if (!paymentData.cardholderName || paymentData.cardholderName.trim().length < 3) return false;
    
    // Validar dirección de facturación
    if (!paymentData.billingAddress || !paymentData.billingAddress.street || !paymentData.billingAddress.city) return false;
    
    return true;
  }

  async processPayment(checkoutData: CheckoutData): Promise<Transaction> {
    // Simular datos de transacción basados en CheckoutData
    const amount = 150; // Precio simulado
    const paymentMethod: PaymentMethod = {
      id: '1',
      userId: 'user123', // Simulado
      type: 'card',
      cardNumber: checkoutData.paymentInfo.cardNumber,
      cardBrand: 'visa',
      expiryMonth: checkoutData.paymentInfo.expiryMonth,
      expiryYear: checkoutData.paymentInfo.expiryYear,
      cardholderName: checkoutData.paymentInfo.cardholderName,
      isDefault: true,
      createdAt: new Date().toISOString()
    };

    return await this.createTransaction({
      userId: 'user123', // Simulado
      propertyId: checkoutData.propertyId,
      reservationId: 'reservation123', // Simulado
      amount: amount,
      currency: 'USD',
      status: 'completed',
      paymentMethod: paymentMethod,
      transactionId: `txn_${Date.now()}`,
      description: `Pago para propiedad ${checkoutData.propertyId}`
    });
  }

  getCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  }

  private mapToPaymentMethod(mongoMethod: any): PaymentMethod {
    return {
      id: mongoMethod._id.toString(),
      userId: mongoMethod.userId,
      type: mongoMethod.type,
      cardNumber: mongoMethod.cardNumber,
      cardBrand: mongoMethod.cardBrand,
      expiryMonth: mongoMethod.expiryMonth,
      expiryYear: mongoMethod.expiryYear,
      isDefault: mongoMethod.isDefault,
      createdAt: mongoMethod.createdAt.toISOString()
    };
  }

  private mapToTransaction(mongoTransaction: any): Transaction {
    return {
      id: mongoTransaction._id.toString(),
      userId: mongoTransaction.userId,
      propertyId: mongoTransaction.propertyId,
      reservationId: mongoTransaction.reservationId,
      amount: mongoTransaction.amount,
      currency: mongoTransaction.currency,
      status: mongoTransaction.status,
      paymentMethod: mongoTransaction.paymentMethod,
      transactionId: mongoTransaction.transactionId,
      description: mongoTransaction.description,
      createdAt: mongoTransaction.createdAt.toISOString(),
      updatedAt: mongoTransaction.updatedAt.toISOString()
    };
  }
}
