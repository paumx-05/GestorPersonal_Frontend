/**
 * 🎯 INTERFAZ DE REPOSITORIO DE REVIEWS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Interfaz que define el contrato para todas las operaciones de reviews.
 * Garantiza compatibilidad entre implementaciones Mock y MongoDB.
 */

import { Review, ReviewStats } from '../../types/reviews';

export interface IReviewRepository {
  // ➕ FUNCIONES DE CREACIÓN
  createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review>;
  
  // 🔍 FUNCIONES DE BÚSQUEDA
  getPropertyReviews(propertyId: string): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | null>;
  getAllReviews(): Promise<Review[]>;
  
  // ✏️ FUNCIONES DE ACTUALIZACIÓN
  updateReview(id: string, updates: Partial<Review>): Promise<Review | null>;
  
  // 🗑️ FUNCIONES DE ELIMINACIÓN
  deleteReview(id: string): Promise<boolean>;
  
  // 📊 FUNCIONES DE ESTADÍSTICAS
  getPropertyReviewStats(propertyId: string): Promise<ReviewStats>;
  getReviewStats(): Promise<{
    total: number;
    averageRating: number;
    byRating: Record<number, number>;
  }>;
}
