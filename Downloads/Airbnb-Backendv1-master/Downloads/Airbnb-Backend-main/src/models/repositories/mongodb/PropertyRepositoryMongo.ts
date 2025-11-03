/**
 * 🎯 REPOSITORY MONGODB DE PROPIEDADES
 */

import { IPropertyRepository } from '../../interfaces/IPropertyRepository';
import { Property, PropertyFilters, SearchResult } from '../../../types/properties';
import { PropertyModel } from '../../schemas/PropertySchema';

export class PropertyRepositoryMongo implements IPropertyRepository {
  async getPropertyById(id: string): Promise<Property | null> {
    const property = await PropertyModel.findById(id);
    return property ? this.mapToProperty(property) : null;
  }

  async searchProperties(filters: PropertyFilters): Promise<SearchResult> {
    const query: any = {};

    if (filters.location) {
      query.$or = [
        { 'location.city': { $regex: filters.location, $options: 'i' } },
        { 'location.country': { $regex: filters.location, $options: 'i' } }
      ];
    }

    if (filters.propertyType) {
      query.propertyType = filters.propertyType;
    }

    if (filters.minPrice) {
      query.pricePerNight = { ...query.pricePerNight, $gte: filters.minPrice };
    }

    if (filters.maxPrice) {
      query.pricePerNight = { ...query.pricePerNight, $lte: filters.maxPrice };
    }

    if (filters.guests) {
      query.maxGuests = { $gte: filters.guests };
    }

    if (filters.minRating) {
      query.rating = { $gte: filters.minRating };
    }

    if (filters.instantBook) {
      query.instantBook = filters.instantBook;
    }

    const total = await PropertyModel.countDocuments(query);
    const properties = await PropertyModel.find(query)
      .skip(filters.offset || 0)
      .limit(filters.limit || 20)
      .sort({ createdAt: -1 });

    return {
      properties: properties.map(property => this.mapToProperty(property)),
      total,
      page: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
      limit: filters.limit || 20,
      hasMore: (filters.offset || 0) + (filters.limit || 20) < total
    };
  }

  async getPopularLocations(): Promise<string[]> {
    // Simular ubicaciones populares
    return [
      'Madrid, España',
      'Barcelona, España',
      'París, Francia',
      'Londres, Reino Unido',
      'Roma, Italia',
      'Nueva York, Estados Unidos',
      'Los Ángeles, Estados Unidos',
      'Tokio, Japón'
    ];
  }

  async getAvailableAmenities(): Promise<string[]> {
    // Simular amenidades disponibles
    return [
      'WiFi',
      'Cocina',
      'Lavadora',
      'Secadora',
      'Aire acondicionado',
      'Calefacción',
      'TV',
      'Piscina',
      'Gimnasio',
      'Estacionamiento',
      'Mascotas permitidas',
      'Accesible para sillas de ruedas'
    ];
  }

  async getPropertyStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byLocation: Record<string, number>;
  }> {
    const total = await PropertyModel.countDocuments();
    
    const byType = await PropertyModel.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } }
    ]);
    
    const byLocation = await PropertyModel.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } }
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byLocation: byLocation.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };
  }

  private mapToProperty(mongoProperty: any): Property {
    return {
      _id: mongoProperty._id.toString(), // Incluir _id para compatibilidad con APIs
      id: mongoProperty._id.toString(),
      title: mongoProperty.title,
      description: mongoProperty.description,
      price: mongoProperty.pricePerNight || mongoProperty.price || 0, // Usar pricePerNight como price, con fallback
      pricePerNight: mongoProperty.pricePerNight || mongoProperty.price || 0,
      location: mongoProperty.location,
      propertyType: mongoProperty.propertyType,
      maxGuests: mongoProperty.maxGuests,
      bedrooms: mongoProperty.bedrooms,
      bathrooms: mongoProperty.bathrooms,
      amenities: mongoProperty.amenities || [],
      images: mongoProperty.images || [],
      hostId: mongoProperty.host?.id || mongoProperty.hostId, // Soportar ambos formatos
      host: mongoProperty.host, // Incluir objeto host completo si existe
      isActive: mongoProperty.isActive !== false, // Default to true if not specified
      rating: mongoProperty.rating,
      reviewCount: mongoProperty.reviewCount,
      instantBook: mongoProperty.instantBook,
      createdAt: mongoProperty.createdAt?.toISOString ? mongoProperty.createdAt.toISOString() : mongoProperty.createdAt,
      updatedAt: mongoProperty.updatedAt?.toISOString ? mongoProperty.updatedAt.toISOString() : mongoProperty.updatedAt
    } as any; // Cast para permitir el campo _id adicional
  }
}
