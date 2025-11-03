/**
 * Utilidades para obtener ratings y reviewCount reales de propiedades
 * Obtiene los datos reales desde el endpoint de reviews en lugar de usar datos mock
 */

import { reviewService } from '@/lib/api/reviews';

// Cache para evitar múltiples peticiones para la misma propiedad
const ratingCache = new Map<string, { rating: number; reviewCount: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene el rating y reviewCount real de una propiedad desde el endpoint de reviews
 * Usa cache para evitar múltiples peticiones
 * 
 * @param propertyId - ID de la propiedad
 * @returns Promise con rating y reviewCount reales, o null si hay error
 */
export async function getRealPropertyRating(
  propertyId: string
): Promise<{ rating: number; reviewCount: number } | null> {
  try {
    // Verificar cache
    const cached = ratingCache.get(propertyId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 [getRealPropertyRating] Usando cache para propiedad ${propertyId}`);
      return { rating: cached.rating, reviewCount: cached.reviewCount };
    }

    // Obtener datos reales desde el endpoint de reviews
    const response = await reviewService.getReviews(propertyId, {
      page: 1,
      limit: 1, // Solo necesitamos los metadatos (total, averageRating)
    });

    if (response.success && response.data) {
      const rating = response.data.averageRating || 0;
      const reviewCount = response.data.total || 0;

      // Guardar en cache
      ratingCache.set(propertyId, {
        rating,
        reviewCount,
        timestamp: Date.now(),
      });

      console.log(`✅ [getRealPropertyRating] Rating real obtenido para ${propertyId}: ${rating} (${reviewCount} reseñas)`);
      return { rating, reviewCount };
    }

    return null;
  } catch (error) {
    console.error(`💥 [getRealPropertyRating] Error obteniendo rating para ${propertyId}:`, error);
    return null;
  }
}

/**
 * Limpia el cache de ratings
 * Útil cuando se crea una nueva review
 */
export function clearRatingCache(propertyId?: string) {
  if (propertyId) {
    ratingCache.delete(propertyId);
    console.log(`🗑️ [clearRatingCache] Cache limpiado para propiedad ${propertyId}`);
  } else {
    ratingCache.clear();
    console.log(`🗑️ [clearRatingCache] Cache limpiado completamente`);
  }
}

