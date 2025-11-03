'use client';

import { useState } from 'react';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useSearch } from '@/context/SearchContext';

// Interfaz para los datos de búsqueda Airbnb
interface SearchData {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

// Componente principal de búsqueda estilo Airbnb
const AirbnbSearchModule = () => {
  // Usar el contexto de búsqueda
  const { searchData, setSearchData, isSearching, performSearch } = useSearch();

  // Estados para manejar la UI de sugerencias
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Hook para búsqueda de ubicaciones en tiempo real
  const { suggestions, isLoading: isLoadingSuggestions, clearSuggestions } = useLocationSearch(searchData.location);

  // Función para manejar cambios en los campos
  const handleInputChange = (field: keyof SearchData, value: string | number) => {
    setSearchData({
      ...searchData,
      [field]: value
    });

    // Mostrar sugerencias cuando se escribe en el campo de ubicación
    if (field === 'location') {
      setShowSuggestions(true);
    }
  };

  // Función para seleccionar una sugerencia de ubicación
  const handleLocationSelect = (location: string) => {
    setSearchData({
      ...searchData,
      location: location
    });
    setShowSuggestions(false);
    clearSuggestions();
  };

  // Función para manejar el foco en el campo de ubicación
  const handleLocationFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Función para manejar el blur del campo de ubicación
  const handleLocationBlur = () => {
    // Delay para permitir que se ejecute el click en las sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Función para manejar la búsqueda
  const handleSearch = () => {
    setShowSuggestions(false);
    performSearch();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 overflow-hidden mx-2 md:mx-auto">
      {/* Contenedor principal del buscador */}
      <div className="flex flex-col md:flex-row">
        
        {/* Campo de Ubicación con Sugerencias */}
        <div className="flex-1 border-r-0 md:border-r border-gray-200 p-3 md:p-4 hover:bg-gray-50 transition-colors relative">
          <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
            ¿A dónde vas?
          </label>
          <input
            type="text"
            value={searchData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            onFocus={handleLocationFocus}
            onBlur={handleLocationBlur}
            placeholder="Buscar destinos"
            className="w-full text-sm md:text-lg border-none outline-none bg-transparent placeholder-gray-500"
          />
          
          {/* Indicador de carga para sugerencias */}
          {isLoadingSuggestions && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
            </div>
          )}

          {/* Dropdown de Sugerencias */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(suggestion.name)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{suggestion.name}</div>
                  <div className="text-sm text-gray-500">{suggestion.country}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Campo de Fechas */}
        <div className="flex-1 border-r-0 md:border-r border-gray-200 p-3 md:p-4 hover:bg-gray-50 transition-colors">
          <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={searchData.checkIn}
            onChange={(e) => handleInputChange('checkIn', e.target.value)}
            className="w-full text-sm md:text-lg border-none outline-none bg-transparent text-gray-700"
          />
        </div>

        <div className="flex-1 border-r-0 md:border-r border-gray-200 p-3 md:p-4 hover:bg-gray-50 transition-colors">
          <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={searchData.checkOut}
            onChange={(e) => handleInputChange('checkOut', e.target.value)}
            className="w-full text-sm md:text-lg border-none outline-none bg-transparent text-gray-700"
          />
        </div>

        {/* Campo de Huéspedes */}
        <div className="flex-1 border-r-0 md:border-r border-gray-200 p-3 md:p-4 hover:bg-gray-50 transition-colors">
          <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
            ¿Cuántos huéspedes?
          </label>
          <select
            value={searchData.guests}
            onChange={(e) => handleInputChange('guests', Number(e.target.value))}
            className="w-full text-sm md:text-lg border-none outline-none bg-transparent text-gray-700"
          >
            <option value={1}>1 huésped</option>
            <option value={2}>2 huéspedes</option>
            <option value={3}>3 huéspedes</option>
            <option value={4}>4 huéspedes</option>
            <option value={5}>5 huéspedes</option>
            <option value={6}>6 huéspedes</option>
            <option value={7}>7 huéspedes</option>
            <option value={8}>8 huéspedes</option>
            <option value={9}>9 huéspedes</option>
            <option value={10}>10+ huéspedes</option>
          </select>
        </div>

        {/* Botón de Búsqueda */}
        <div className="p-3 md:p-4">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Buscando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirbnbSearchModule;
