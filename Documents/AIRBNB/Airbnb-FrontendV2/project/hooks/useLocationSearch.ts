import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { propertyService, getLocationSuggestionsFallback } from '@/lib/api/properties';

// Interfaz para las sugerencias de ubicación
interface LocationSuggestion {
  name: string;
  country: string;
  type: 'city' | 'country' | 'region';
}

/**
 * Hook personalizado para búsqueda de ubicaciones con sugerencias en tiempo real
 * Implementa debounce para evitar demasiadas búsquedas mientras el usuario escribe
 * 
 * @param searchTerm - El término de búsqueda del usuario
 * @returns Objeto con sugerencias, estado de carga y función para limpiar sugerencias
 */
export function useLocationSearch(searchTerm: string) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar debounce para evitar búsquedas excesivas
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Si no hay término de búsqueda, limpiar sugerencias
    if (!debouncedSearchTerm.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      
      try {
        // Intentar obtener sugerencias del backend primero
        const backendSuggestions = await propertyService.getLocationSuggestions(debouncedSearchTerm);
        
        if (backendSuggestions.length > 0) {
          setSuggestions(backendSuggestions);
          console.log('✅ [useLocationSearch] Sugerencias del backend:', backendSuggestions.length);
        } else {
          // Fallback a sugerencias locales
          const localSuggestions = getLocationSuggestionsFallback(debouncedSearchTerm);
          setSuggestions(localSuggestions);
          console.log('⚠️ [useLocationSearch] Usando sugerencias locales:', localSuggestions.length);
        }
      } catch (error) {
        console.error('💥 [useLocationSearch] Error obteniendo sugerencias:', error);
        // Fallback a sugerencias locales en caso de error
        const localSuggestions = getLocationSuggestionsFallback(debouncedSearchTerm);
        setSuggestions(localSuggestions);
        console.log('⚠️ [useLocationSearch] Fallback a sugerencias locales:', localSuggestions.length);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Función para limpiar sugerencias
  const clearSuggestions = () => {
    setSuggestions([]);
    setIsLoading(false);
  };

  return {
    suggestions,
    isLoading,
    clearSuggestions
  };
}

export default useLocationSearch;
