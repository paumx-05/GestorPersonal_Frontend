/**
 * 🏭 FACTORY DE REPOSITORY DE PAGOS
 */

import { IPaymentRepository } from '../interfaces/IPaymentRepository';
import { PaymentRepositoryMongo } from '../repositories/mongodb/PaymentRepositoryMongo';

export class PaymentRepositoryFactory {
  private static instance: IPaymentRepository;

  static create(): IPaymentRepository {
    if (!this.instance) {
      this.instance = new PaymentRepositoryMongo();
    }
    
    return this.instance;
  }

  static reset(): void {
    this.instance = null as any;
  }

  static getCurrentType(): string {
    return 'mongodb';
  }
}
