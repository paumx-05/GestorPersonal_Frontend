/**
 * 🏭 FACTORY DE REPOSITORY DE REVIEWS
 */

import { IReviewRepository } from '../interfaces/IReviewRepository';
import { ReviewRepositoryMongo } from '../repositories/mongodb/ReviewRepositoryMongo';

export class ReviewRepositoryFactory {
  private static instance: IReviewRepository;

  static create(): IReviewRepository {
    if (!this.instance) {
      this.instance = new ReviewRepositoryMongo();
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
