/**
 * Servicios de API para el carrito de reservas - Reemplaza localStorage
 * Conecta con el backend real para gestionar el carrito del usuario
 */

import { apiClient } from './config';
import {
  CartItem,
  AddCartItem,
  UpdateCartItem,
  CartResponse,
  CartItemResponse,
  DeleteCartItemResponse,
  cartResponseSchema,
  cartItemResponseSchema,
  deleteCartItemResponseSchema,
  addCartItemSchema,
} from '@/schemas/cart';

/**
 * Servicios del carrito que se conectan al backend real
 */
export const cartService = {
  /**
   * Obtener el carrito del usuario autenticado
   * GET /api/cart
   */
  async getCart(): Promise<{ items: CartItem[]; totalItems: number; totalPrice: number }> {
    try {
      console.log('🔍 [cartService] Obteniendo carrito del usuario...');
      console.log('🔍 [cartService] Token disponible:', apiClient.getAuthToken() ? 'SÍ' : 'NO');
      
      const response = await apiClient.get<CartResponse>('/api/cart');
      
      console.log('🔍 [cartService] Respuesta completa del backend:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // Validar respuesta con Zod
        const validatedData = cartResponseSchema.parse(response);
        
        console.log('✅ [cartService] Carrito obtenido:', validatedData.data.items.length, 'items');
        console.log('📦 [cartService] Items:', JSON.stringify(validatedData.data.items, null, 2));
        return {
          items: validatedData.data.items,
          totalItems: validatedData.data.totalItems,
          totalPrice: validatedData.data.totalPrice,
        };
      } else {
        console.log('⚠️ [cartService] Carrito vacío o no disponible');
        console.log('⚠️ [cartService] Response:', JSON.stringify(response, null, 2));
        return {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        };
      }
    } catch (error) {
      console.error('💥 [cartService] Error obteniendo carrito:', error);
      console.error('💥 [cartService] Error details:', error instanceof Error ? error.message : String(error));
      console.error('💥 [cartService] Error stack:', error instanceof Error ? error.stack : 'N/A');
      
      // Si el endpoint no existe (404), retornar carrito vacío
      if (error instanceof Error && error.message.includes('404')) {
        console.log('⚠️ [cartService] Endpoint /api/cart no disponible, usando carrito vacío');
        return {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        };
      }
      
      throw error;
    }
  },

  /**
   * Agregar un item al carrito
   * POST /api/cart/add
   * 
   * El backend espera solo: { propertyId, checkIn, checkOut, guests, pricePerNight }
   */
  async addToCart(item: AddCartItem): Promise<CartItem> {
    try {
      console.log('🔍 [cartService] Agregando item al carrito...');
      
      // El backend solo necesita estos campos según la documentación
      // Validar primero con Zod
      const validatedData = addCartItemSchema.parse(item);
      
      const requestData = {
        propertyId: validatedData.propertyId,
        checkIn: validatedData.checkIn,
        checkOut: validatedData.checkOut,
        guests: validatedData.guests,
        pricePerNight: validatedData.pricePerNight,
      };
      
      console.log('🔍 [cartService] Request data (según backend):', JSON.stringify(requestData, null, 2));
      console.log('🔍 [cartService] Token disponible:', apiClient.getAuthToken() ? 'SÍ' : 'NO');
      
      const response = await apiClient.post<CartItemResponse>('/api/cart/add', requestData);
      
      console.log('🔍 [cartService] Respuesta completa del backend:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // Validar respuesta con Zod
        const validatedData = cartItemResponseSchema.parse(response);
        
        console.log('✅ [cartService] Item agregado al carrito:', validatedData.data.item.id);
        console.log('📦 [cartService] Item guardado:', JSON.stringify(validatedData.data.item, null, 2));
        return validatedData.data.item;
      } else {
        console.error('❌ [cartService] Respuesta sin éxito:', response);
        throw new Error(response.message || 'Error agregando item al carrito');
      }
    } catch (error) {
      console.error('💥 [cartService] Error agregando item al carrito:', error);
      console.error('💥 [cartService] Error details:', error instanceof Error ? error.message : String(error));
      console.error('💥 [cartService] Error stack:', error instanceof Error ? error.stack : 'N/A');
      
      // Si el endpoint no existe, lanzar error pero no fallar silenciosamente
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(
          'Endpoint /api/cart/add no disponible. Verifica en Postman si el endpoint está implementado.'
        );
      }
      
      throw error;
    }
  },

  /**
   * Actualizar un item del carrito
   * PUT /api/cart/update/:itemId
   */
  async updateCartItem(itemId: string, updates: Partial<UpdateCartItem>): Promise<CartItem> {
    try {
      console.log('🔍 [cartService] Actualizando item del carrito:', itemId);
      
      const response = await apiClient.put<CartItemResponse>(`/api/cart/update/${itemId}`, updates);
      
      if (response.success && response.data) {
        // Validar respuesta con Zod
        const validatedData = cartItemResponseSchema.parse(response);
        
        console.log('✅ [cartService] Item actualizado:', validatedData.data.item.id);
        return validatedData.data.item;
      } else {
        throw new Error(response.message || 'Error actualizando item del carrito');
      }
    } catch (error) {
      console.error('💥 [cartService] Error actualizando item del carrito:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(
          `Endpoint /api/cart/update/${itemId} no disponible. Verifica en Postman si el endpoint está implementado.`
        );
      }
      
      throw error;
    }
  },

  /**
   * Eliminar un item del carrito
   * DELETE /api/cart/remove/:itemId
   */
  async removeFromCart(itemId: string): Promise<void> {
    try {
      console.log('🔍 [cartService] Eliminando item del carrito:', itemId);
      
      const response = await apiClient.delete<DeleteCartItemResponse>(`/api/cart/remove/${itemId}`);
      
      if (response.success) {
        // Validar respuesta con Zod
        deleteCartItemResponseSchema.parse(response);
        
        console.log('✅ [cartService] Item eliminado del carrito:', itemId);
      } else {
        throw new Error(response.message || 'Error eliminando item del carrito');
      }
    } catch (error) {
      console.error('💥 [cartService] Error eliminando item del carrito:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(
          `Endpoint /api/cart/remove/${itemId} no disponible. Verifica en Postman si el endpoint está implementado.`
        );
      }
      
      throw error;
    }
  },

  /**
   * Limpiar todo el carrito
   * DELETE /api/cart/clear
   */
  async clearCart(): Promise<void> {
    try {
      console.log('🔍 [cartService] Limpiando carrito...');
      
      const response = await apiClient.delete<DeleteCartItemResponse>('/api/cart/clear');
      
      if (response.success) {
        // Validar respuesta con Zod
        deleteCartItemResponseSchema.parse(response);
        
        console.log('✅ [cartService] Carrito limpiado exitosamente');
      } else {
        throw new Error(response.message || 'Error limpiando carrito');
      }
    } catch (error) {
      console.error('💥 [cartService] Error limpiando carrito:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(
          'Endpoint DELETE /api/cart/clear no disponible. Verifica en Postman si el endpoint está implementado.'
        );
      }
      
      throw error;
    }
  },

  /**
   * Obtener resumen del carrito
   * GET /api/cart/summary
   */
  async getCartSummary(): Promise<{ totalItems: number; totalPrice: number }> {
    try {
      console.log('🔍 [cartService] Obteniendo resumen del carrito...');
      
      const response = await apiClient.get<{
        success: boolean;
        data?: {
          totalItems: number;
          totalPrice: number;
        };
        message?: string;
      }>('/api/cart/summary');
      
      if (response.success && response.data) {
        console.log('✅ [cartService] Resumen obtenido:', response.data);
        return {
          totalItems: response.data.totalItems || 0,
          totalPrice: response.data.totalPrice || 0,
        };
      } else {
        console.log('⚠️ [cartService] Resumen no disponible');
        return {
          totalItems: 0,
          totalPrice: 0,
        };
      }
    } catch (error) {
      console.error('💥 [cartService] Error obteniendo resumen:', error);
      return {
        totalItems: 0,
        totalPrice: 0,
      };
    }
  },

  /**
   * Obtener item específico del carrito
   * GET /api/cart/item/:itemId
   */
  async getCartItem(itemId: string): Promise<CartItem | null> {
    try {
      console.log('🔍 [cartService] Obteniendo item del carrito:', itemId);
      
      const response = await apiClient.get<CartItemResponse>(`/api/cart/item/${itemId}`);
      
      if (response.success && response.data) {
        const validatedData = cartItemResponseSchema.parse(response);
        console.log('✅ [cartService] Item obtenido:', validatedData.data.item.id);
        return validatedData.data.item;
      } else {
        console.log('⚠️ [cartService] Item no encontrado');
        return null;
      }
    } catch (error) {
      console.error('💥 [cartService] Error obteniendo item:', error);
      return null;
    }
  },

  /**
   * Verificar disponibilidad de propiedad
   * POST /api/cart/check-availability
   */
  async checkAvailability(
    propertyId: string,
    checkIn: string,
    checkOut: string
  ): Promise<{ available: boolean; message?: string }> {
    try {
      console.log('🔍 [cartService] Verificando disponibilidad...', {
        propertyId,
        checkIn,
        checkOut,
      });
      
      const response = await apiClient.post<{
        success: boolean;
        data?: {
          available: boolean;
          message?: string;
        };
        message?: string;
      }>('/api/cart/check-availability', {
        propertyId,
        checkIn,
        checkOut,
      });
      
      if (response.success && response.data) {
        console.log('✅ [cartService] Disponibilidad verificada:', response.data.available);
        return {
          available: response.data.available || false,
          message: response.data.message,
        };
      } else {
        return {
          available: false,
          message: response.message || 'No se pudo verificar la disponibilidad',
        };
      }
    } catch (error) {
      console.error('💥 [cartService] Error verificando disponibilidad:', error);
      return {
        available: false,
        message: 'Error de conexión con el servidor',
      };
    }
  },
};

