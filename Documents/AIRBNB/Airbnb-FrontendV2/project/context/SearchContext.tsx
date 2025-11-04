'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { propertyService, type Property } from '@/lib/api/properties';

// Interfaz para los datos de búsqueda
interface SearchData {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

// Interfaz para los filtros
interface SearchFilters {
  propertyType: 'entire' | 'private' | 'shared' | '';
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  minRating: number;
  instantBook: boolean;
}

// Interfaz para el contexto
interface SearchContextType {
  // Datos de búsqueda
  searchData: SearchData;
  setSearchData: (data: SearchData) => void;
  
  // Filtros
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  
  // Propiedades filtradas
  filteredProperties: Property[];
  
  // Estados de UI
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  isLoading: boolean;
  
  // Propiedades totales (para referencia)
  allProperties: Property[];
  
  // Funciones
  performSearch: () => void;
  clearFilters: () => void;
}

// Crear el contexto
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe ser usado dentro de SearchProvider');
  }
  return context;
};

// Provider del contexto
export const SearchProvider = ({ children }: { children: ReactNode }) => {
  // Estados para datos de búsqueda
  const [searchData, setSearchData] = useState<SearchData>({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  // Estados para filtros
  const [filters, setFilters] = useState<SearchFilters>({
    propertyType: '',
    minPrice: 0,
    maxPrice: 1000,
    amenities: [],
    minRating: 0,
    instantBook: false
  });

  // Estados de propiedades y búsqueda
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar propiedades al inicializar
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true);
        const properties = await propertyService.getAllProperties();
        
        // 🔧 FIX: Doble verificación - getAllProperties ya elimina duplicados, pero verificamos por seguridad
        const uniqueProperties = properties.filter((property, index, self) => {
          const firstIndex = self.findIndex((p) => p.id === property.id);
          if (index !== firstIndex) {
            console.warn(`⚠️ [SearchContext] DUPLICADO DETECTADO (no debería pasar): ID=${property.id}, Título="${property.title}"`);
            return false;
          }
          return true;
        });
        
        if (properties.length !== uniqueProperties.length) {
          console.warn(`⚠️ [SearchContext] DUPLICADOS ENCONTRADOS EN SearchContext: ${properties.length} → ${uniqueProperties.length}`);
          console.warn(`⚠️ [SearchContext] Esto NO debería pasar si getAllProperties() está funcionando correctamente`);
        }
        
        setAllProperties(uniqueProperties);
        console.log('✅ [SearchContext] Propiedades cargadas:', uniqueProperties.length);
        
        // Log detallado para debugging
        const propertyIds = uniqueProperties.map(p => p.id);
        const duplicateIds = propertyIds.filter((id, index) => propertyIds.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
          console.error(`❌ [SearchContext] ERROR: IDs duplicados encontrados después de deduplicación:`, duplicateIds);
        }
      } catch (error) {
        console.warn('⚠️ [SearchContext] No se pudieron cargar propiedades (endpoint no disponible):', error);
        // No es un error crítico, solo establecer array vacío
        setAllProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Filtrar propiedades basado en los criterios actuales
  // 🔧 FIX: Usar useMemo para recalcular cuando cambian los filtros o datos de búsqueda
  // 🔧 FIX: Asegurar que no haya duplicados después del filtrado
  // 🔧 FIX: Agregar logs para debugging de búsqueda por ubicación
  const filteredProperties = useMemo(() => {
    // Solo filtrar por ubicación si hay un término de búsqueda
    const searchFilters = {
      location: searchData.location?.trim() || undefined, // Solo pasar si hay valor
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      guests: searchData.guests,
      ...filters
    };
    
    // Log para debugging
    if (searchData.location && searchData.location.trim()) {
      console.log('🔍 [SearchContext] Filtrando por ubicación:', searchData.location.trim());
      console.log('🔍 [SearchContext] Total propiedades antes de filtrar:', allProperties.length);
    }
    
    const rawFiltered = propertyService.filterProperties(allProperties, searchFilters);
    
    // Log para debugging
    if (searchData.location && searchData.location.trim()) {
      console.log('✅ [SearchContext] Propiedades después de filtrar:', rawFiltered.length);
      if (rawFiltered.length === 0 && allProperties.length > 0) {
        console.warn('⚠️ [SearchContext] No se encontraron propiedades. Verificando campos de ubicación...');
        // Log de ejemplo de propiedades para debugging
        if (allProperties.length > 0) {
          const sampleProp = allProperties[0];
          console.log('📋 [SearchContext] Ejemplo de propiedad:', {
            id: sampleProp.id,
            title: sampleProp.title,
            city: sampleProp.city,
            location: sampleProp.location,
            locationType: typeof sampleProp.location
          });
        }
      }
    }
    
    // Eliminar duplicados después del filtrado (por si acaso)
    return rawFiltered.filter((property, index, self) =>
      index === self.findIndex((p) => p.id === property.id)
    );
  }, [allProperties, searchData.location, searchData.checkIn, searchData.checkOut, searchData.guests, filters]);

  // Función para realizar búsqueda
  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      // Si hay ubicación, intentar búsqueda en el backend primero
      const hasLocation = searchData.location && searchData.location.trim();
      
      if (hasLocation) {
        console.log('🔍 [SearchContext] Realizando búsqueda en backend con ubicación:', searchData.location.trim());
        const searchResults = await propertyService.searchProperties({
          location: searchData.location.trim(),
          checkIn: searchData.checkIn,
          checkOut: searchData.checkOut,
          guests: searchData.guests,
          ...filters
        });
        
        if (searchResults.length > 0) {
          // 🔧 FIX: Eliminar duplicados de los resultados de búsqueda
          const uniqueResults = searchResults.filter((property, index, self) =>
            index === self.findIndex((p) => p.id === property.id)
          );
          setAllProperties(uniqueResults);
          console.log('✅ [SearchContext] Búsqueda backend exitosa (sin duplicados):', uniqueResults.length);
          setIsSearching(false);
          return; // Salir temprano si hay resultados del backend
        } else {
          console.log('⚠️ [SearchContext] Backend no devolvió resultados, usando filtrado local');
        }
      }
      
      // Si no hay resultados del backend o no hay ubicación, usar filtrado local
      // NO recargar todas las propiedades, usar las que ya tenemos
      // El filtrado local se aplicará automáticamente a través de useMemo
      console.log('✅ [SearchContext] Aplicando filtrado local a propiedades existentes');
      
    } catch (error) {
      console.error('💥 [SearchContext] Error en búsqueda backend:', error);
      console.log('⚠️ [SearchContext] Usando filtrado local como fallback');
      // No recargar propiedades, usar las que ya tenemos
    } finally {
      setIsSearching(false);
    }
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      propertyType: '',
      minPrice: 0,
      maxPrice: 1000,
      amenities: [],
      minRating: 0,
      instantBook: false
    });
  };

  const value: SearchContextType = {
    searchData,
    setSearchData,
    filters,
    setFilters,
    filteredProperties,
    isSearching,
    setIsSearching,
    performSearch,
    clearFilters,
    allProperties,
    isLoading
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
