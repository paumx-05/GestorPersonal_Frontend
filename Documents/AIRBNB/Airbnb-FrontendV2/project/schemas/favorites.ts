/**
 * Esquemas Zod para validación de datos de favoritos
 * Usa estos esquemas para validar requests/responses de la API de favoritos
 */

import { z } from 'zod';

/**
 * Esquema para un favorito según respuesta del backend
 * El backend devuelve: id, propertyId, userId, createdAt
 */
export const favoriteSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
});

/**
 * Esquema para agregar un favorito
 * El backend espera: { propertyId: string }
 */
export const addFavoriteSchema = z.object({
  propertyId: z.string(),
});

/**
 * Esquema para la respuesta de obtener favoritos
 * El backend devuelve: success, message, data: { favorites[] }
 */
export const favoritesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    favorites: z.array(favoriteSchema),
    total: z.number().int().nonnegative().optional(),
  }),
});

/**
 * Esquema para la respuesta de agregar/eliminar favorito
 */
export const favoriteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    favorite: favoriteSchema.optional(),
  }).optional(),
});

/**
 * Esquema para verificar si una propiedad está en favoritos
 */
export const checkFavoriteResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    isFavorite: z.boolean(),
  }),
});

/**
 * Tipos TypeScript derivados de los esquemas Zod
 */
export type Favorite = z.infer<typeof favoriteSchema>;
export type AddFavorite = z.infer<typeof addFavoriteSchema>;
export type FavoritesResponse = z.infer<typeof favoritesResponseSchema>;
export type FavoriteResponse = z.infer<typeof favoriteResponseSchema>;
export type CheckFavoriteResponse = z.infer<typeof checkFavoriteResponseSchema>;

