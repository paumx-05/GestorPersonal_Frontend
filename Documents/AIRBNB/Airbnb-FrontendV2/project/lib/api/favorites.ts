/**
 * Servicios de API para favoritos - Conecta con el backend real
 * Gestiona los favoritos del usuario (agregar, eliminar, listar)
 */

import { apiClient } from './config';
import type {
  Favorite,
  AddFavorite,
  FavoritesResponse,
  FavoriteResponse,
  CheckFavoriteResponse,
} from '@/schemas/favorites';
import {
  favoritesResponseSchema,
  favoriteResponseSchema,
  checkFavoriteResponseSchema,
  addFavoriteSchema,
} from '@/schemas/favorites';

/**
 * Servicios de favoritos que se conectan al backend real
 */
export const favoritesService = {
  /**
   * Obtener todos los favoritos del usuario autenticado
   * GET /api/favorites
   */
  async getFavorites(): Promise<Favorite[]> {
    try {
      console.log('🔍 [favoritesService] Obteniendo favoritos...');
      console.log('🔍 [favoritesService] Token disponible:', apiClient.getAuthToken() ? 'SÍ' : 'NO');

      const response = await apiClient.get<FavoritesResponse>('/api/favorites');

      console.log('🔍 [favoritesService] Respuesta completa del backend:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        // Validar respuesta con Zod
        const validatedData = favoritesResponseSchema.parse(response);

        console.log('✅ [favoritesService] Favoritos obtenidos:', validatedData.data.favorites.length, 'favoritos');
        console.log('📦 [favoritesService] Favoritos:', JSON.stringify(validatedData.data.favorites, null, 2));
        return validatedData.data.favorites;
      } else {
        console.warn('⚠️ [favoritesService] Respuesta sin favoritos:', response);
        // Si la respuesta no tiene la estructura esperada, retornar array vacío
        // pero también verificar si hay favoritos directamente en response
        if (response.data && Array.isArray(response.data)) {
          console.log('⚠️ [favoritesService] Encontrados favoritos en response.data directo');
          return response.data;
        }
        return [];
      }
    } catch (error) {
      console.error('💥 [favoritesService] Error obteniendo favoritos:', error);
      console.error(
        '💥 [favoritesService] Error details:',
        error instanceof Error ? error.message : String(error)
      );

      // Si el endpoint no existe (404), retornar array vacío
      if (error instanceof Error && error.message.includes('404')) {
        console.log('⚠️ [favoritesService] Endpoint /api/favorites no disponible, usando array vacío');
        return [];
      }

      throw error;
    }
  },

  /**
   * Agregar una propiedad a favoritos
   * POST /api/favorites/add
   * 
   * El backend espera: { propertyId: string }
   */
  async addToFavorites(propertyId: string): Promise<Favorite> {
    try {
      console.log('🔍 [favoritesService] Agregando favorito...');

      // Validar primero con Zod
      const validatedData = addFavoriteSchema.parse({ propertyId });

      const requestData = {
        propertyId: validatedData.propertyId,
      };

      console.log('🔍 [favoritesService] Request data:', JSON.stringify(requestData, null, 2));
      const token = apiClient.getAuthToken();
      console.log('🔍 [favoritesService] Token disponible:', token ? 'SÍ' : 'NO');
      if (token) {
        console.log('🔍 [favoritesService] Token (primeros 30 chars):', token.substring(0, 30) + '...');
      }

      const response = await apiClient.post<FavoriteResponse>('/api/favorites/add', requestData);

      console.log('🔍 [favoritesService] Respuesta completa del backend:', JSON.stringify(response, null, 2));

      if (response.success) {
        // Intentar validar con Zod
        try {
          const validatedData = favoriteResponseSchema.parse(response);

          if (validatedData.data?.favorite) {
            console.log('✅ [favoritesService] Favorito agregado:', validatedData.data.favorite.id);
            return validatedData.data.favorite;
          }
        } catch (validationError) {
          console.warn('⚠️ [favoritesService] Error validando con Zod, intentando estructura alternativa:', validationError);
        }

        // Si la estructura de Zod falla, intentar acceder directamente
        if (response.data?.favorite) {
          console.log('✅ [favoritesService] Favorito agregado (estructura directa):', response.data.favorite.id);
          return response.data.favorite;
        }

        // Si response.data es directamente el favorito
        if (response.data && typeof response.data === 'object' && 'propertyId' in response.data) {
          console.log('✅ [favoritesService] Favorito agregado (data directo):', response.data);
          return response.data as Favorite;
        }

        console.error('❌ [favoritesService] Respuesta sin estructura de favorito esperada:', response);
        throw new Error(response.message || 'La respuesta del servidor no incluye el favorito');
      } else {
        console.error('❌ [favoritesService] Respuesta sin éxito:', response);
        throw new Error(response.message || 'Error agregando favorito');
      }
    } catch (error) {
      console.error('💥 [favoritesService] Error agregando favorito:', error);
      console.error(
        '💥 [favoritesService] Error details:',
        error instanceof Error ? error.message : String(error)
      );

      // Si el endpoint no existe, lanzar error pero no fallar silenciosamente
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(
          'Endpoint /api/favorites/add no disponible. Verifica en Postman si el endpoint está implementado.'
        );
      }

      throw error;
    }
  },

  /**
   * Eliminar una propiedad de favoritos
   * DELETE /api/favorites/remove/:propertyId
   */
  async removeFromFavorites(propertyId: string): Promise<void> {
    try {
      console.log('🔍 [favoritesService] Eliminando favorito:', propertyId);
      console.log('🔍 [favoritesService] Token disponible:', apiClient.getAuthToken() ? 'SÍ' : 'NO');

      const response = await apiClient.delete<{ success: boolean; message?: string }>(
        `/api/favorites/remove/${propertyId}`
      );

      console.log('🔍 [favoritesService] Respuesta completa del backend:', JSON.stringify(response, null, 2));

      if (response.success) {
        console.log('✅ [favoritesService] Favorito eliminado:', propertyId);
      } else {
        console.error('❌ [favoritesService] Respuesta sin éxito:', response);
        throw new Error(response.message || 'Error eliminando favorito');
      }
    } catch (error) {
      console.error('💥 [favoritesService] Error eliminando favorito:', error);
      console.error(
        '💥 [favoritesService] Error details:',
        error instanceof Error ? error.message : String(error)
      );

      // Si el endpoint no existe, lanzar error pero no fallar silenciosamente
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(
          'Endpoint /api/favorites/remove/:propertyId no disponible. Verifica en Postman si el endpoint está implementado.'
        );
      }

      throw error;
    }
  },

  /**
   * Verificar si una propiedad está en favoritos
   * GET /api/favorites/check/:propertyId
   */
  async isFavorite(propertyId: string): Promise<boolean> {
    try {
      console.log('🔍 [favoritesService] Verificando si es favorito:', propertyId);

      const response = await apiClient.get<CheckFavoriteResponse>(`/api/favorites/check/${propertyId}`);

      if (response.success && response.data) {
        // Validar respuesta con Zod
        const validatedData = checkFavoriteResponseSchema.parse(response);
        return validatedData.data.isFavorite;
      }

      return false;
    } catch (error) {
      console.warn('⚠️ [favoritesService] Error verificando favorito, asumiendo false:', error);
      // Si el endpoint no existe o hay error, retornar false
      return false;
    }
  },
};

