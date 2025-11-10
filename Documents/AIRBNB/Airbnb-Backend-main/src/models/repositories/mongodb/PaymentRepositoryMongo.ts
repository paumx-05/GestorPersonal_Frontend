/**
 * 🎯 REPOSITORY MONGODB DE PAGOS
 */

import { IPaymentRepository } from '../../interfaces/IPaymentRepository';
import { PaymentMethod, Transaction, CheckoutData } from '../../../types/payments';
import { PaymentMethodModel, TransactionModel } from '../../schemas/PaymentSchema';
import { getPropertyById } from '../../../models';

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
    // Calcular número de noches
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    // ✅ Obtener la propiedad desde la base de datos para usar el precio real
    const property = await getPropertyById(propertyId);
    
    if (!property) {
      throw new Error('Propiedad no encontrada');
    }

    // ✅ Verificar que la propiedad tiene un precio válido
    const pricePerNight = property.pricePerNight || property.price || 0;
    
    if (!pricePerNight || pricePerNight <= 0) {
      throw new Error('La propiedad no tiene un precio válido');
    }

    // ✅ Calcular subtotal usando el precio REAL de la propiedad
    const subtotal = pricePerNight * nights;

    // ✅ Calcular tarifas e impuestos (según las instrucciones: 5%, 8%, 12%)
    const cleaningFee = Math.round(subtotal * 0.05 * 100) / 100;  // 5% del subtotal
    const serviceFee = Math.round(subtotal * 0.08 * 100) / 100;   // 8% del subtotal
    const taxes = Math.round(subtotal * 0.12 * 100) / 100;        // 12% del subtotal

    // ✅ Calcular total final
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      nights,
      basePrice: pricePerNight, // ✅ Precio real de la propiedad
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
      stripeChargeId: mongoTransaction.stripeChargeId,
      stripePaymentIntentId: mongoTransaction.stripePaymentIntentId,
      createdAt: mongoTransaction.createdAt.toISOString(),
      updatedAt: mongoTransaction.updatedAt.toISOString()
    } as any;
  }
}
