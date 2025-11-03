/**
 * 🎯 REPOSITORY MONGODB DE FAVORITOS
 */

import { IFavoriteRepository } from '../../interfaces/IFavoriteRepository';
import { Favorite, Wishlist } from '../../../types/favorites';
import { FavoriteModel, WishlistModel } from '../../schemas/FavoriteSchema';

export class FavoriteRepositoryMongo implements IFavoriteRepository {
  async addFavorite(userId: string, propertyId: string): Promise<Favorite> {
    // Verificar si ya existe (el índice único también lo previene, pero mejor verificar antes)
    const existing = await FavoriteModel.findOne({ userId, propertyId });
    if (existing) {
      return this.mapToFavorite(existing);
    }
    
    const newFavorite = new FavoriteModel({ userId, propertyId });
    const savedFavorite = await newFavorite.save();
    return this.mapToFavorite(savedFavorite);
  }

  async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    const result = await FavoriteModel.findOneAndDelete({ userId, propertyId });
    return !!result;
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const favorites = await FavoriteModel.find({ userId })
      .sort({ createdAt: -1 });
    return favorites.map(favorite => this.mapToFavorite(favorite));
  }

  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const favorite = await FavoriteModel.findOne({ userId, propertyId });
    return !!favorite;
  }

  async createWishlist(userId: string, wishlistData: Omit<Wishlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wishlist> {
    const newWishlist = new WishlistModel({ ...wishlistData, userId });
    const savedWishlist = await newWishlist.save();
    return this.mapToWishlist(savedWishlist);
  }

  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    const wishlists = await WishlistModel.find({ userId })
      .sort({ createdAt: -1 });
    return wishlists.map(wishlist => this.mapToWishlist(wishlist));
  }

  async getPublicWishlists(): Promise<Wishlist[]> {
    const wishlists = await WishlistModel.find({ isPublic: true })
      .sort({ createdAt: -1 });
    return wishlists.map(wishlist => this.mapToWishlist(wishlist));
  }

  async getWishlistById(id: string): Promise<Wishlist | null> {
    const wishlist = await WishlistModel.findById(id);
    return wishlist ? this.mapToWishlist(wishlist) : null;
  }

  async updateWishlist(id: string, updates: Partial<Wishlist>): Promise<Wishlist | null> {
    const wishlist = await WishlistModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return wishlist ? this.mapToWishlist(wishlist) : null;
  }

  async deleteWishlist(id: string): Promise<boolean> {
    const result = await WishlistModel.findByIdAndDelete(id);
    return !!result;
  }

  async addToWishlist(wishlistId: string, propertyId: string): Promise<boolean> {
    const wishlist = await WishlistModel.findById(wishlistId);
    if (!wishlist) return false;
    
    if (!wishlist.propertyIds.includes(propertyId)) {
      wishlist.propertyIds.push(propertyId);
      await wishlist.save();
    }
    return true;
  }

  async removeFromWishlist(wishlistId: string, propertyId: string): Promise<boolean> {
    const wishlist = await WishlistModel.findById(wishlistId);
    if (!wishlist) return false;
    
    wishlist.propertyIds = wishlist.propertyIds.filter(id => id !== propertyId);
    await wishlist.save();
    return true;
  }

  async getFavoriteStats(): Promise<{
    totalFavorites: number;
    totalWishlists: number;
    averageFavoritesPerUser: number;
    mostFavoritedProperties: Array<{ propertyId: string; count: number }>;
  }> {
    const totalFavorites = await FavoriteModel.countDocuments();
    const totalWishlists = await WishlistModel.countDocuments();
    
    const userFavorites = await FavoriteModel.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    
    const averageFavoritesPerUser = userFavorites.length > 0 
      ? totalFavorites / userFavorites.length 
      : 0;

    const propertyFavorites = await FavoriteModel.aggregate([
      { $group: { _id: '$propertyId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      totalFavorites,
      totalWishlists,
      averageFavoritesPerUser: Math.round(averageFavoritesPerUser * 100) / 100,
      mostFavoritedProperties: propertyFavorites.map(item => ({
        propertyId: item._id,
        count: item.count
      }))
    };
  }

  private mapToFavorite(mongoFavorite: any): Favorite {
    return {
      id: mongoFavorite._id.toString(),
      userId: mongoFavorite.userId,
      propertyId: mongoFavorite.propertyId,
      createdAt: mongoFavorite.createdAt.toISOString()
    };
  }

  private mapToWishlist(mongoWishlist: any): Wishlist {
    return {
      id: mongoWishlist._id.toString(),
      userId: mongoWishlist.userId,
      name: mongoWishlist.name,
      description: mongoWishlist.description,
      isPublic: mongoWishlist.isPublic,
      propertyIds: mongoWishlist.propertyIds,
      createdAt: mongoWishlist.createdAt.toISOString(),
      updatedAt: mongoWishlist.updatedAt.toISOString()
    };
  }
}
