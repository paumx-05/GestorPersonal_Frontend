'use client';

import { useState } from 'react';
import { useSearch } from '@/context/SearchContext';

// Interfaz para los filtros Airbnb
interface AirbnbFilters {
  propertyType: 'entire' | 'private' | 'shared' | '';
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  minRating: number;
  instantBook: boolean;
}

// Componente de filtros específicos para Airbnb
const AirbnbFilters = () => {
  // Usar el contexto de búsqueda
  const { filters, setFilters, clearFilters } = useSearch();

  // Opciones de amenidades disponibles
  const availableAmenities = [
    'WiFi', 'Cocina', 'Piscina', 'Aire acondicionado', 'Calefacción',
    'Lavadora', 'Secadora', 'Estacionamiento', 'Terraza', 'Balcón',
    'Jardín', 'Chimenea', 'TV', 'Netflix', 'Gimnasio'
  ];

  // Función para manejar cambios en los filtros
  const handleFilterChange = (field: keyof AirbnbFilters, value: any) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  // Función para manejar amenidades (toggle)
  const toggleAmenity = (amenity: string) => {
    setFilters({
      ...filters,
      amenities: filters.amenities.includes(amenity)
        ? filters.amenities.filter(a => a !== amenity)
        : [...filters.amenities, amenity]
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Filtro por Tipo de Alojamiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de alojamiento
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Todos los tipos</option>
            <option value="entire">Casa completa</option>
            <option value="private">Habitación privada</option>
            <option value="shared">Habitación compartida</option>
          </select>
        </div>

        {/* Filtro por Rango de Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio por noche
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Mín"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <input
              type="number"
              placeholder="Máx"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Filtro por Calificación Mínima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación mínima
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value={0}>Cualquier calificación</option>
            <option value={4}>4+ estrellas</option>
            <option value={4.5}>4.5+ estrellas</option>
            <option value={4.8}>4.8+ estrellas</option>
          </select>
        </div>

        {/* Filtro de Reserva Instantánea */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="instantBook"
            checked={filters.instantBook}
            onChange={(e) => handleFilterChange('instantBook', e.target.checked)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="instantBook" className="ml-2 text-sm text-gray-700">
            Reserva instantánea
          </label>
        </div>
      </div>

      {/* Sección de Amenidades */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Amenidades
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {availableAmenities.map((amenity) => (
            <label key={amenity} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Información de filtros activos */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Filtros activos:</strong> {
            [
              filters.propertyType && `Tipo: ${filters.propertyType}`,
              filters.minPrice > 0 && `Precio: $${filters.minPrice}+`,
              filters.maxPrice < 1000 && `Precio: $${filters.maxPrice}-`,
              filters.minRating > 0 && `${filters.minRating}+ estrellas`,
              filters.instantBook && 'Reserva instantánea',
              filters.amenities.length > 0 && `${filters.amenities.length} amenidades`
            ].filter(Boolean).join(', ') || 'Ninguno'
          }
        </p>
      </div>
    </div>
  );
};

export default AirbnbFilters;
