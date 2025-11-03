/**
 * 🏭 FACTORY DE REPOSITORY DE CARRITO
 */

import { ICartRepository } from '../interfaces/ICartRepository';
import { CartRepositoryMongo } from '../repositories/mongodb/CartRepositoryMongo';

export class CartRepositoryFactory {
  private static instance: ICartRepository;

  static create(): ICartRepository {
    if (!this.instance) {
      this.instance = new CartRepositoryMongo();
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
