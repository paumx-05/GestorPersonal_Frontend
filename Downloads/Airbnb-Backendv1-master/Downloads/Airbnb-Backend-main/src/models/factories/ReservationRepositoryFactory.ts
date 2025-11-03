/**
 * 🏭 FACTORY DE REPOSITORY DE RESERVAS
 */

import { IReservationRepository } from '../interfaces/IReservationRepository';
import { ReservationRepositoryMongo } from '../repositories/mongodb/ReservationRepositoryMongo';

export class ReservationRepositoryFactory {
  private static instance: IReservationRepository;

  static create(): IReservationRepository {
    if (!this.instance) {
      this.instance = new ReservationRepositoryMongo();
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
