// Sistema mock para reservas - MILESTONE 6
// Simula la funcionalidad de reservas con datos de prueba

import { mockProperties, type AirbnbProperty } from '@/lib/mockData';

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

// Mapear las propiedades de mockData a nuestro formato
const mapToReservationProperty = (property: AirbnbProperty): Property => ({
  id: property.id,
  title: property.title,
  location: `${property.city}, ${property.location}`,
  pricePerNight: property.pricePerNight,
  image: property.imageUrl,
  guests: property.maxGuests,
  bedrooms: 2, // Valor por defecto
  bathrooms: 1, // Valor por defecto
  description: property.description,
  amenities: property.amenities
});

// Datos mock de propiedades mapeadas desde mockData
export const mockReservationProperties: Property[] = mockProperties.map(mapToReservationProperty);

// Función para obtener una propiedad por ID
export const getPropertyById = (id: string): Property | undefined => {
  return mockReservationProperties.find(property => property.id === id);
};

// Función para calcular el costo de la reserva
export const calculateReservationCost = (
  property: Property,
  checkIn: string,
  checkOut: string,
  guests: number
): ReservationData => {
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
};

// Función para procesar una reserva (mock)
export const processReservation = async (
  reservationData: ReservationData,
  guestInfo: GuestInfo
): Promise<{ success: boolean; reservationId?: string; message?: string }> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Validaciones básicas
  if (!guestInfo.firstName || !guestInfo.lastName) {
    return { success: false, message: "Nombre y apellido son requeridos" };
  }

  if (!guestInfo.email || !guestInfo.email.includes("@")) {
    return { success: false, message: "Email válido es requerido" };
  }

  if (!guestInfo.phone || guestInfo.phone.length < 10) {
    return { success: false, message: "Número de teléfono válido es requerido" };
  }

  // Simular éxito de reserva
  const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    reservationId,
    message: "Reserva confirmada exitosamente"
  };
};
