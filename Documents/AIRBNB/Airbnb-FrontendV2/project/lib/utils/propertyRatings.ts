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
 * Actualiza todas las tarjetas/previews de una propiedad en la página
 * Según la guía: debe actualizar rating y reviewCount en todos los previews
 * 
 * @param propertyId - ID de la propiedad
 * @param stats - Estadísticas actualizadas { averageRating, totalReviews }
 */
export function updateAllPropertyPreviews(
  propertyId: string, 
  stats: { averageRating: number; totalReviews: number }
): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Buscar todas las instancias de esta propiedad en la página
    const propertyCards = document.querySelectorAll(
      `[data-property-id="${propertyId}"]`
    );
    
    propertyCards.forEach(card => {
      // Actualizar rating en el preview
      const ratingEl = card.querySelector('[data-property-rating]');
      if (ratingEl) {
        ratingEl.textContent = stats.averageRating > 0 
          ? stats.averageRating.toFixed(1) 
          : '0.0';
      }
      
      // Actualizar número de reviews en el preview
      const reviewCountEl = card.querySelector('[data-property-review-count]');
      if (reviewCountEl) {
        reviewCountEl.textContent = `(${stats.totalReviews})`;
      } else if (stats.totalReviews > 0) {
        // Si no existe el elemento pero hay reviews, intentar agregarlo
        const ratingEl = card.querySelector('[data-property-rating]');
        if (ratingEl && ratingEl.parentElement) {
          const countSpan = document.createElement('span');
          countSpan.className = 'text-white/70 text-xs ml-1';
          countSpan.setAttribute('data-property-review-count', '');
          countSpan.textContent = `(${stats.totalReviews})`;
          ratingEl.parentElement.appendChild(countSpan);
        }
      }
    });
    
    console.log(`✅ [updateAllPropertyPreviews] Actualizadas ${propertyCards.length} tarjetas de propiedad ${propertyId}`);
  } catch (error) {
    console.error('💥 [updateAllPropertyPreviews] Error actualizando previews:', error);
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

