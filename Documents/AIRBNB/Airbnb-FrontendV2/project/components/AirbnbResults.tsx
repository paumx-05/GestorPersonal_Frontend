'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type Property, getLocationString } from '@/lib/api/properties';
import { useSearch } from '@/context/SearchContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Heart } from 'lucide-react';
import { getRealPropertyRating } from '@/lib/utils/propertyRatings';
import { getPropertyPreviewImage } from '@/lib/utils/propertyImages';

// Componente para mostrar una tarjeta de propiedad individual
const PropertyCard = ({ property }: { property: Property }) => {
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
        const realData = await getRealPropertyRating(property.id);

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
        console.error('💥 [AirbnbResults PropertyCard] Error obteniendo rating real:', error);
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
  }, [property.id]);

  // Usar datos reales si están disponibles, sino usar 0
  const rating = realRating !== null ? realRating : 0;
  const reviewCount = realReviewCount !== null ? realReviewCount : 0;

  // Verificar si está en favoritos
  const isInFavorites = isFavorite(property.id);

  // Función para navegar al detalle de la propiedad
  const handleCardClick = () => {
    router.push(`/detail/${property.id}`);
  };

  // Función para manejar el toggle de favoritos
  const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Evitar que se active la navegación

    if (isToggling) return;

    setIsToggling(true);
    try {
      if (isInFavorites) {
        await removeFromFavorites(property.id);
      } else {
        await addToFavorites(property.id);
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
      data-property-id={property.id}
    >
      {/* Imagen de la propiedad */}
      <div className="relative h-40 sm:h-48 bg-gray-200">
        <img
          src={getPropertyPreviewImage(property.id, property.images, property.imageUrl)}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Si la imagen falla al cargar, usar una imagen por defecto
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
          }}
          loading="lazy"
        />
        
        {/* Botón de favoritos */}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg hover:scale-110 transition-all duration-200 z-10"
          onClick={handleFavoriteClick}
          disabled={isToggling}
          title={isInFavorites ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isInFavorites
                ? 'fill-[#FF385C] text-[#FF385C]'
                : 'text-gray-700 hover:text-[#FF385C]'
            }`}
          />
        </button>

        {property.instantBook && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            Reserva instantánea
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-3 sm:p-4">
        {/* Ubicación y tipo */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-gray-600">{getLocationString(property.location)}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 capitalize">
              {property.propertyType === 'entire' ? 'Casa completa' : 
               property.propertyType === 'private' ? 'Habitación privada' : 
               'Habitación compartida'}
            </span>
            {property.host?.isSuperhost && (
              <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">
                Superhost
              </span>
            )}
          </div>
        </div>

        {/* Título */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
          {property.title}
        </h3>

        {/* Amenidades destacadas */}
        <div className="flex flex-wrap gap-1 mb-3">
          {property.amenities.slice(0, 2).map((amenity) => (
            <span
              key={amenity}
              className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
            >
              {amenity}
            </span>
          ))}
          {property.amenities.length > 2 && (
            <span className="text-xs text-gray-500">
              +{property.amenities.length - 2} más
            </span>
          )}
        </div>

        {/* Rating y precio */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium" data-property-rating>
              {loadingRating ? '...' : rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500" data-property-review-count>
              ({loadingRating ? '...' : reviewCount})
            </span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-gray-900">${property.pricePerNight}</span>
            <span className="text-sm text-gray-500">/noche</span>
            <div className="text-xs text-gray-500">Hasta {property.maxGuests} huéspedes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal de resultados Airbnb
const AirbnbResults = () => {
  // Usar el contexto de búsqueda
  const { filteredProperties, isSearching } = useSearch();

  // Función para renderizar las estrellas de rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="w-full">
      {/* Header con información de resultados */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
          Alojamientos disponibles
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {isSearching ? 'Buscando alojamientos...' : `${filteredProperties.length} alojamientos encontrados`}
        </p>
      </div>

      {/* Indicador de carga */}
      {isSearching && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-2 text-gray-600">Buscando alojamientos...</span>
        </div>
      )}

      {/* Grid de resultados */}
      {!isSearching && (
        <>
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron alojamientos
              </h3>
              <p className="text-gray-600">
                Intenta ajustar tus filtros de búsqueda para encontrar más opciones.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {(() => {
                // 🔧 FIX CRÍTICO: Eliminar duplicados y loggear para debugging
                const seenIds = new Set<string>();
                const uniqueProps = filteredProperties.filter((property) => {
                  if (seenIds.has(property.id)) {
                    console.error(`❌ [AirbnbResults] DUPLICADO EN RENDERIZADO: ID=${property.id}, Título="${property.title}"`);
                    return false;
                  }
                  seenIds.add(property.id);
                  return true;
                });
                
                if (filteredProperties.length !== uniqueProps.length) {
                  console.error(`❌ [AirbnbResults] ERROR CRÍTICO: ${filteredProperties.length - uniqueProps.length} duplicados detectados al renderizar`);
                  console.error(`❌ [AirbnbResults] IDs únicos esperados: ${filteredProperties.length}, IDs únicos encontrados: ${uniqueProps.length}`);
                }
                
                return uniqueProps.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ));
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AirbnbResults;
