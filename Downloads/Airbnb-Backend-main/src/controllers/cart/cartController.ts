// src/controllers/cart/cartController.ts
// Controladores para el sistema de carrito de reservas

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../types/auth';
import { 
  getCartByUserId, 
  addToCart, 
  removeFromCart, 
  updateCartItem as updateCartItemModel, 
  clearCart, 
  getCartItem, 
  getCartSummary as getCartSummaryModel, 
  checkAvailability,
  getCartStats
} from '../../models';
import { 
  validateAddToCartRequest, 
  validateUpdateCartItemRequest, 
  validateAvailabilityRequest,
  validateUserId,
  validateCartItemId
} from '../../utils/cartValidation';
import { CartResponse, AddToCartRequest, UpdateCartItemRequest, AvailabilityCheckRequest } from '../../types/cart';

// Función para obtener carrito del usuario
export const getUserCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    
    // Logs para debugging
    console.log('🛒 [CART] Obteniendo carrito para usuario:', { userId, userEmail });
    
    if (!userId) {
      console.error('❌ [CART] No se recibió userId del token');
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'Token de autenticación requerido'
      } as CartResponse);
      return;
    }
    
    const cartData = await getCartByUserId(userId);
    
    console.log('✅ [CART] Carrito obtenido:', {
      userId,
      totalItems: cartData.totalItems,
      totalPrice: cartData.totalPrice,
      itemsCount: cartData.items.length
    });
    
    res.status(200).json({
      success: true,
      message: 'Carrito obtenido exitosamente',
      data: cartData
    } as CartResponse);
    
  } catch (error) {
    console.error('❌ [CART] Error al obtener carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as CartResponse);
  }
};

// Función para agregar item al carrito
export const addItemToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'Token de autenticación requerido'
      } as CartResponse);
      return;
    }
    
    const requestData: AddToCartRequest = req.body;
    
    // Validar datos de entrada
    const validation = validateAddToCartRequest(requestData);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        error: validation.errors.join(', ')
      } as CartResponse);
      return;
    }
    
    // Verificar disponibilidad
    const isAvailable = await checkAvailability(
      requestData.propertyId, 
      requestData.checkIn, 
      requestData.checkOut
    );
    
    if (!isAvailable) {
      res.status(409).json({
        success: false,
        message: 'Las fechas seleccionadas no están disponibles',
        error: 'Conflicto de disponibilidad'
      } as CartResponse);
      return;
    }
    
    // Calcular valores del carrito
    const totalNights = Math.ceil((new Date(requestData.checkOut).getTime() - new Date(requestData.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = requestData.pricePerNight || 0;
    const subtotal = pricePerNight * totalNights;
    const cleaningFee = Math.round(subtotal * 0.10); // 10% de fee de limpieza
    const serviceFee = Math.round(subtotal * 0.05); // 5% de fee de servicio
    const taxes = Math.round(subtotal * 0.10); // 10% de impuestos
    const total = subtotal + cleaningFee + serviceFee + taxes;
    
    // Agregar al carrito
    console.log('🛒 [CART] Agregando item al carrito:', {
      userId,
      propertyId: requestData.propertyId,
      checkIn: requestData.checkIn,
      checkOut: requestData.checkOut
    });
    
    const newItem = await addToCart(userId, {
      userId,
      propertyId: requestData.propertyId,
      checkIn: requestData.checkIn,
      checkOut: requestData.checkOut,
      guests: requestData.guests,
      pricePerNight,
      totalNights,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      totalPrice: total
    });
    
    console.log('✅ [CART] Item agregado exitosamente:', {
      itemId: newItem.id,
      userId: newItem.userId,
      expiresAt: newItem.expiresAt
    });
    
    res.status(201).json({
      success: true,
      message: 'Item agregado al carrito exitosamente',
      data: newItem
    } as CartResponse);
    
  } catch (error) {
    console.error('Error al agregar item al carrito:', error);
    
    if (error instanceof Error && error.message.includes('Límite máximo')) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: 'Límite de items alcanzado'
      } as CartResponse);
      return;
    }
    
    if (error instanceof Error && error.message.includes('Ya existe')) {
      res.status(409).json({
        success: false,
        message: error.message,
        error: 'Item duplicado'
      } as CartResponse);
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as CartResponse);
  }
};

// Función para eliminar item del carrito
export const removeItemFromCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { itemId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'Token de autenticación requerido'
      } as CartResponse);
      return;
    }
    
    // Validar ID del item
    const itemIdValidation = validateCartItemId(itemId);
    if (!itemIdValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'ID de item inválido',
        error: itemIdValidation.errors.join(', ')
      } as CartResponse);
      return;
    }
    
    // Eliminar del carrito
    const removed = await removeFromCart(userId, itemId);
    
    if (!removed) {
      res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito',
        error: 'Item no existe o no pertenece al usuario'
      } as CartResponse);
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Item eliminado del carrito exitosamente',
      data: { itemId }
    } as CartResponse);
    
  } catch (error) {
    console.error('Error al eliminar item del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as CartResponse);
  }
};

// Función para actualizar item del carrito
export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { itemId } = req.params;
    const updates: UpdateCartItemRequest = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'Token de autenticación requerido'
      } as CartResponse);
      return;
    }
    
    // Validar ID del item
    const itemIdValidation = validateCartItemId(itemId);
    if (!itemIdValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'ID de item inválido',
        error: itemIdValidation.errors.join(', ')
      } as CartResponse);
      return;
    }
    
    // Validar datos de actualización
    const validation = validateUpdateCartItemRequest(updates);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Datos de actualización inválidos',
        error: validation.errors.join(', ')
      } as CartResponse);
      return;
    }
    
    // Actualizar item
    const updatedItem = await updateCartItemModel(userId, itemId, updates);
    
    if (!updatedItem) {
      res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito',
        error: 'Item no existe o no pertenece al usuario'
      } as CartResponse);
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Item actualizado exitosamente',
      data: updatedItem
    } as CartResponse);
    
  } catch (error) {
    console.error('Error al actualizar item del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as CartResponse);
  }
};

// Función para limpiar carrito completo
export const clearUserCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'Token de autenticación requerido'
      } as CartResponse);
      return;
    }
    
    // Limpiar carrito
    const cleared = await clearCart(userId);
    
    res.status(200).json({
      success: true,
      message: cleared ? 'Carrito limpiado exitosamente' : 'Carrito ya estaba vacío',
      data: { cleared }
    } as CartResponse);
    
  } catch (error) {
    console.error('Error al limpiar carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as CartResponse);
  }
};

// Función para obtener resumen del carrito
export const getCartSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'Token de autenticación requerido'
      } as CartResponse);
      return;
    }
    
    const summary = await getCartSummaryModel(userId);
    
    // Calcular totales estandarizados
    const subtotal = summary.totalPrice || 0;
    const taxes = Math.round(subtotal * 0.10); // 10% impuestos
    const serviceFee = Math.round(subtotal * 0.05); // 5% fee de servicio
    const total = subtotal + taxes + serviceFee;
    
    res.status(200).json({
      success: true,
      message: 'Resumen del carrito obtenido exitosamente',
      data: {
        itemCount: summary.totalItems,
        subtotal,
        taxes,
        serviceFee,
        total,
        items: summary.items
      }
    } as CartResponse);
    
  } catch (error) {
    console.error('Error al obtener resumen del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as CartResponse);
  }
};

// Función para verificar disponibilidad
export const checkPropertyAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestData: AvailabilityCheckRequest = req.body;
    
    // Validar datos de entrada
    const validation = validateAvailabilityRequest(requestData);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        error: validation.errors.join(', ')
      } as CartResponse);
      return;
    }
    
    // Verificar disponibilidad
    const isAvailable = await checkAvailability(
      requestData.propertyId, 
      requestData.checkIn, 
      requestData.checkOut
    );
    
    res.status(200).json({
      success: true,
      message: isAvailable ? 'Propiedad disponible' : 'Propiedad no disponible',
      data: {
        available: isAvailable,
        message: isAvailable ? 'Las fechas están disponibles' : 'Las fechas no están disponibles',
        propertyId: requestData.propertyId,
        checkIn: requestData.checkIn,
        checkOut: requestData.checkOut,
        guests: requestData.guests
      }
    } as CartResponse);
    
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as CartResponse);
  }
};

// Función para obtener item específico del carrito
export const getCartItemById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { itemId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'Token de autenticación requerido'
      } as CartResponse);
      return;
    }
    
    // Validar ID del item
    const itemIdValidation = validateCartItemId(itemId);
    if (!itemIdValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'ID de item inválido',
        error: itemIdValidation.errors.join(', ')
      } as CartResponse);
      return;
    }
    
    // Obtener item
    const item = await getCartItem(userId, itemId);
    
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito',
        error: 'Item no existe o no pertenece al usuario'
      } as CartResponse);
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Item obtenido exitosamente',
      data: item
    } as CartResponse);
    
  } catch (error) {
    console.error('Error al obtener item del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as CartResponse);
  }
};

// Función para obtener estadísticas del carrito (admin)
export const getCartStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'Token de autenticación requerido'
      } as CartResponse);
      return;
    }
    
    // Verificar si es admin (simplificado para demo)
    const adminEmails = ['admin@demo.com', 'demo@airbnb.com'];
    const isAdmin = req.user?.email && adminEmails.includes(req.user.email);
    
    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado',
        error: 'Solo administradores pueden ver estadísticas'
      } as CartResponse);
      return;
    }
    
    const stats = await getCartStats();
    
    res.status(200).json({
      success: true,
      message: 'Estadísticas del carrito obtenidas exitosamente',
      data: stats
    } as CartResponse);
    
  } catch (error) {
    console.error('Error al obtener estadísticas del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as CartResponse);
  }
};
