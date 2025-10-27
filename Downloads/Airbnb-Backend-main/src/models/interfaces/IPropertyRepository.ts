/**
 * 🎯 INTERFAZ DE REPOSITORIO DE PROPIEDADES
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Interfaz que define el contrato para todas las operaciones de propiedades.
 * Garantiza compatibilidad entre implementaciones Mock y MongoDB.
 */

import { Property, PropertyFilters, SearchResult } from '../../types/properties';

export interface IPropertyRepository {
  // 🔍 FUNCIONES DE BÚSQUEDA
  getPropertyById(id: string): Promise<Property | null>;
  searchProperties(filters: PropertyFilters): Promise<SearchResult>;
  getPopularLocations(): Promise<string[]>;
  getAvailableAmenities(): Promise<string[]>;
  
  // 📊 FUNCIONES DE ESTADÍSTICAS
  getPropertyStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byLocation: Record<string, number>;
  }>;
}
