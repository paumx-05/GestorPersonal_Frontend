/**
 * 🎯 REPOSITORY MONGODB DE CARRITO
 */

import { ICartRepository } from '../../interfaces/ICartRepository';
import { CartItem, CartData, CartSummary } from '../../../types/cart';
import { CartItemModel } from '../../schemas/CartSchema';

export class CartRepositoryMongo implements ICartRepository {
  async getCartByUserId(userId: string): Promise<CartData> {
    const items = await CartItemModel.find({ userId });
    const total = items.reduce((sum, item) => sum + item.total, 0);
    
    return {
      userId,
      items: items.map(item => this.mapToCartItem(item)),
      totalItems: items.length,
      totalPrice: total,
      lastUpdated: new Date().toISOString()
    };
  }

  async addToCart(userId: string, item: any): Promise<CartItem> {
    const newItem = new CartItemModel({
      userId,
      propertyId: item.propertyId,
      checkIn: new Date(item.checkIn),
      checkOut: new Date(item.checkOut),
      guests: item.guests,
      pricePerNight: item.pricePerNight,
      totalNights: item.totalNights,
      subtotal: item.subtotal,
      cleaningFee: item.cleaningFee,
      serviceFee: item.serviceFee,
      taxes: item.taxes,
      total: item.totalPrice,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    });
    const savedItem = await newItem.save();
    return this.mapToCartItem(savedItem);
  }

  async removeFromCart(userId: string, itemId: string): Promise<boolean> {
    const result = await CartItemModel.findOneAndDelete({ 
      _id: itemId, 
      userId 
    });
    return !!result;
  }

  async updateCartItem(userId: string, itemId: string, updates: Partial<CartItem>): Promise<CartItem | null> {
    const item = await CartItemModel.findOneAndUpdate(
      { _id: itemId, userId },
      updates,
      { new: true }
    );
    return item ? this.mapToCartItem(item) : null;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await CartItemModel.deleteMany({ userId });
    return result.deletedCount > 0;
  }

  async getCartItem(userId: string, itemId: string): Promise<CartItem | null> {
    const item = await CartItemModel.findOne({ _id: itemId, userId });
    return item ? this.mapToCartItem(item) : null;
  }

  async getCartSummary(userId: string): Promise<CartSummary> {
    const items = await CartItemModel.find({ userId });
    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
    const totalNights = items.reduce((sum, item) => sum + item.totalNights, 0);

    return {
      totalItems: items.length,
      totalPrice,
      totalNights,
      items: items.map(item => this.mapToCartItem(item))
    };
  }

  async checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean> {
    // Simular verificación de disponibilidad
    return true;
  }

  async getCartStats(): Promise<{
    totalCarts: number;
    totalItems: number;
    averageItemsPerCart: number;
    expiredItems: number;
  }> {
    const now = new Date();
    const expiredItems = await CartItemModel.countDocuments({ expiresAt: { $lt: now } });
    const totalItems = await CartItemModel.countDocuments();
    
    const userCarts = await CartItemModel.distinct('userId');
    const averageItemsPerCart = userCarts.length > 0 ? totalItems / userCarts.length : 0;

    return {
      totalCarts: userCarts.length,
      totalItems,
      averageItemsPerCart: Math.round(averageItemsPerCart * 100) / 100,
      expiredItems
    };
  }

  private mapToCartItem(mongoItem: any): CartItem {
    return {
      id: mongoItem._id.toString(),
      userId: mongoItem.userId,
      propertyId: mongoItem.propertyId,
      checkIn: mongoItem.checkIn.toISOString(),
      checkOut: mongoItem.checkOut.toISOString(),
      guests: mongoItem.guests,
      pricePerNight: mongoItem.pricePerNight,
      totalNights: mongoItem.totalNights,
      totalPrice: mongoItem.total,
      expiresAt: mongoItem.expiresAt.toISOString(),
      createdAt: mongoItem.createdAt.toISOString()
    };
  }
}
