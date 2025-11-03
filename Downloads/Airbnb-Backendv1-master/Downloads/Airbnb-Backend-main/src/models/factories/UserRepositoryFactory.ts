/**
 * 🏭 FACTORY DE REPOSITORY DE USUARIO
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Factory que retorna la implementación de MongoDB (producción)
 * 
 * 🔧 CARACTERÍSTICAS:
 * - Singleton pattern para evitar múltiples instancias
 * - Reset method para testing
 */

import { IUserRepository } from '../interfaces/IUserRepository';
import { UserRepositoryMongo } from '../repositories/mongodb/UserRepositoryMongo';

export class UserRepositoryFactory {
  private static instance: IUserRepository;

  /**
   * 🏭 Crea o retorna la instancia del repositorio de usuario
   * @returns IUserRepository - Instancia del repositorio
   */
  static create(): IUserRepository {
    if (!this.instance) {
      this.instance = new UserRepositoryMongo();
    }
    
    return this.instance;
  }

  /**
   * 🔄 Resetea la instancia (útil para testing)
   */
  static reset(): void {
    this.instance = null as any;
  }

  /**
   * 🔍 Obtiene el tipo de repositorio actual
   * @returns string - Tipo de repositorio ('mongodb')
   */
  static getCurrentType(): string {
    return 'mongodb';
  }
}
