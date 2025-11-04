'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Users } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';

/**
 * SearchBar Component - Barra de búsqueda del header funcional
 * Conectado al SearchContext para realizar búsquedas reales
 */
interface SearchBarProps {
  isMobile?: boolean;
}

export default function SearchBar({ isMobile = false }: SearchBarProps) {
  const router = useRouter();
  const { searchData, setSearchData, performSearch, isSearching } = useSearch();
  const [localLocation, setLocalLocation] = useState(searchData.location || '');

  // Sincronizar con el contexto cuando cambia
  useEffect(() => {
    setLocalLocation(searchData.location || '');
  }, [searchData.location]);

  // Función para formatear fecha corta
  const formatShortDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Función para manejar la búsqueda desde el header
  const handleSearch = () => {
    // Actualizar el contexto con la ubicación local (trim para limpiar espacios)
    const trimmedLocation = localLocation.trim();
    console.log('🔍 [SearchBar] Iniciando búsqueda con ubicación:', trimmedLocation);
    
    const updatedSearchData = {
      ...searchData,
      location: trimmedLocation
    };
    
    setSearchData(updatedSearchData);
    
    // Realizar la búsqueda (esto actualizará los resultados)
    performSearch();
    
    // Scroll suave hacia los resultados
    setTimeout(() => {
      const resultsSection = document.getElementById('search-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // Función para manejar Enter en el input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isMobile) {
    return (
      <div className="md:hidden pb-4">
        <div className="flex items-center bg-slate-700/50 rounded-full px-4 py-3 border border-slate-600/50">
          <Search className="h-4 w-4 text-slate-400 mr-3" />
          <input
            type="text"
            value={localLocation}
            onChange={(e) => setLocalLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="¿Dónde vas?"
            className="bg-transparent text-white placeholder-slate-400 outline-none flex-1 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="ml-2 bg-[#FF385C] hover:bg-[#E31C5F] disabled:bg-red-300 text-white p-1.5 rounded-full transition-colors"
          >
            <Search className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center bg-slate-700/50 rounded-full px-6 py-3 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 max-w-md mx-8">
      <Search className="h-4 w-4 text-slate-400 mr-3" />
      <input
        type="text"
        value={localLocation}
        onChange={(e) => setLocalLocation(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="¿Dónde vas?"
        className="bg-transparent text-white placeholder-slate-400 outline-none flex-1 text-sm"
      />
      {searchData.checkIn && searchData.checkOut && (
        <>
          <div className="text-slate-400 text-sm mx-3">•</div>
          <div className="flex items-center text-slate-400 text-sm">
            <Calendar className="h-3 w-3 mr-1" />
            {formatShortDate(searchData.checkIn)} - {formatShortDate(searchData.checkOut)}
          </div>
        </>
      )}
      {searchData.guests > 0 && (
        <>
          <div className="text-slate-400 text-sm mx-3">•</div>
          <div className="flex items-center text-slate-400 text-sm">
            <Users className="h-3 w-3 mr-1" />
            {searchData.guests}
          </div>
        </>
      )}
      <button
        onClick={handleSearch}
        disabled={isSearching}
        className="ml-3 bg-[#FF385C] hover:bg-[#E31C5F] disabled:bg-red-300 text-white p-2 rounded-full transition-colors duration-200"
        title="Buscar"
      >
        {isSearching ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Search className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
