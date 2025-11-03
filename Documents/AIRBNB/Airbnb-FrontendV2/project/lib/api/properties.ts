/**
 * Servicios de API para propiedades - Reemplaza mockData.ts
 * Conecta con el backend real para obtener datos de propiedades
 */

import { apiClient } from './config';

// Interfaces para tipado de propiedades
export interface PropertyLocation {
  coordinates?: { lat: number; lng: number } | [number, number];
  address?: string;
  city?: string;
  country?: string;
}

export interface Property {
  id: string;
  title: string;
  location: string | PropertyLocation;
  city: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  images?: string[]; // Array de todas las imágenes de la propiedad
  propertyType: 'entire' | 'private' | 'shared';
  amenities: string[];
  instantBook: boolean;
  maxGuests: number;
  availableDates: {
    start: string;
    end: string;
  }[];
  description: string;
  host?: {
    name: string;
    avatar: string;
    isSuperhost: boolean;
  };
}

export interface PropertyResponse {
  success: boolean;
  data?: Property[];
  message?: string;
}

export interface PropertyFilters {
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

export interface CreatePropertyRequest {
  title: string;
  location: string;
  city: string;
  pricePerNight: number;
  propertyType: 'entire' | 'private' | 'shared';
  amenities: string[];
  instantBook: boolean;
  maxGuests: number;
  description: string;
  imageUrl?: string;
}

export interface UpdatePropertyRequest {
  title?: string;
  location?: string;
  city?: string;
  pricePerNight?: number;
  propertyType?: 'entire' | 'private' | 'shared';
  amenities?: string[];
  instantBook?: boolean;
  maxGuests?: number;
  description?: string;
  imageUrl?: string;
}

/**
 * Helper para convertir location (string u objeto) a string
 */
export function getLocationString(location: string | PropertyLocation | undefined): string {
  if (!location) return '';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    // Intentar usar address primero, luego city, luego country
    if (location.address) return location.address;
    if (location.city) return location.city;
    if (location.country) return location.country;
    return '';
  }
  return String(location);
}

/**
 * Servicios de propiedades que se conectan al backend real
 */
export const propertyService = {
  /**
   * Obtener todas las propiedades disponibles (públicas)
   * GET /api/properties
   * 
   * IMPORTANTE: Este endpoint devuelve TODAS las propiedades registradas en la base de datos,
   * independientemente de quién las creó (admin, usuarios normales, etc.).
   * 
   * Se usa en:
   * - Página principal (búsqueda pública) - muestra todas las propiedades disponibles
   * - Panel de admin (/admin/properties) - para ver y gestionar TODAS las propiedades de TODOS los usuarios
   * 
   * @returns Promise<Property[]> - Array con todas las propiedades de la base de datos
   */
  async getAllProperties(): Promise<Property[]> {
    try {
      console.log('🔍 [propertyService] Obteniendo TODAS las propiedades (endpoint: GET /api/properties)...');
      console.log('🔍 [propertyService] Este endpoint devuelve propiedades de TODOS los usuarios (admin y usuarios normales)');
      
      const response = await apiClient.get<any>('/api/properties');
      
      console.log('📥 [propertyService] Respuesta completa del backend:', JSON.stringify(response, null, 2));
      
      // El backend puede devolver los datos en diferentes formatos
      // 🔧 FIX CRÍTICO: Usar Set para evitar duplicados desde el inicio
      let propertiesSet = new Set<string>(); // Set para rastrear IDs ya agregados
      let properties: Property[] = [];
      
      // Función helper para agregar propiedades sin duplicados
      const addUniqueProperties = (newProperties: Property[], source: string) => {
        newProperties.forEach(prop => {
          if (prop && prop.id && !propertiesSet.has(prop.id)) {
            propertiesSet.add(prop.id);
            properties.push(prop);
            console.log(`✅ [propertyService] Propiedad agregada desde ${source}: ID=${prop.id}, Título="${prop.title}"`);
          } else if (prop && prop.id && propertiesSet.has(prop.id)) {
            console.warn(`⚠️ [propertyService] DUPLICADO DETECTADO EN ${source}: ID=${prop.id}, Título="${prop.title}" - IGNORADO`);
          }
        });
      };
      
      // Intentar múltiples formatos de respuesta (SOLO el primero que encuentre)
      if (response.success && response.data) {
        // Formato 1: response.data es un array directamente
        if (Array.isArray(response.data)) {
          addUniqueProperties(response.data, 'response.data (array directo)');
          console.log('✅ [propertyService] Formato detectado: response.data es array');
        }
        // Formato 2: response.data.properties es un array
        else if (Array.isArray(response.data.properties)) {
          addUniqueProperties(response.data.properties, 'response.data.properties');
          console.log('✅ [propertyService] Formato detectado: response.data.properties es array');
        }
        // Formato 3: response.data contiene un objeto con array dentro
        else if (typeof response.data === 'object') {
          // Buscar cualquier propiedad que sea un array (solo la primera que encuentre)
          const arrayKey = Object.keys(response.data).find(key => Array.isArray(response.data[key]));
          if (arrayKey) {
            addUniqueProperties(response.data[arrayKey], `response.data.${arrayKey}`);
            console.log(`✅ [propertyService] Formato detectado: response.data.${arrayKey} es array`);
          }
        }
      }
      
      // Formato 4: response directamente es un array (sin wrapper success/data)
      if (properties.length === 0 && Array.isArray(response)) {
        addUniqueProperties(response, 'response (array directo)');
        console.log('✅ [propertyService] Formato detectado: response es array directo');
      }
      
      // Formato 5: response tiene propiedades directamente
      if (properties.length === 0 && response.properties && Array.isArray(response.properties)) {
        addUniqueProperties(response.properties, 'response.properties');
        console.log('✅ [propertyService] Formato detectado: response.properties es array');
      }
      
      // Formato 6: response.data puede ser un objeto con un array anidado (solo si aún no encontramos nada)
      if (properties.length === 0 && response.data) {
        // Buscar arrays dentro de response.data recursivamente (solo el primero)
        const findFirstArray = (obj: any): Property[] | null => {
          if (Array.isArray(obj)) return obj;
          if (obj && typeof obj === 'object') {
            for (const key in obj) {
              if (Array.isArray(obj[key])) return obj[key];
              const nested = findFirstArray(obj[key]);
              if (nested) return nested;
            }
          }
          return null;
        };
        const found = findFirstArray(response.data);
        if (found) {
          addUniqueProperties(found, 'response.data (búsqueda recursiva)');
          console.log('✅ [propertyService] Formato detectado: array encontrado recursivamente en response.data');
        }
      }
      
      if (properties.length > 0) {
        console.log(`✅ [propertyService] Propiedades obtenidas exitosamente: ${properties.length} propiedades`);
        
        // 🔧 FIX CRÍTICO: Eliminar duplicados por ID ANTES de devolver
        const uniqueProperties = properties.filter((property, index, self) => {
          const firstIndex = self.findIndex((p) => p.id === property.id);
          if (index !== firstIndex) {
            console.warn(`⚠️ [propertyService] Propiedad duplicada encontrada: ID=${property.id}, Título="${property.title}"`);
            return false;
          }
          return true;
        });
        
        if (properties.length !== uniqueProperties.length) {
          console.warn(`🔧 [propertyService] DUPLICADOS DETECTADOS Y ELIMINADOS: ${properties.length} → ${uniqueProperties.length} propiedades`);
          console.warn(`🔧 [propertyService] Se eliminaron ${properties.length - uniqueProperties.length} propiedades duplicadas`);
        }
        
        console.log(`📋 [propertyService] Ejemplo de propiedad:`, uniqueProperties[0] ? {
          id: uniqueProperties[0].id,
          title: uniqueProperties[0].title,
          city: uniqueProperties[0].city
        } : 'N/A');
        
        // Asegurar que siempre devolvemos un array sin duplicados
        const result = Array.isArray(uniqueProperties) ? uniqueProperties : [];
        console.log(`🏁 [propertyService] Retornando ${result.length} propiedades (SIN DUPLICADOS)`);
        return result;
      } else {
        console.warn('⚠️ [propertyService] No se encontraron propiedades en la respuesta');
        console.warn('⚠️ [propertyService] Estructura de respuesta:', Object.keys(response));
        if (response.data) {
          console.warn('⚠️ [propertyService] Estructura de response.data:', typeof response.data, Array.isArray(response.data) ? 'es array' : Object.keys(response.data));
        }
        
        // Asegurar que siempre devolvemos un array
        const result: Property[] = [];
        console.log(`🏁 [propertyService] Retornando ${result.length} propiedades`);
        return result;
      }
    } catch (error) {
      console.error('💥 [propertyService] Error obteniendo propiedades:', error);
      if (error instanceof Error) {
        console.error('💥 [propertyService] Mensaje de error:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtener una propiedad por ID
   * GET /api/properties/:id
   */
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      console.log('🔍 [propertyService] Obteniendo propiedad:', id);
      
      const response = await apiClient.get<{ success: boolean; data?: Property; message?: string }>(`/api/properties/${id}`);
      
      if (response.success && response.data) {
        console.log('✅ [propertyService] Propiedad obtenida:', response.data.title);
        return response.data;
      } else {
        console.log('❌ [propertyService] Propiedad no encontrada:', response.message);
        return null;
      }
    } catch (error) {
      console.error('💥 [propertyService] Error obteniendo propiedad:', error);
      return null;
    }
  },

  /**
   * Buscar propiedades con filtros
   * POST /api/properties/search
   */
  async searchProperties(filters: PropertyFilters): Promise<Property[]> {
    try {
      console.log('🔍 [propertyService] Buscando propiedades con filtros:', filters);
      
      const response = await apiClient.post<PropertyResponse>('/api/properties/search', filters);
      
      if (response.success && response.data) {
        console.log('✅ [propertyService] Propiedades encontradas:', response.data.length);
        return response.data;
      } else {
        console.log('❌ [propertyService] Error en búsqueda:', response.message);
        return [];
      }
    } catch (error) {
      console.error('💥 [propertyService] Error buscando propiedades:', error);
      return [];
    }
  },

  /**
   * Obtener sugerencias de ubicación
   * GET /api/properties/locations/suggestions?q=:query
   */
  async getLocationSuggestions(query: string): Promise<Array<{ name: string; country: string; type: 'city' | 'country' | 'region' }>> {
    try {
      console.log('🔍 [propertyService] Obteniendo sugerencias para:', query);
      
      const response = await apiClient.get<{ 
        success: boolean; 
        data?: Array<{ name: string; country: string; type: 'city' | 'country' | 'region' }>; 
        message?: string 
      }>(`/api/properties/locations/suggestions?q=${encodeURIComponent(query)}`);
      
      if (response.success && response.data) {
        console.log('✅ [propertyService] Sugerencias obtenidas:', response.data.length);
        return response.data;
      } else {
        console.log('❌ [propertyService] Error obteniendo sugerencias:', response.message);
        return [];
      }
    } catch (error) {
      console.error('💥 [propertyService] Error obteniendo sugerencias:', error);
      return [];
    }
  },

  /**
   * Filtrar propiedades localmente (fallback si el backend no soporta filtros avanzados)
   */
  filterProperties(properties: Property[], filters: PropertyFilters): Property[] {
    // Validar que properties sea un array válido
    if (!Array.isArray(properties)) {
      console.warn('⚠️ [propertyService] filterProperties recibió un valor que no es un array:', properties);
      return [];
    }

    return properties.filter(property => {
      // Filtro por ubicación (ciudad)
      if (filters.location && property.city && !property.city.toLowerCase().includes(filters.location.toLowerCase())) {
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
  },

  /**
   * Obtener propiedades del usuario autenticado
   * GET /api/host/properties (endpoint correcto según Postman)
   * 
   * IMPORTANTE: Este endpoint devuelve SOLO las propiedades creadas por el usuario autenticado.
   * - Para usuarios con rol "user": solo sus propias propiedades
   * - Para usuarios con rol "admin": según el backend, puede devolver todas o solo las suyas
   *   (depende de la implementación del backend)
   * 
   * Se usa en:
   * - Página "Mis Propiedades" (/my-properties) - usuarios regulares gestionan sus propiedades
   */
  async getMyProperties(): Promise<Property[]> {
    try {
      console.log('🔍 [propertyService] Obteniendo propiedades del usuario autenticado (endpoint /api/host/properties)...');
      
      // Endpoint correcto según Postman: /api/host/properties (GET para listar)
      const endpoint = process.env.NEXT_PUBLIC_PROPERTIES_MY_ENDPOINT || '/api/host/properties';
      const response = await apiClient.get<any>(endpoint);
      
      console.log('📥 [propertyService] Respuesta completa:', JSON.stringify(response, null, 2));
      
      // El backend puede devolver los datos en diferentes formatos
      let properties: Property[] = [];
      
      if (response.success) {
        // Formato 1: response.data es un array
        if (Array.isArray(response.data)) {
          properties = response.data;
        }
        // Formato 2: response.data.properties es un array
        else if (response.data && Array.isArray(response.data.properties)) {
          properties = response.data.properties;
        }
        // Formato 3: response.data contiene un objeto con array dentro
        else if (response.data && typeof response.data === 'object') {
          // Buscar cualquier propiedad que sea un array
          const arrayKey = Object.keys(response.data).find(key => Array.isArray(response.data[key]));
          if (arrayKey) {
            properties = response.data[arrayKey];
          }
        }
        // Formato 4: response directamente es un array
        else if (Array.isArray(response)) {
          properties = response;
        }
        // Formato 5: response tiene propiedades directamente
        else if (response.properties && Array.isArray(response.properties)) {
          properties = response.properties;
        }
        
        if (properties.length > 0) {
          console.log('✅ [propertyService] Propiedades obtenidas:', properties.length);
        } else {
          console.log('⚠️ [propertyService] No se encontraron propiedades o formato no reconocido');
        }
      } else {
        console.log('❌ [propertyService] Error obteniendo propiedades:', response.message);
      }
      
      // Asegurar que siempre devolvemos un array
      return Array.isArray(properties) ? properties : [];
    } catch (error) {
      console.error('💥 [propertyService] Error obteniendo propiedades:', error);
      return [];
    }
  },

  /**
   * Crear una nueva propiedad
   * POST /api/properties
   */
  async createProperty(propertyData: CreatePropertyRequest): Promise<{ success: boolean; data?: Property; message?: string }> {
    try {
      console.log('🔍 [propertyService] Creando propiedad con datos:', JSON.stringify(propertyData, null, 2));
      
      // Validar datos antes de enviar
      if (!propertyData.title || !propertyData.location || !propertyData.city) {
        return {
          success: false,
          message: 'Faltan campos requeridos: título, ubicación o ciudad'
        };
      }

      // Asegurar que amenities sea un array
      const dataToSend = {
        ...propertyData,
        amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities : [],
        pricePerNight: Number(propertyData.pricePerNight),
        maxGuests: Number(propertyData.maxGuests),
      };

      console.log('📤 [propertyService] Enviando datos al backend:', JSON.stringify(dataToSend, null, 2));
      console.log('🌐 [propertyService] URL base configurada:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
      
      // Endpoint correcto según la documentación de Postman: /api/host/properties
      const createEndpoint = process.env.NEXT_PUBLIC_PROPERTIES_CREATE_ENDPOINT || '/api/host/properties';
      
      console.log(`🔄 [propertyService] Usando endpoint: ${createEndpoint}`);
      console.log(`💡 [propertyService] Si recibes 404, verifica en Postman cuál es el endpoint correcto para crear propiedades`);
      console.log(`💡 [propertyService] Puedes configurarlo en .env.local como: NEXT_PUBLIC_PROPERTIES_CREATE_ENDPOINT=/ruta/correcta`);
      
      const startTime = Date.now();
      const response = await apiClient.post<{ success: boolean; data?: Property; message?: string }>(createEndpoint, dataToSend);
      const duration = Date.now() - startTime;
      
      console.log(`⏱️ [propertyService] Tiempo de respuesta: ${duration}ms`);
      
      console.log('📥 [propertyService] Respuesta completa del backend:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ [propertyService] Propiedad creada exitosamente:', response.data?.id);
      } else {
        console.error('❌ [propertyService] Error creando propiedad');
        console.error('❌ [propertyService] Message:', response.message);
        console.error('❌ [propertyService] Response:', response);
        
        // Si el backend devuelve errores de validación, mostrarlos
        if ((response as any).errors) {
          console.error('❌ [propertyService] Errores de validación:', (response as any).errors);
        }
      }
      
      return response;
    } catch (error) {
      console.error('💥 [propertyService] Error creando propiedad:', error);
      if (error instanceof Error) {
        console.error('💥 [propertyService] Mensaje:', error.message);
        console.error('💥 [propertyService] Stack:', error.stack);
        return {
          success: false,
          message: error.message || 'Error de conexión'
        };
      }
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Actualizar una propiedad existente
   * PUT /api/host/properties/:id (endpoint según Postman)
   * 
   * IMPORTANTE: Este endpoint permite a un admin actualizar cualquier propiedad,
   * incluso si fue creada por otro usuario. Un usuario normal solo puede actualizar sus propias propiedades.
   */
  async updateProperty(id: string, propertyData: UpdatePropertyRequest): Promise<{ success: boolean; data?: Property; message?: string }> {
    try {
      console.log('🔍 [propertyService] ============================================');
      console.log('🔍 [propertyService] ACTUALIZANDO PROPIEDAD');
      console.log('🔍 [propertyService] ID de propiedad:', id);
      console.log('🔍 [propertyService] Datos a actualizar:', JSON.stringify(propertyData, null, 2));
      console.log('🔍 [propertyService] URL base:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
      
      // Endpoint correcto según Postman: /api/host/properties/:id
      const endpoint = process.env.NEXT_PUBLIC_PROPERTIES_UPDATE_ENDPOINT || `/api/host/properties/${id}`;
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`;
      
      console.log('🔄 [propertyService] Endpoint completo:', fullUrl);
      console.log('🔄 [propertyService] Método: PUT');
      console.log('🔄 [propertyService] Body:', JSON.stringify(propertyData, null, 2));
      
      const startTime = Date.now();
      let response: { success: boolean; data?: Property; message?: string };
      
      try {
        response = await apiClient.put<{ success: boolean; data?: Property; message?: string }>(endpoint, propertyData);
      } catch (firstError: any) {
        // Si falla con 404, intentar endpoint alternativo (similar a deleteProperty)
        if (firstError?.message?.includes('404') || firstError?.message?.includes('Not Found')) {
          console.warn('⚠️ [propertyService] Endpoint /api/host/properties/:id devolvió 404, intentando /api/properties/:id...');
          
          try {
            const alternativeEndpoint = `/api/properties/${id}`;
            console.log('🔄 [propertyService] Intentando endpoint alternativo:', alternativeEndpoint);
            response = await apiClient.put<{ success: boolean; data?: Property; message?: string }>(alternativeEndpoint, propertyData);
          } catch (secondError) {
            // Si también falla, devolver el primer error
            throw firstError;
          }
        } else {
          throw firstError;
        }
      }
      
      const duration = Date.now() - startTime;
      
      console.log(`⏱️ [propertyService] Tiempo de respuesta: ${duration}ms`);
      console.log('📥 [propertyService] Respuesta completa del backend:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ [propertyService] Propiedad actualizada exitosamente');
        if (response.data) {
          console.log('✅ [propertyService] Datos actualizados:', {
            id: response.data.id,
            title: response.data.title,
            city: response.data.city
          });
        }
      } else {
        console.error('❌ [propertyService] Error en respuesta del backend');
        console.error('❌ [propertyService] Message:', response.message);
        if ((response as any).errors) {
          console.error('❌ [propertyService] Errores de validación:', (response as any).errors);
        }
      }
      
      console.log('🔍 [propertyService] ============================================');
      return response;
    } catch (error) {
      console.error('💥 [propertyService] ============================================');
      console.error('💥 [propertyService] ERROR ACTUALIZANDO PROPIEDAD');
      console.error('💥 [propertyService] ID:', id);
      console.error('💥 [propertyService] Error:', error);
      
      if (error instanceof Error) {
        console.error('💥 [propertyService] Mensaje:', error.message);
        console.error('💥 [propertyService] Stack:', error.stack);
        
        // Si es un error 404, el endpoint podría estar incorrecto
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.error('❌ [propertyService] ============================================');
          console.error('❌ [propertyService] ERROR 404: Endpoint no encontrado');
          console.error('❌ [propertyService] Endpoint intentado: PUT /api/host/properties/' + id);
          console.error('❌ [propertyService] URL completa: ' + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/host/properties/' + id);
          console.error('❌ [propertyService] ============================================');
          console.error('❌ [propertyService] SOLUCIÓN:');
          console.error('   1. Verifica en Postman cuál es el endpoint correcto para PUT/UPDATE');
          console.error('   2. Posibles endpoints:');
          console.error('      - PUT /api/host/properties/:id');
          console.error('      - PATCH /api/host/properties/:id');
          console.error('      - PUT /api/properties/:id');
          console.error('      - PATCH /api/properties/:id');
          console.error('   3. Si el endpoint es diferente, configúralo en .env.local:');
          console.error('      NEXT_PUBLIC_PROPERTIES_UPDATE_ENDPOINT=/ruta/correcta/:id');
          console.error('❌ [propertyService] ============================================');
        }
      }
      
      console.error('💥 [propertyService] ============================================');
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  /**
   * Eliminar una propiedad
   * DELETE /api/host/properties/:id (endpoint correcto según Postman)
   * 
   * IMPORTANTE: Este endpoint permite a un admin eliminar cualquier propiedad, 
   * incluso si fue creada por otro usuario.
   */
  async deleteProperty(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔍 [propertyService] Eliminando propiedad:', id);
      console.log('🔍 [propertyService] Endpoint: DELETE /api/host/properties/' + id);
      console.log('🔍 [propertyService] URL base:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
      
      // Intentar múltiples endpoints posibles
      // Opción 1: /api/host/properties/:id (endpoint del host)
      // Opción 2: /api/properties/:id (endpoint público)
      // El usuario puede configurar el endpoint correcto en .env.local
      const endpoint = process.env.NEXT_PUBLIC_PROPERTIES_DELETE_ENDPOINT || `/api/host/properties/${id}`;
      
      console.log('🔄 [propertyService] Enviando DELETE a:', endpoint);
      console.log('💡 [propertyService] Si recibes 404, el endpoint podría ser incorrecto');
      console.log('💡 [propertyService] Posibles endpoints alternativos:');
      console.log('   - DELETE /api/host/properties/' + id);
      console.log('   - DELETE /api/properties/' + id);
      console.log('   - DELETE /api/admin/properties/' + id);
      console.log('💡 [propertyService] Verifica en Postman cuál es el endpoint correcto');
      
      const startTime = Date.now();
      let response: { success: boolean; message?: string };
      
      try {
        response = await apiClient.delete<{ success: boolean; message?: string }>(endpoint);
      } catch (firstError: any) {
        // Si falla con 404, intentar endpoint alternativo
        if (firstError?.message?.includes('404') || firstError?.message?.includes('Not Found')) {
          console.warn('⚠️ [propertyService] Endpoint /api/host/properties/:id devolvió 404, intentando /api/properties/:id...');
          
          try {
            const alternativeEndpoint = `/api/properties/${id}`;
            console.log('🔄 [propertyService] Intentando endpoint alternativo:', alternativeEndpoint);
            response = await apiClient.delete<{ success: boolean; message?: string }>(alternativeEndpoint);
          } catch (secondError) {
            // Si también falla, devolver el primer error
            throw firstError;
          }
        } else {
          throw firstError;
        }
      }
      
      const duration = Date.now() - startTime;
      
      console.log(`⏱️ [propertyService] Tiempo de respuesta: ${duration}ms`);
      console.log('📥 [propertyService] Respuesta completa del backend:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ [propertyService] Propiedad eliminada exitosamente');
      } else {
        console.error('❌ [propertyService] Error eliminando propiedad');
        console.error('❌ [propertyService] Message:', response.message);
        console.error('❌ [propertyService] Response completa:', response);
      }
      
      return response;
    } catch (error) {
      console.error('💥 [propertyService] Error eliminando propiedad:', error);
      if (error instanceof Error) {
        console.error('💥 [propertyService] Mensaje:', error.message);
        console.error('💥 [propertyService] Stack:', error.stack);
        
        // Si es un error 404, el endpoint podría estar incorrecto
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.error('❌ [propertyService] ============================================');
          console.error('❌ [propertyService] ERROR 404: Endpoint no encontrado');
          console.error('❌ [propertyService] Endpoint intentado: DELETE /api/host/properties/' + id);
          console.error('❌ [propertyService] URL completa: ' + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/host/properties/' + id);
          console.error('❌ [propertyService] ============================================');
          console.error('❌ [propertyService] SOLUCIÓN:');
          console.error('   1. Verifica en Postman cuál es el endpoint correcto para DELETE');
          console.error('   2. Posibles endpoints:');
          console.error('      - DELETE /api/host/properties/:id');
          console.error('      - DELETE /api/properties/:id');
          console.error('      - DELETE /api/admin/properties/:id');
          console.error('   3. Si el endpoint es diferente, configúralo en .env.local:');
          console.error('      NEXT_PUBLIC_PROPERTIES_DELETE_ENDPOINT=/ruta/correcta/:id');
          console.error('❌ [propertyService] ============================================');
        }
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }
};

/**
 * Función helper para obtener sugerencias de ubicación (fallback local)
 * Se usa cuando el backend no está disponible
 */
export const getLocationSuggestionsFallback = (searchTerm: string): Array<{ name: string; country: string; type: 'city' | 'country' | 'region' }> => {
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
