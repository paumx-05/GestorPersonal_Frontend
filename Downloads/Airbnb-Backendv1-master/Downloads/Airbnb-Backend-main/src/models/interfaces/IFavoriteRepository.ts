/**
 * 🎯 INTERFAZ DE REPOSITORIO DE FAVORITOS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Interfaz que define el contrato para todas las operaciones de favoritos.
 * Garantiza compatibilidad entre implementaciones Mock y MongoDB.
 */

import { Favorite, Wishlist } from '../../types/favorites';

export interface IFavoriteRepository {
  // ❤️ FUNCIONES DE FAVORITOS
  addFavorite(userId: string, propertyId: string): Promise<Favorite>;
  removeFavorite(userId: string, propertyId: string): Promise<boolean>;
  getUserFavorites(userId: string): Promise<Favorite[]>;
  isFavorite(userId: string, propertyId: string): Promise<boolean>;
  
  // 📝 FUNCIONES DE WISHLISTS
  createWishlist(userId: string, wishlistData: Omit<Wishlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wishlist>;
  getUserWishlists(userId: string): Promise<Wishlist[]>;
  getPublicWishlists(): Promise<Wishlist[]>;
  getWishlistById(id: string): Promise<Wishlist | null>;
  updateWishlist(id: string, updates: Partial<Wishlist>): Promise<Wishlist | null>;
  deleteWishlist(id: string): Promise<boolean>;
  
  // 🏠 FUNCIONES DE PROPIEDADES EN WISHLISTS
  addToWishlist(wishlistId: string, propertyId: string): Promise<boolean>;
  removeFromWishlist(wishlistId: string, propertyId: string): Promise<boolean>;
  
  // 📊 FUNCIONES DE ESTADÍSTICAS
  getFavoriteStats(): Promise<{
    totalFavorites: number;
    totalWishlists: number;
    averageFavoritesPerUser: number;
    mostFavoritedProperties: Array<{ propertyId: string; count: number }>;
  }>;
}
