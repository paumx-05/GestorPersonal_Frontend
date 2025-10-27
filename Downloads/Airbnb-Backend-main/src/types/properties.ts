export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  pricePerNight: number; // Alias para compatibilidad
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  hostId: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  isActive: boolean;
  rating?: number; // Para filtros de rating
  instantBook?: boolean; // Para filtros de reserva instantánea
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  hostId: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
}

export interface UpdatePropertyData {
  title?: string;
  description?: string;
  price?: number;
  location?: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities?: string[];
  images?: string[];
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  amenities?: string[];
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  country?: string;
  location?: string; // Para búsqueda por ubicación
  guests?: number; // Alias para maxGuests
  minRating?: number; // Para filtros de rating mínimo
  instantBook?: boolean; // Para filtros de reserva instantánea
  offset?: number; // Para paginación
  limit?: number; // Para paginación
}

// Alias para compatibilidad
export type SearchFilters = PropertyFilters;

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
