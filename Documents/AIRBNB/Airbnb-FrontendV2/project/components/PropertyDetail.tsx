'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { propertyService, type Property, getLocationString } from '@/lib/api/properties';
import { useFavorites } from '@/context/FavoritesContext';
import PropertyGallery from './PropertyGallery';
import HostInfo from './HostInfo';
import ReservationSidebar from './ReservationSidebar';
import PropertyReviews from './PropertyReviews';
import { reviewService } from '@/lib/api/reviews';
import { updateAllPropertyPreviews } from '@/lib/utils/propertyRatings';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyDetailProps {
  propertyId: string;
}

const PropertyDetail = ({ propertyId }: PropertyDetailProps) => {
  const router = useRouter();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [propertyRating, setPropertyRating] = useState(0);
  const [propertyReviewCount, setPropertyReviewCount] = useState(0);

  // Verificar si está en favoritos
  const isInFavorites = property ? isFavorite(property.id) : false;

  // Función para manejar el toggle de favoritos
  const handleFavoriteClick = async () => {
    if (!property || isToggling) return;

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

  // Función para cargar estadísticas de reviews
  const loadPropertyStats = async () => {
    try {
      const stats = await reviewService.getPropertyStats(propertyId);
      setPropertyRating(stats.averageRating);
      setPropertyReviewCount(stats.totalReviews);
      
      // Actualizar también en el objeto property si existe
      if (property) {
        setProperty({
          ...property,
          rating: stats.averageRating,
          reviewCount: stats.totalReviews,
        });
      }
    } catch (error) {
      console.error('💥 [PropertyDetail] Error cargando estadísticas:', error);
    }
  };

  // Función para manejar actualización de rating desde PropertyReviews
  const handleRatingUpdate = (rating: number, reviewCount: number) => {
    setPropertyRating(rating);
    setPropertyReviewCount(reviewCount);
    
    // Actualizar también en el objeto property
    if (property) {
      setProperty({
        ...property,
        rating,
        reviewCount,
      });
    }
    
    // Actualizar todas las tarjetas/previews de esta propiedad en la página
    // Según la guía: "Actualizar en previews/tarjetas de propiedad"
    updateAllPropertyPreviews(propertyId, {
      averageRating: rating,
      totalReviews: reviewCount,
    });
  };

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const propertyData = await propertyService.getPropertyById(propertyId);
        
        if (propertyData) {
          setProperty(propertyData);
          console.log('✅ [PropertyDetail] Propiedad cargada:', propertyData.title);
          
          // Cargar estadísticas de reviews actualizadas
          await loadPropertyStats();
        } else {
          setError('Propiedad no encontrada');
          console.log('❌ [PropertyDetail] Propiedad no encontrada:', propertyId);
        }
      } catch (error) {
        console.error('💥 [PropertyDetail] Error cargando propiedad:', error);
        setError('Error cargando la propiedad');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Propiedad no encontrada'}
          </h1>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a resultados
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1" data-property-rating>
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{propertyRating > 0 ? propertyRating.toFixed(1) : property.rating}</span>
                <span data-property-review-count>
                  ({propertyReviewCount > 0 ? propertyReviewCount : property.reviewCount} {propertyReviewCount === 1 || property.reviewCount === 1 ? 'reseña' : 'reseñas'})
                </span>
              </span>
              <span>•</span>
              <span>{getLocationString(property.location)}</span>
            </div>
          </div>
          
          {/* Botón de favoritos */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleFavoriteClick}
            disabled={isToggling}
            className="ml-4 flex items-center gap-2 border-2 hover:border-[#FF385C] transition-colors"
            title={isInFavorites ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isInFavorites
                  ? 'fill-[#FF385C] text-[#FF385C]'
                  : 'text-gray-600 group-hover:text-[#FF385C]'
              }`}
            />
            <span className="hidden sm:inline">
              {isInFavorites ? 'En favoritos' : 'Guardar'}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PropertyGallery 
            images={
              property.images && property.images.length > 0
                ? property.images
                : property.imageUrl
                  ? [property.imageUrl]
                  : []
            } 
            title={property.title} 
          />
          <HostInfo 
            host={property.host} 
            hostId={(property as any).hostId || (property.host as any)?.id}
            description={property.description}
            amenities={property.amenities}
          />
          {/* Componente de Reviews */}
          <PropertyReviews 
            propertyId={propertyId}
            propertyRating={propertyRating}
            hostId={(property as any).hostId || (property.host as any)?.id}
            onRatingUpdate={handleRatingUpdate}
          />
        </div>
        <div className="lg:col-span-1">
          <ReservationSidebar property={property} />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
