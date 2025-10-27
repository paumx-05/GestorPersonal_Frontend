/**
 * 🏭 FACTORY DE REPOSITORY DE FAVORITOS
 */

import { IFavoriteRepository } from '../interfaces/IFavoriteRepository';
import { FavoriteRepositoryMongo } from '../repositories/mongodb/FavoriteRepositoryMongo';

export class FavoriteRepositoryFactory {
  private static instance: IFavoriteRepository;

  static create(): IFavoriteRepository {
    if (!this.instance) {
      this.instance = new FavoriteRepositoryMongo();
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
