// Datos mock completos para el buscador Airbnb
// Incluye propiedades en Madrid, Barcelona y Valencia con diferentes fechas y huéspedes

// Interfaz para los datos de un alojamiento Airbnb
export interface AirbnbProperty {
  id: string;
  title: string;
  location: string;
  city: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  propertyType: 'entire' | 'private' | 'shared';
  amenities: string[];
  instantBook: boolean;
  maxGuests: number;
  availableDates: {
    start: string;
    end: string;
  }[];
  description: string;
  host: {
    name: string;
    avatar: string;
    isSuperhost: boolean;
  };
}

// Función para generar fechas disponibles (desde hoy hasta enero del próximo año)
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  const endDate = new Date(today.getFullYear() + 1, 0, 31); // 31 de enero del próximo año
  
  for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push({
      start: d.toISOString().split('T')[0],
      end: new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  
  return dates;
};

// Datos mock de alojamientos Airbnb en Madrid, Barcelona y Valencia
export const mockProperties: AirbnbProperty[] = [
  // MADRID - Propiedades
  {
    id: 'madrid-1',
    title: 'Casa moderna con piscina en el centro de Madrid',
    location: 'Centro, Madrid',
    city: 'Madrid',
    pricePerNight: 120,
    rating: 4.8,
    reviewCount: 156,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    propertyType: 'entire',
    amenities: ['WiFi', 'Piscina', 'Cocina', 'Aire acondicionado', 'Estacionamiento'],
    instantBook: true,
    maxGuests: 6,
    availableDates: generateAvailableDates(),
    description: 'Hermosa casa moderna en el corazón de Madrid con piscina privada y todas las comodidades.',
    host: {
      name: 'María',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      isSuperhost: true
    }
  },
  {
    id: 'madrid-2',
    title: 'Apartamento acogedor cerca de Sol',
    location: 'Sol, Madrid',
    city: 'Madrid',
    pricePerNight: 85,
    rating: 4.6,
    reviewCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    propertyType: 'entire',
    amenities: ['WiFi', 'Cocina', 'Calefacción', 'TV'],
    instantBook: false,
    maxGuests: 4,
    availableDates: generateAvailableDates(),
    description: 'Apartamento perfecto para explorar Madrid, a solo 5 minutos de la Puerta del Sol.',
    host: {
      name: 'Carlos',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isSuperhost: false
    }
  },
  {
    id: 'madrid-3',
    title: 'Habitación privada con baño en Malasaña',
    location: 'Malasaña, Madrid',
    city: 'Madrid',
    pricePerNight: 45,
    rating: 4.9,
    reviewCount: 203,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    propertyType: 'private',
    amenities: ['WiFi', 'TV', 'Netflix', 'Cocina compartida'],
    instantBook: true,
    maxGuests: 2,
    availableDates: generateAvailableDates(),
    description: 'Habitación privada en el barrio más trendy de Madrid, perfecta para jóvenes.',
    host: {
      name: 'Ana',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      isSuperhost: true
    }
  },
  {
    id: 'madrid-4',
    title: 'Loft industrial con terraza en Chueca',
    location: 'Chueca, Madrid',
    city: 'Madrid',
    pricePerNight: 95,
    rating: 4.7,
    reviewCount: 67,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    propertyType: 'entire',
    amenities: ['WiFi', 'Terraza', 'Cocina', 'Lavadora', 'Gimnasio'],
    instantBook: true,
    maxGuests: 4,
    availableDates: generateAvailableDates(),
    description: 'Loft moderno con terraza privada en el barrio de Chueca, ideal para parejas.',
    host: {
      name: 'David',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      isSuperhost: true
    }
  },
  {
    id: 'madrid-5',
    title: 'Apartamento de lujo en la castellana',
    location: 'Castellana, Madrid',
    city: 'Madrid',
    pricePerNight: 185,
    rating: 4.7,
    reviewCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1714939785137-5645727b3b23?w=400',
    propertyType: 'entire',
    amenities: ['WiFi', 'Cocina', 'Calefacción', 'TV', 'Jacuzzi'],
    instantBook: false,
    maxGuests: 4,
    availableDates: generateAvailableDates(),
    description: 'Apartamento perfecto para hecer negocios enMadrid, en el centro de negocios de la cuidad.',
    host: {
      name: 'Juan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isSuperhost: false
    }
  },

  // BARCELONA - Propiedades
  {
    id: 'barcelona-1',
    title: 'Apartamento con vista al mar en Barceloneta',
    location: 'Barceloneta, Barcelona',
    city: 'Barcelona',
    pricePerNight: 110,
    rating: 4.9,
    reviewCount: 234,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    propertyType: 'entire',
    amenities: ['WiFi', 'Vista al mar', 'Cocina', 'Aire acondicionado', 'Balcón'],
    instantBook: true,
    maxGuests: 5,
    availableDates: generateAvailableDates(),
    description: 'Apartamento con vistas espectaculares al Mediterráneo en el corazón de Barceloneta.',
    host: {
      name: 'Jordi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      isSuperhost: true
    }
  },
  {
    id: 'barcelona-2',
    title: 'Casa tradicional en el Gótico',
    location: 'Barrio Gótico, Barcelona',
    city: 'Barcelona',
    pricePerNight: 75,
    rating: 4.5,
    reviewCount: 112,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    propertyType: 'entire',
    amenities: ['WiFi', 'Cocina', 'Calefacción', 'TV', 'Chimenea'],
    instantBook: false,
    maxGuests: 3,
    availableDates: generateAvailableDates(),
    description: 'Casa tradicional catalana en el histórico Barrio Gótico de Barcelona.',
    host: {
      name: 'Carmen',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      isSuperhost: false
    }
  },
  {
    id: 'barcelona-3',
    title: 'Habitación privada cerca de Sagrada Familia',
    location: 'Eixample, Barcelona',
    city: 'Barcelona',
    pricePerNight: 55,
    rating: 4.8,
    reviewCount: 178,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    propertyType: 'private',
    amenities: ['WiFi', 'TV', 'Cocina compartida', 'Terraza'],
    instantBook: true,
    maxGuests: 2,
    availableDates: generateAvailableDates(),
    description: 'Habitación privada a solo 10 minutos caminando de la Sagrada Familia.',
    host: {
      name: 'Pau',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isSuperhost: true
    }
  },
  {
    id: 'barcelona-4',
    title: 'Loft moderno en Poblenou',
    location: 'Poblenou, Barcelona',
    city: 'Barcelona',
    pricePerNight: 90,
    rating: 4.6,
    reviewCount: 95,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    propertyType: 'entire',
    amenities: ['WiFi', 'Cocina', 'Lavadora', 'Gimnasio', 'Terraza'],
    instantBook: true,
    maxGuests: 4,
    availableDates: generateAvailableDates(),
    description: 'Loft moderno en el distrito tecnológico de Barcelona, cerca de la playa.',
    host: {
      name: 'Laura',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      isSuperhost: true
    }
  },

  // VALENCIA - Propiedades
  {
    id: 'valencia-1',
    title: 'Casa con jardín en el centro histórico',
    location: 'Ciutat Vella, Valencia',
    city: 'Valencia',
    pricePerNight: 80,
    rating: 4.7,
    reviewCount: 145,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    propertyType: 'entire',
    amenities: ['WiFi', 'Jardín', 'Cocina', 'Aire acondicionado', 'Estacionamiento'],
    instantBook: false,
    maxGuests: 6,
    availableDates: generateAvailableDates(),
    description: 'Casa tradicional valenciana con jardín privado en el centro histórico.',
    host: {
      name: 'Vicente',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      isSuperhost: true
    }
  },
  {
    id: 'valencia-2',
    title: 'Apartamento moderno cerca de la playa',
    location: 'Malvarrosa, Valencia',
    city: 'Valencia',
    pricePerNight: 70,
    rating: 4.4,
    reviewCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
    propertyType: 'entire',
    amenities: ['WiFi', 'Vista al mar', 'Cocina', 'TV', 'Balcón'],
    instantBook: true,
    maxGuests: 4,
    availableDates: generateAvailableDates(),
    description: 'Apartamento moderno a solo 5 minutos de la playa de Malvarrosa.',
    host: {
      name: 'Isabel',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      isSuperhost: false
    }
  },
  {
    id: 'valencia-3',
    title: 'Habitación privada en Ruzafa',
    location: 'Ruzafa, Valencia',
    city: 'Valencia',
    pricePerNight: 40,
    rating: 4.9,
    reviewCount: 167,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    propertyType: 'private',
    amenities: ['WiFi', 'TV', 'Cocina compartida', 'Terraza'],
    instantBook: true,
    maxGuests: 2,
    availableDates: generateAvailableDates(),
    description: 'Habitación privada en el barrio más cool de Valencia, lleno de restaurantes y bares.',
    host: {
      name: 'Miguel',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isSuperhost: true
    }
  },
  {
    id: 'valencia-4',
    title: 'Casa rural con piscina en las afueras',
    location: 'Campanar, Valencia',
    city: 'Valencia',
    pricePerNight: 95,
    rating: 4.8,
    reviewCount: 78,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    propertyType: 'entire',
    amenities: ['WiFi', 'Piscina', 'Jardín', 'Cocina', 'Chimenea', 'Estacionamiento'],
    instantBook: false,
    maxGuests: 8,
    availableDates: generateAvailableDates(),
    description: 'Casa rural con piscina privada, perfecta para familias grandes o grupos.',
    host: {
      name: 'Elena',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      isSuperhost: true
    }
  }
];

// Función para filtrar propiedades por criterios de búsqueda
export const filterProperties = (
  properties: AirbnbProperty[],
  filters: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    minRating?: number;
    instantBook?: boolean;
  }
): AirbnbProperty[] => {
  return properties.filter(property => {
    // Filtro por ubicación (ciudad)
    if (filters.location && !property.city.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Filtro por número de huéspedes
    if (filters.guests && property.maxGuests < filters.guests) {
      return false;
    }

    // Filtro por tipo de propiedad
    if (filters.propertyType && property.propertyType !== filters.propertyType) {
      return false;
    }

    // Filtro por precio
    if (filters.minPrice && property.pricePerNight < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && property.pricePerNight > filters.maxPrice) {
      return false;
    }

    // Filtro por calificación mínima
    if (filters.minRating && property.rating < filters.minRating) {
      return false;
    }

    // Filtro por reserva instantánea
    if (filters.instantBook && !property.instantBook) {
      return false;
    }

    // Filtro por amenidades
    if (filters.amenities && filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => 
        property.amenities.includes(amenity)
      );
      if (!hasAllAmenities) {
        return false;
      }
    }

    return true;
  });
};

// Función para obtener sugerencias de ubicación
export const getLocationSuggestions = (searchTerm: string): Array<{ name: string; country: string; type: 'city' | 'country' | 'region' }> => {
  const cities = ['Madrid', 'Barcelona', 'Valencia'];
  const countries = ['España'];
  
  const suggestions: Array<{ name: string; country: string; type: 'city' | 'country' | 'region' }> = [
    ...cities.map(city => ({ name: city, country: 'España', type: 'city' as const })),
    ...countries.map(country => ({ name: country, country: country, type: 'country' as const }))
  ];

  return suggestions.filter(suggestion =>
    suggestion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.country.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);
};
