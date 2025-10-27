/**
 * 🎯 REPOSITORY MONGODB DE HOST
 */

import { IHostRepository } from '../../interfaces/IHostRepository';
import { HostProperty, HostStats } from '../../../types/host';
import { HostPropertyModel } from '../../schemas/HostSchema';

export class HostRepositoryMongo implements IHostRepository {
  async createHostProperty(property: Omit<HostProperty, 'id' | 'createdAt' | 'updatedAt'>): Promise<HostProperty> {
    const newProperty = new HostPropertyModel(property);
    const savedProperty = await newProperty.save();
    return this.mapToHostProperty(savedProperty);
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
    const property = await HostPropertyModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return property ? this.mapToHostProperty(property) : null;
  }

  async deleteHostProperty(id: string): Promise<boolean> {
    const result = await HostPropertyModel.findByIdAndDelete(id);
    return !!result;
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
