/**
 * 🎯 REPOSITORY MONGODB DE HOST
 */

import { IHostRepository } from '../../interfaces/IHostRepository';
import { HostProperty, HostStats } from '../../../types/host';
import { HostPropertyModel } from '../../schemas/HostSchema';
import { PropertyModel } from '../../schemas/PropertySchema';
import { UserModel } from '../../schemas/UserSchema';

export class HostRepositoryMongo implements IHostRepository {
  async createHostProperty(property: Omit<HostProperty, 'id' | 'createdAt' | 'updatedAt'>): Promise<HostProperty> {
    try {
      // Guardar en host_properties primero
      const newProperty = new HostPropertyModel(property);
      const savedProperty = await newProperty.save();
      console.log(`✅ Propiedad guardada en host_properties: ${property.title} (ID: ${savedProperty._id})`);
      
      // También guardar en la colección properties para que sea visible en MongoDB Atlas
      try {
        // Obtener información del host
        const host = await UserModel.findById(property.hostId);
        
        if (!host) {
          console.warn(`⚠️ Host con ID ${property.hostId} no encontrado al crear propiedad en colección properties`);
        }
        
        // Convertir location de string a objeto si es necesario
        let locationObj: any;
        const locationValue = property.location as any;
        
        if (typeof locationValue === 'string') {
          // Parsear el string de ubicación (formato: "Dirección, Ciudad, País")
          const parts = locationValue.split(',').map((p: string) => p.trim());
          locationObj = {
            address: parts[0] || locationValue,
            city: parts[1] || parts[0] || 'Ciudad',
            country: parts[2] || 'País',
            coordinates: {
              lat: 0,
              lng: 0
            }
          };
        } else if (locationValue && typeof locationValue === 'object' && !Array.isArray(locationValue)) {
          // Ya es un objeto, asegurar estructura correcta
          locationObj = {
            address: locationValue.address || String(locationValue) || 'Dirección no especificada',
            city: locationValue.city || 'Ciudad',
            country: locationValue.country || 'País',
            coordinates: locationValue.coordinates || { lat: 0, lng: 0 }
          };
        } else {
          // Fallback: crear objeto desde string vacío
          locationObj = {
            address: String(locationValue || 'Dirección no especificada'),
            city: 'Ciudad',
            country: 'País',
            coordinates: { lat: 0, lng: 0 }
          };
        }
        
        // Validar que location tenga todos los campos requeridos
        if (!locationObj.address || !locationObj.city || !locationObj.country) {
          throw new Error('Location debe tener address, city y country');
        }
        
        // Validar propertyType
        const validPropertyTypes = ['entire', 'private', 'shared'];
        const propertyType = validPropertyTypes.includes(property.propertyType) 
          ? property.propertyType as 'entire' | 'private' | 'shared'
          : 'entire';
        
        // Crear propiedad en la colección properties
        const propertyData = {
          title: property.title,
          description: property.description,
          location: locationObj,
          propertyType: propertyType,
          pricePerNight: Number(property.pricePerNight),
          maxGuests: Number(property.maxGuests),
          bedrooms: Number(property.bedrooms || 1),
          bathrooms: Number(property.bathrooms || 1),
          amenities: Array.isArray(property.amenities) ? property.amenities : [],
          images: Array.isArray(property.images) ? property.images : [],
          host: {
            id: property.hostId.toString(),
            name: host?.name || 'Host',
            avatar: host?.avatar || '',
            isSuperhost: false
          },
          rating: 0,
          reviewCount: 0,
          instantBook: false
        };
        
        const savedPropertyInProperties = await PropertyModel.create(propertyData);
        console.log(`✅ Propiedad guardada en colección properties: ${property.title} (ID: ${savedPropertyInProperties._id})`);
      } catch (error: any) {
        // Si falla al guardar en properties, registrar el error detallado pero continuar
        console.error('❌ Error guardando propiedad en colección properties:', {
          message: error.message,
          stack: error.stack,
          propertyTitle: property.title,
          location: property.location
        });
        // No lanzar error para que la propiedad se mantenga en host_properties
      }
      
      return this.mapToHostProperty(savedProperty);
    } catch (error: any) {
      console.error('❌ Error creando propiedad en host_properties:', {
        message: error.message,
        stack: error.stack,
        propertyTitle: property.title
      });
      throw error;
    }
  }

  async getHostProperties(hostId: string): Promise<HostProperty[]> {
    const properties = await HostPropertyModel.find({ hostId })
      .sort({ createdAt: -1 });
    return properties.map(property => this.mapToHostProperty(property));
  }

  async getHostPropertyById(id: string): Promise<HostProperty | null> {
    const property = await HostPropertyModel.findById(id);
    return property ? this.mapToHostProperty(property) : null;
  }

  async updateHostProperty(id: string, updates: Partial<HostProperty>): Promise<HostProperty | null> {
    try {
      // Actualizar en host_properties
      const property = await HostPropertyModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      
      if (!property) {
        return null;
      }
      
      console.log(`✅ Propiedad actualizada en host_properties: ${id}`);
      
      // También actualizar en la colección properties si existe
      try {
        // Convertir location si es necesario
        let locationUpdate: any = undefined;
        if (updates.location) {
          const locationValue = updates.location as any;
          if (typeof locationValue === 'string') {
            const parts = locationValue.split(',').map((p: string) => p.trim());
            locationUpdate = {
              address: parts[0] || locationValue,
              city: parts[1] || parts[0] || 'Ciudad',
              country: parts[2] || 'País',
              coordinates: { lat: 0, lng: 0 }
            };
          } else if (locationValue && typeof locationValue === 'object' && !Array.isArray(locationValue)) {
            const currentLocation = property.location as any;
            locationUpdate = {
              address: locationValue.address || String(currentLocation || '') || 'Dirección no especificada',
              city: locationValue.city || 'Ciudad',
              country: locationValue.country || 'País',
              coordinates: locationValue.coordinates || { lat: 0, lng: 0 }
            };
          }
        }
        
        // Preparar datos de actualización para properties
        const propertiesUpdate: any = {};
        if (updates.title) propertiesUpdate.title = updates.title;
        if (updates.description) propertiesUpdate.description = updates.description;
        if (locationUpdate) propertiesUpdate.location = locationUpdate;
        if (updates.propertyType) {
          const validPropertyTypes = ['entire', 'private', 'shared'];
          propertiesUpdate.propertyType = validPropertyTypes.includes(updates.propertyType) 
            ? updates.propertyType 
            : 'entire';
        }
        if (updates.pricePerNight !== undefined) propertiesUpdate.pricePerNight = Number(updates.pricePerNight);
        if (updates.maxGuests !== undefined) propertiesUpdate.maxGuests = Number(updates.maxGuests);
        if (updates.bedrooms !== undefined) propertiesUpdate.bedrooms = Number(updates.bedrooms);
        if (updates.bathrooms !== undefined) propertiesUpdate.bathrooms = Number(updates.bathrooms);
        if (updates.amenities) propertiesUpdate.amenities = Array.isArray(updates.amenities) ? updates.amenities : [];
        if (updates.images) propertiesUpdate.images = Array.isArray(updates.images) ? updates.images : [];
        
        propertiesUpdate.updatedAt = new Date();
        
        // Intentar actualizar por ID primero
        const updatedInProperties = await PropertyModel.findByIdAndUpdate(
          id,
          propertiesUpdate,
          { new: true }
        );
        
        if (updatedInProperties) {
          console.log(`✅ Propiedad actualizada en colección properties: ${id}`);
        } else {
          // Intentar buscar y actualizar por hostId y title
          const alternativeUpdate = await PropertyModel.findOneAndUpdate(
            {
              'host.id': property.hostId,
              title: property.title
            },
            propertiesUpdate,
            { new: true }
          );
          
          if (alternativeUpdate) {
            console.log(`✅ Propiedad actualizada en colección properties (búsqueda alternativa): ${alternativeUpdate._id}`);
          } else {
            console.warn(`⚠️ Propiedad no encontrada en colección properties para actualizar (ID: ${id})`);
          }
        }
      } catch (error: any) {
        // Si falla al actualizar en properties, registrar pero no fallar
        console.error('❌ Error actualizando propiedad en colección properties:', {
          message: error.message,
          propertyId: id
        });
      }
      
      return this.mapToHostProperty(property);
    } catch (error: any) {
      console.error('❌ Error actualizando propiedad:', {
        message: error.message,
        stack: error.stack,
        propertyId: id
      });
      throw error;
    }
  }

  async deleteHostProperty(id: string): Promise<boolean> {
    try {
      // Eliminar de host_properties
      const result = await HostPropertyModel.findByIdAndDelete(id);
      
      if (!result) {
        console.warn(`⚠️ Propiedad con ID ${id} no encontrada en host_properties`);
        return false;
      }
      
      console.log(`✅ Propiedad eliminada de host_properties: ${id}`);
      
      // También eliminar de la colección properties si existe
      try {
        // Buscar por el mismo ID o por título/descripción coincidente
        const propertyInProperties = await PropertyModel.findByIdAndDelete(id);
        
        if (propertyInProperties) {
          console.log(`✅ Propiedad eliminada de colección properties: ${id}`);
        } else {
          // Intentar buscar por hostId y title para eliminar
          const alternativeMatch = await PropertyModel.findOneAndDelete({
            'host.id': result.hostId,
            title: result.title
          });
          
          if (alternativeMatch) {
            console.log(`✅ Propiedad eliminada de colección properties (búsqueda alternativa): ${alternativeMatch._id}`);
          } else {
            console.warn(`⚠️ Propiedad no encontrada en colección properties para eliminar (ID: ${id})`);
          }
        }
      } catch (error: any) {
        // Si falla al eliminar de properties, registrar pero no fallar
        console.error('❌ Error eliminando propiedad de colección properties:', {
          message: error.message,
          propertyId: id
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Error eliminando propiedad:', {
        message: error.message,
        stack: error.stack,
        propertyId: id
      });
      throw error;
    }
  }

  async getHostStats(hostId: string): Promise<HostStats> {
    const properties = await HostPropertyModel.find({ hostId });
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.status === 'active').length;
    
    // Calcular estadísticas (simuladas)
    const totalRevenue = properties.reduce((sum, prop) => sum + (prop.pricePerNight * 10), 0);
    const confirmedReservations = Math.floor(Math.random() * 20);
    const averageRating = 4.5;
    const occupancyRate = confirmedReservations > 0 ? (confirmedReservations / (totalProperties * 30)) * 100 : 0;

    return {
      totalProperties,
      activeProperties,
      totalReservations: confirmedReservations,
      pendingReservations: Math.floor(confirmedReservations * 0.2), // Simulación
      confirmedReservations,
      totalRevenue,
      averageRating
    };
  }

  private mapToHostProperty(mongoProperty: any): HostProperty {
    return {
      id: mongoProperty._id.toString(),
      hostId: mongoProperty.hostId,
      title: mongoProperty.title,
      description: mongoProperty.description,
      location: mongoProperty.location,
      propertyType: mongoProperty.propertyType,
      pricePerNight: mongoProperty.pricePerNight,
      maxGuests: mongoProperty.maxGuests,
      amenities: mongoProperty.amenities || [],
      images: mongoProperty.images || [],
      isActive: mongoProperty.isActive !== false,
      createdAt: mongoProperty.createdAt ? mongoProperty.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: mongoProperty.updatedAt ? mongoProperty.updatedAt.toISOString() : new Date().toISOString()
    };
  }
}
