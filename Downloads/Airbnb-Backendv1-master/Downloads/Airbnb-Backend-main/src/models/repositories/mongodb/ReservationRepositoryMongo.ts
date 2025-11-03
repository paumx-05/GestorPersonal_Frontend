/**
 * 🎯 REPOSITORY MONGODB DE RESERVAS
 */

import { IReservationRepository } from '../../interfaces/IReservationRepository';
import { Reservation, Availability } from '../../../types/reservations';
import { ReservationModel } from '../../schemas/ReservationSchema';

export class ReservationRepositoryMongo implements IReservationRepository {
  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reservation> {
    const newReservation = new ReservationModel(reservation);
    const savedReservation = await newReservation.save();
    return this.mapToReservation(savedReservation);
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    const reservations = await ReservationModel.find({ userId })
      .sort({ createdAt: -1 });
    return reservations.map(reservation => this.mapToReservation(reservation));
  }

  async getPropertyReservations(propertyId: string): Promise<Reservation[]> {
    const reservations = await ReservationModel.find({ propertyId })
      .sort({ createdAt: -1 });
    return reservations.map(reservation => this.mapToReservation(reservation));
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    const reservation = await ReservationModel.findById(id);
    return reservation ? this.mapToReservation(reservation) : null;
  }

  async updateReservationStatus(id: string, status: string): Promise<Reservation | null> {
    const reservation = await ReservationModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    return reservation ? this.mapToReservation(reservation) : null;
  }

  async deleteReservation(id: string): Promise<boolean> {
    const result = await ReservationModel.findByIdAndDelete(id);
    return !!result;
  }

  async checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const conflictingReservations = await ReservationModel.find({
      propertyId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });
    
    return conflictingReservations.length === 0;
  }

  async getPropertyAvailability(propertyId: string): Promise<Availability[]> {
    // Simular disponibilidad
    return [];
  }

  async calculatePrice(propertyId: string, checkIn: string, checkOut: string, guests: number): Promise<{
    basePrice: number;
    nights: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
  }> {
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = 100; // Precio base simulado
    const subtotal = basePrice * nights;
    const cleaningFee = 25;
    const serviceFee = subtotal * 0.1;
    const taxes = (subtotal + cleaningFee + serviceFee) * 0.1;
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      basePrice,
      nights,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total
    };
  }

  async getReservationStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMonth: Record<string, number>;
  }> {
    const total = await ReservationModel.countDocuments();
    
    const byStatus = await ReservationModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const byMonth = await ReservationModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byMonth: byMonth.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };
  }

  private mapToReservation(mongoReservation: any): Reservation {
    return {
      id: mongoReservation._id.toString(),
      userId: mongoReservation.userId,
      propertyId: mongoReservation.propertyId,
      hostId: mongoReservation.hostId,
      checkIn: mongoReservation.checkIn.toISOString(),
      checkOut: mongoReservation.checkOut.toISOString(),
      guests: mongoReservation.guests,
      totalPrice: mongoReservation.totalPrice,
      status: mongoReservation.status,
      paymentStatus: mongoReservation.paymentStatus,
      specialRequests: mongoReservation.specialRequests,
      createdAt: mongoReservation.createdAt.toISOString(),
      updatedAt: mongoReservation.updatedAt.toISOString()
    };
  }
}
