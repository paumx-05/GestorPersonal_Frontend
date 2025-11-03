'use client';

import { useState, useEffect } from 'react';
import { Heart, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/context/FavoritesContext';
import { getRealPropertyRating } from '@/lib/utils/propertyRatings';

/**
 * Property Card Component - Card de propiedad siguiendo diseño de referencia
 * Según la guía: debe tener atributos data-property-id, data-property-rating, data-property-review-count
 * para permitir actualización de estadísticas después de crear/editar/eliminar reviews
 */

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount?: number;
  image: string;
  guests?: number;
  description: string;
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  rating: defaultRating,
  reviewCount: defaultReviewCount = 0,
  image,
  guests,
  description
}: PropertyCardProps) {
  const router = useRouter();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  
  // Estados para ratings y reviews reales desde el endpoint
  const [realRating, setRealRating] = useState<number | null>(null);
  const [realReviewCount, setRealReviewCount] = useState<number | null>(null);
  const [loadingRating, setLoadingRating] = useState(true);

  // Obtener ratings y reviews reales desde el endpoint
  useEffect(() => {
    let cancelled = false;

    const fetchRealRating = async () => {
      try {
        setLoadingRating(true);
        const realData = await getRealPropertyRating(id);

        if (!cancelled) {
          if (realData) {
            setRealRating(realData.rating);
            setRealReviewCount(realData.reviewCount);
          } else {
            // Si no hay datos reales, usar 0 para rating y reviewCount
            setRealRating(0);
            setRealReviewCount(0);
          }
        }
      } catch (error) {
        console.error('💥 [PropertyCard] Error obteniendo rating real:', error);
        if (!cancelled) {
          setRealRating(0);
          setRealReviewCount(0);
        }
      } finally {
        if (!cancelled) {
          setLoadingRating(false);
        }
      }
    };

    fetchRealRating();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Usar datos reales si están disponibles, sino usar 0
  const rating = realRating !== null ? realRating : 0;
  const reviewCount = realReviewCount !== null ? realReviewCount : 0;

  // Verificar si está en favoritos
  const isInFavorites = isFavorite(id);

  // Función para navegar al detalle de la propiedad
  const handleCardClick = () => {
    router.push(`/detail/${id}`);
  };

  // Función para manejar el toggle de favoritos
  const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Evitar que se active la navegación
    
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      if (isInFavorites) {
        await removeFromFavorites(id);
      } else {
        await addToFavorites(id);
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div 
      className="group cursor-pointer" 
      onClick={handleCardClick}
      data-property-id={id}
    >
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Wishlist button */}
        <button 
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform duration-200 bg-black/20 hover:bg-black/40"
          onClick={handleFavoriteClick}
          disabled={isToggling}
          title={isInFavorites ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart 
            className={`h-5 w-5 drop-shadow-lg transition-colors duration-200 ${
              isInFavorites 
                ? 'fill-[#FF385C] text-[#FF385C]' 
                : 'text-white hover:fill-[#FF385C] hover:text-[#FF385C]'
            }`} 
          />
        </button>

        {/* Image indicators */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i === 0 ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Location and Rating */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium text-sm truncate flex-1 mr-2">
            {title}
          </h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star className="h-3 w-3 fill-white text-white" />
            <span 
              className="text-white text-sm font-medium" 
              data-property-rating
            >
              {loadingRating ? '...' : rating.toFixed(1)}
            </span>
            <span 
              className="text-white/70 text-xs ml-1" 
              data-property-review-count
            >
              ({loadingRating ? '...' : reviewCount})
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm">
          {description}
        </p>

        {/* Guests info */}
        {guests && (
          <p className="text-slate-400 text-sm">
            {guests}-10 pers.
          </p>
        )}

        {/* Price */}
        <div className="pt-1">
          <span className="text-white font-semibold">${price}</span>
          <span className="text-slate-400 text-sm"> total before taxes</span>
        </div>
      </div>
    </div>
  );
}