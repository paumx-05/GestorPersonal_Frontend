/**
 * Esquemas Zod para validación de datos del carrito
 * Usa estos esquemas para validar requests/responses de la API del carrito
 */

import { z } from 'zod';

/**
 * Esquema para un item del carrito según respuesta del backend
 * El backend devuelve: id, propertyId, checkIn, checkOut, guests, totalPrice, expiresAt
 */
export const cartItemSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  checkIn: z.string(), // Backend devuelve ISO string "2025-12-02T00:00:00.000Z"
  checkOut: z.string(), // Backend devuelve ISO string
  guests: z.number().int().positive(),
  totalPrice: z.number().nonnegative(),
  expiresAt: z.string().optional(), // Fecha de expiración del item
  // Campos adicionales que el frontend necesita para mostrar (se obtienen de la propiedad)
  propertyTitle: z.string().optional(),
  propertyLocation: z.string().optional(),
  propertyImage: z.string().optional(),
  // Campos calculados localmente (no vienen del backend)
  totalNights: z.number().int().nonnegative().optional(),
  subtotal: z.number().nonnegative().optional(),
  cleaningFee: z.number().nonnegative().optional(),
  serviceFee: z.number().nonnegative().optional(),
  taxes: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Esquema para agregar un item al carrito
 * El backend espera solo: propertyId, checkIn, checkOut, guests, pricePerNight
 */
export const addCartItemSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  guests: z.number().int().positive(),
  pricePerNight: z.number().positive(),
});

/**
 * Esquema para actualizar un item del carrito
 */
export const updateCartItemSchema = cartItemSchema.partial().required({ id: true });

/**
 * Esquema para la respuesta de obtener el carrito
 * El backend devuelve: success, message, data: { userId, items[], totalItems, totalPrice, lastUpdated }
 */
export const cartResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    userId: z.string().optional(),
    items: z.array(cartItemSchema),
    totalItems: z.number().int().nonnegative(),
    totalPrice: z.number().nonnegative(),
    lastUpdated: z.string().optional(),
  }),
});

/**
 * Esquema para la respuesta de agregar/actualizar item
 */
export const cartItemResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    item: cartItemSchema,
  }),
  message: z.string().optional(),
});

/**
 * Esquema para la respuesta de eliminar item
 */
export const deleteCartItemResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

/**
 * Tipos TypeScript derivados de los esquemas Zod
 * Nota: propertyLocation siempre será string después de la transformación
 */
export type CartItem = z.infer<typeof cartItemSchema>;
export type AddCartItem = z.infer<typeof addCartItemSchema>;
export type UpdateCartItem = Partial<CartItem> & { id: string };
export type CartResponse = z.infer<typeof cartResponseSchema>;
export type CartItemResponse = z.infer<typeof cartItemResponseSchema>;
export type DeleteCartItemResponse = z.infer<typeof deleteCartItemResponseSchema>;

