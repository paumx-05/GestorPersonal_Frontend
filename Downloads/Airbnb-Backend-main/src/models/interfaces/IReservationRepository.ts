/**
 * 🎯 INTERFAZ DE REPOSITORIO DE RESERVAS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Interfaz que define el contrato para todas las operaciones de reservas.
 * Garantiza compatibilidad entre implementaciones Mock y MongoDB.
 */

import { Reservation, Availability } from '../../types/reservations';

export interface IReservationRepository {
  // ➕ FUNCIONES DE CREACIÓN
  createReservation(reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reservation>;
  
  // 🔍 FUNCIONES DE BÚSQUEDA
  getUserReservations(userId: string): Promise<Reservation[]>;
  getPropertyReservations(propertyId: string): Promise<Reservation[]>;
  getReservationById(id: string): Promise<Reservation | null>;
  
  // ✏️ FUNCIONES DE ACTUALIZACIÓN
  updateReservationStatus(id: string, status: string): Promise<Reservation | null>;
  
  // 🗑️ FUNCIONES DE ELIMINACIÓN
  deleteReservation(id: string): Promise<boolean>;
  
  // 📅 FUNCIONES DE DISPONIBILIDAD
  checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean>;
  getPropertyAvailability(propertyId: string): Promise<Availability[]>;
  
  // 💰 FUNCIONES DE PRECIOS
  calculatePrice(propertyId: string, checkIn: string, checkOut: string, guests: number): Promise<{
    basePrice: number;
    nights: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
  }>;
  
  // 📊 FUNCIONES DE ESTADÍSTICAS
  getReservationStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMonth: Record<string, number>;
  }>;
}
