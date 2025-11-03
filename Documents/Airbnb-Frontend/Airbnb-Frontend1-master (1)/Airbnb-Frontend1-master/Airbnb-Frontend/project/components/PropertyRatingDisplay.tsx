'use client';

import { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { getRealPropertyRating } from '@/lib/utils/propertyRatings';

interface PropertyRatingDisplayProps {
  propertyId: string;
  defaultRating?: number;
  defaultReviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

/**
 * Componente que muestra el rating y reviewCount real de una propiedad
 * Obtiene los datos reales desde el endpoint de reviews
 */
export default function PropertyRatingDisplay({
  propertyId,
  defaultRating = 0,
  defaultReviewCount = 0,
  size = 'md',
  showText = true,
  className = '',
}: PropertyRatingDisplayProps) {
  const [realRating, setRealRating] = useState<number | null>(null);
  const [realReviewCount, setRealReviewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener rating y reviewCount reales desde el endpoint de reviews
  useEffect(() => {
    let cancelled = false;

    const fetchRealRating = async () => {
      try {
        setLoading(true);
        const realData = await getRealPropertyRating(propertyId);

        if (!cancelled && realData) {
          setRealRating(realData.rating);
          setRealReviewCount(realData.reviewCount);
        } else if (!cancelled) {
          // Si no hay datos reales, usar los por defecto
          setRealRating(defaultRating);
          setRealReviewCount(defaultReviewCount);
        }
      } catch (error) {
        console.error('💥 [PropertyRatingDisplay] Error obteniendo rating real:', error);
        if (!cancelled) {
          setRealRating(defaultRating);
          setRealReviewCount(defaultReviewCount);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRealRating();

    return () => {
      cancelled = true;
    };
  }, [propertyId, defaultRating, defaultReviewCount]);

  // Usar datos reales si están disponibles, sino usar los por defecto
  const rating = realRating !== null ? realRating : defaultRating;
  const reviewCount = realReviewCount !== null ? realReviewCount : defaultReviewCount;

  // Tamaños de estrellas según el prop size
  const starSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-sm';

  // Generar estrellas
  const stars = [];
  
  // Si no hay rating, mostrar una estrella vacía
  if (rating === 0) {
    stars.push(
      <Star key={0} className={`${starSize} text-gray-300`} />
    );
  } else {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className={`${starSize} fill-yellow-400 text-yellow-400`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarHalf key={i} className={`${starSize} fill-yellow-400 text-yellow-400`} />
        );
      } else {
        stars.push(
          <Star key={i} className={`${starSize} text-gray-300`} />
        );
      }
    }
  }

  // Determinar colores según el className proporcionado
  const isDarkBackground = className.includes('text-white') || className.includes('text-slate');
  const textColor = isDarkBackground ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = isDarkBackground ? 'text-slate-400' : 'text-gray-500';
  const loadingColor = isDarkBackground ? 'text-slate-400' : 'text-gray-400';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5">
        {stars}
      </div>
      {showText && (
        <>
          {loading ? (
            <span className={`${textSize} ${loadingColor}`}>Cargando...</span>
          ) : (
            <>
              <span className={`${textSize} font-medium ${textColor}`}>
                {rating > 0 ? rating.toFixed(1) : 'Nuevo'}
              </span>
              <span className={`${textSize} ${secondaryTextColor}`}>
                ({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})
              </span>
            </>
          )}
        </>
      )}
    </div>
  );
}

