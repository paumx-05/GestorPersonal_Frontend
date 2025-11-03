/**
 * 🏭 FACTORY DE REPOSITORY DE HOST
 */

import { IHostRepository } from '../interfaces/IHostRepository';
import { HostRepositoryMongo } from '../repositories/mongodb/HostRepositoryMongo';

export class HostRepositoryFactory {
  private static instance: IHostRepository;

  static create(): IHostRepository {
    if (!this.instance) {
      this.instance = new HostRepositoryMongo();
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
