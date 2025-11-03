'use client';

import { useEffect, useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import { propertyService, type Property } from '@/lib/api/properties';
import { Heart, Loader2, Trash2, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { getLocationString } from '@/lib/api/properties';

/**
 * Página de Favoritos
 * Muestra todas las propiedades que el usuario ha marcado como favoritas
 */
export default function FavoritesPage() {
  const { favorites, isLoading, error, removeFromFavorites, refreshFavorites } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const router = useRouter();

  // Cargar propiedades de los favoritos
  useEffect(() => {
    const loadFavoriteProperties = async () => {
      if (favorites.length === 0) {
        setProperties([]);
        setPropertiesLoading(false);
        return;
      }

      setPropertiesLoading(true);
      try {
        // Obtener información de cada propiedad favorita
        const propertyPromises = favorites.map((favorite) =>
          propertyService.getPropertyById(favorite.propertyId).catch(() => null)
        );

        const propertyResults = await Promise.all(propertyPromises);
        const validProperties = propertyResults.filter(
          (prop): prop is Property => prop !== null
        );

        setProperties(validProperties);
      } catch (error) {
        console.error('Error cargando propiedades favoritas:', error);
        setProperties([]);
      } finally {
        setPropertiesLoading(false);
      }
    };

    loadFavoriteProperties();
  }, [favorites]);

  // Función para eliminar de favoritos
  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await removeFromFavorites(propertyId);
      // Refrescar la lista
      await refreshFavorites();
    } catch (error) {
      console.error('Error eliminando favorito:', error);
    }
  };

  // Función para navegar al detalle
  const handlePropertyClick = (propertyId: string) => {
    router.push(`/detail/${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Heart className="h-8 w-8 text-[#FF385C] fill-[#FF385C]" />
            Mis Favoritos
          </h1>
          <p className="text-slate-400">
            {favorites.length === 0
              ? 'Aún no tienes propiedades favoritas'
              : `Tienes ${favorites.length} propiedad${favorites.length !== 1 ? 'es' : ''} favorita${favorites.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Loading state */}
        {(isLoading || propertiesLoading) && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF385C]" />
            <span className="ml-3 text-slate-300">Cargando favoritos...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !propertiesLoading && favorites.length === 0 && (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No hay favoritos aún</h2>
            <p className="text-slate-400 mb-6">
              Explora nuestras propiedades y guarda tus favoritas haciendo clic en el corazón
            </p>
            <Link href="/">
              <Button className="bg-[#FF385C] hover:bg-[#E31C5F] text-white">
                Explorar Propiedades
              </Button>
            </Link>
          </div>
        )}

        {/* Lista de propiedades favoritas */}
        {!isLoading && !propertiesLoading && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => {
              const favorite = favorites.find((fav) => fav.propertyId === property.id);
              const locationString = getLocationString(property.location) || property.city || '';

              return (
                <div
                  key={property.id}
                  className="bg-slate-800 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer group"
                  onClick={() => handlePropertyClick(property.id)}
                >
                  {/* Imagen */}
                  <div className="relative h-48 bg-gray-700">
                    <img
                      src={property.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                      }}
                      loading="lazy"
                    />

                    {/* Botón eliminar de favoritos */}
                    <div
                      className="absolute top-3 right-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(property.id);
                      }}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/60 hover:bg-black/80 backdrop-blur-sm border-none"
                        title="Quitar de favoritos"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>

                    {/* Badge de favorito */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-[#FF385C] text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-white" />
                        Favorito
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    {/* Título y ubicación */}
                    <div className="mb-2">
                      <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{locationString}</span>
                      </div>
                    </div>

                    {/* Rating */}
                    {property.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white text-sm font-medium">{property.rating}</span>
                        {property.reviewCount && (
                          <span className="text-slate-400 text-sm">({property.reviewCount})</span>
                        )}
                      </div>
                    )}

                    {/* Precio */}
                    <div className="flex items-baseline justify-between mt-4">
                      <div>
                        <span className="text-white font-bold text-lg">
                          ${property.pricePerNight}
                        </span>
                        <span className="text-slate-400 text-sm ml-1">noche</span>
                      </div>
                    </div>

                    {/* Fecha agregado */}
                    {favorite?.createdAt && (
                      <p className="text-slate-500 text-xs mt-2">
                        Agregado el {new Date(favorite.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mensaje si algunas propiedades no se pudieron cargar */}
        {!isLoading && !propertiesLoading && properties.length < favorites.length && (
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg text-yellow-300">
            Algunas propiedades favoritas no pudieron cargarse. Puede que hayan sido eliminadas.
          </div>
        )}
      </div>
    </div>
  );
}

