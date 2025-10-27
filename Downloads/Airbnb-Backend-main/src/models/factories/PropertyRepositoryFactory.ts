/**
 * 🏭 FACTORY DE REPOSITORY DE PROPIEDADES
 */

import { IPropertyRepository } from '../interfaces/IPropertyRepository';
import { PropertyRepositoryMongo } from '../repositories/mongodb/PropertyRepositoryMongo';

export class PropertyRepositoryFactory {
  private static instance: IPropertyRepository;

  static create(): IPropertyRepository {
    if (!this.instance) {
      this.instance = new PropertyRepositoryMongo();
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
