/**
 * Servicios de API para reservas - Reemplaza reservation-mock.ts
 * Conecta con el backend real para gestionar reservas
 */

import { apiClient } from './config';

// Interfaces para tipado de reservas
export interface Property {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  image: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  description?: string;
  amenities?: string[];
}

export interface ReservationData {
  checkIn: string;
  checkOut: string;
  guests: number;
  propertyId: string;
  totalNights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  specialRequests?: string;
}

export interface ReservationResponse {
  success: boolean;
  data?: {
    reservationId: string;
    reservation: ReservationData;
    guest: GuestInfo;
  };
  message?: string;
}

export interface Reservation {
  id: string;
  propertyId: string;
  guestInfo: GuestInfo;
  reservationData: ReservationData;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * Servicios de reservas que se conectan al backend real
 */
export const reservationService = {
  /**
   * Obtener una propiedad por ID para reservas
   * GET /api/properties/:id
   */
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      console.log('🔍 [reservationService] Obteniendo propiedad para reserva:', id);
      
      const response = await apiClient.get<{ 
        success: boolean; 
        data?: Property; 
        message?: string 
      }>(`/api/properties/${id}`);
      
      if (response.success && response.data) {
        console.log('✅ [reservationService] Propiedad obtenida:', response.data.title);
        return response.data;
      } else {
        console.log('❌ [reservationService] Propiedad no encontrada:', response.message);
        return null;
      }
    } catch (error) {
      console.error('💥 [reservationService] Error obteniendo propiedad:', error);
      return null;
    }
  },

  /**
   * Calcular el costo de la reserva
   * POST /api/reservations/calculate
   */
  async calculateReservationCost(
    property: Property,
    checkIn: string,
    checkOut: string,
    guests: number
  ): Promise<ReservationData | null> {
    try {
      console.log('🔍 [reservationService] Calculando costo de reserva...');
      
      const requestData = {
        propertyId: property.id,
        checkIn,
        checkOut,
        guests
      };
      
      const response = await apiClient.post<{ 
        success: boolean; 
        data?: ReservationData; 
        message?: string 
      }>('/api/reservations/calculate', requestData);
      
      if (response.success && response.data) {
        console.log('✅ [reservationService] Costo calculado:', response.data.total);
        return response.data;
      } else {
        console.log('❌ [reservationService] Error calculando costo:', response.message);
        return null;
      }
    } catch (error) {
      console.error('💥 [reservationService] Error calculando costo:', error);
      // Fallback a cálculo local
      return this.calculateReservationCostLocal(property, checkIn, checkOut, guests);
    }
  },

  /**
   * Calcular el costo de la reserva localmente (fallback)
   */
  calculateReservationCostLocal(
    property: Property,
    checkIn: string,
    checkOut: string,
    guests: number
  ): ReservationData {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const totalNights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const subtotal = property.pricePerNight * totalNights;
    const cleaningFee = Math.round(subtotal * 0.05); // 5% del subtotal
    const serviceFee = Math.round(subtotal * 0.08); // 8% del subtotal
    const taxes = Math.round(subtotal * 0.12); // 12% del subtotal
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      checkIn,
      checkOut,
      guests,
      propertyId: property.id,
      totalNights,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total
    };
  },

  /**
   * Procesar una reserva
   * POST /api/reservations
   */
  async processReservation(
    reservationData: ReservationData,
    guestInfo: GuestInfo
  ): Promise<{ success: boolean; reservationId?: string; message?: string }> {
    try {
      console.log('🔍 [reservationService] Procesando reserva...');
      
      const requestData = {
        reservationData,
        guestInfo
      };
      
      const response = await apiClient.post<ReservationResponse>('/api/reservations', requestData);
      
      if (response.success && response.data) {
        console.log('✅ [reservationService] Reserva procesada:', response.data.reservationId);
        return {
          success: true,
          reservationId: response.data.reservationId,
          message: 'Reserva confirmada exitosamente'
        };
      } else {
        console.log('❌ [reservationService] Error procesando reserva:', response.message);
        return {
          success: false,
          message: response.message || 'Error procesando la reserva'
        };
      }
    } catch (error) {
      console.error('💥 [reservationService] Error procesando reserva:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Obtener reservas del usuario autenticado
   * GET /api/reservations
   */
  async getUserReservations(): Promise<Reservation[]> {
    try {
      console.log('🔍 [reservationService] Obteniendo reservas del usuario...');
      
      const response = await apiClient.get<{ 
        success: boolean; 
        data?: Reservation[]; 
        message?: string 
      }>('/api/reservations');
      
      if (response.success && response.data) {
        console.log('✅ [reservationService] Reservas obtenidas:', response.data.length);
        return response.data;
      } else {
        console.log('❌ [reservationService] Error obteniendo reservas:', response.message);
        return [];
      }
    } catch (error) {
      console.error('💥 [reservationService] Error obteniendo reservas:', error);
      return [];
    }
  },

  /**
   * Cancelar una reserva
   * DELETE /api/reservations/:id
   */
  async cancelReservation(reservationId: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔍 [reservationService] Cancelando reserva:', reservationId);
      
      const response = await apiClient.delete<{ 
        success: boolean; 
        message?: string 
      }>(`/api/reservations/${reservationId}`);
      
      if (response.success) {
        console.log('✅ [reservationService] Reserva cancelada exitosamente');
        return {
          success: true,
          message: 'Reserva cancelada exitosamente'
        };
      } else {
        console.log('❌ [reservationService] Error cancelando reserva:', response.message);
        return {
          success: false,
          message: response.message || 'Error cancelando la reserva'
        };
      }
    } catch (error) {
      console.error('💥 [reservationService] Error cancelando reserva:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }
};
