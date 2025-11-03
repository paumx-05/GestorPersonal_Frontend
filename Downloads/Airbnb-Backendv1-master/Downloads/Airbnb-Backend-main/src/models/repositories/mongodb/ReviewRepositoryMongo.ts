/**
 * 🎯 REPOSITORY MONGODB DE REVIEWS
 */

import { IReviewRepository } from '../../interfaces/IReviewRepository';
import { Review, ReviewStats } from '../../../types/reviews';
import { ReviewModel } from '../../schemas/ReviewSchema';

export class ReviewRepositoryMongo implements IReviewRepository {
  async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const newReview = new ReviewModel(review);
    const savedReview = await newReview.save();
    return this.mapToReview(savedReview);
  }

  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    const reviews = await ReviewModel.find({ propertyId })
      .sort({ createdAt: -1 });
    return reviews.map(review => this.mapToReview(review));
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    const reviews = await ReviewModel.find({ userId })
      .sort({ createdAt: -1 });
    return reviews.map(review => this.mapToReview(review));
  }

  async getReviewById(id: string): Promise<Review | null> {
    const review = await ReviewModel.findById(id);
    return review ? this.mapToReview(review) : null;
  }

  async getAllReviews(): Promise<Review[]> {
    const reviews = await ReviewModel.find()
      .sort({ createdAt: -1 });
    return reviews.map(review => this.mapToReview(review));
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const review = await ReviewModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return review ? this.mapToReview(review) : null;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await ReviewModel.findByIdAndDelete(id);
    return !!result;
  }

  async getPropertyReviewStats(propertyId: string): Promise<ReviewStats> {
    const reviews = await ReviewModel.find({ propertyId });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const byRating: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      byRating[i] = reviews.filter(review => review.rating === i).length;
    }

    return {
      propertyId,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      categoryAverages: {
        cleanliness: averageRating,
        communication: averageRating,
        checkin: averageRating,
        accuracy: averageRating,
        location: averageRating,
        value: averageRating
      }
    };
  }

  async getReviewStats(): Promise<{
    total: number;
    averageRating: number;
    byRating: Record<number, number>;
  }> {
    const total = await ReviewModel.countDocuments();
    const reviews = await ReviewModel.find();
    const averageRating = total > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / total 
      : 0;
    
    const byRating: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      byRating[i] = reviews.filter(review => review.rating === i).length;
    }

    return {
      total,
      averageRating: Math.round(averageRating * 10) / 10,
      byRating
    };
  }

  private mapToReview(mongoReview: any): Review {
    return {
      _id: mongoReview._id.toString(),
      id: mongoReview._id.toString(),
      propertyId: mongoReview.propertyId,
      userId: mongoReview.userId,
      reservationId: mongoReview.reservationId,
      rating: mongoReview.rating,
      comment: mongoReview.comment,
      categories: mongoReview.categories,
      isVerified: mongoReview.isVerified,
      createdAt: mongoReview.createdAt?.toISOString ? mongoReview.createdAt.toISOString() : mongoReview.createdAt,
      updatedAt: mongoReview.updatedAt?.toISOString ? mongoReview.updatedAt.toISOString() : mongoReview.updatedAt
    } as any;
  }
}
