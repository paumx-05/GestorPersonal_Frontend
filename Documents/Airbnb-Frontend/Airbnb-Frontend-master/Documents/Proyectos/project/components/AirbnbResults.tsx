'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type AirbnbProperty } from '@/lib/mockData';
import { useSearch } from '@/context/SearchContext';

// Componente para mostrar una tarjeta de propiedad individual
const PropertyCard = ({ property }: { property: AirbnbProperty }) => {
  const router = useRouter();

  // Función para navegar al detalle de la propiedad
  const handleCardClick = () => {
    router.push(`/detail/${property.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Imagen de la propiedad */}
      <div className="relative h-48">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        {property.instantBook && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            Reserva instantánea
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4">
        {/* Ubicación y tipo */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-gray-600">{property.location}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 capitalize">
              {property.propertyType === 'entire' ? 'Casa completa' : 
               property.propertyType === 'private' ? 'Habitación privada' : 
               'Habitación compartida'}
            </span>
            {property.host.isSuperhost && (
              <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">
                Superhost
              </span>
            )}
          </div>
        </div>

        {/* Título */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>

        {/* Amenidades destacadas */}
        <div className="flex flex-wrap gap-1 mb-3">
          {property.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-xs text-gray-500">
              +{property.amenities.length - 3} más
            </span>
          )}
        </div>

        {/* Rating y precio */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">{property.rating}</span>
            <span className="text-sm text-gray-500">({property.reviewCount})</span>
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Alojamientos disponibles
        </h2>
        <p className="text-gray-600">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AirbnbResults;
