export interface Reservation {
  id: string;
  propertyId: string;
  userId: string;
  hostId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  specialRequests?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface Availability {
  propertyId: string;
  date: string;
  isAvailable: boolean;
  price?: number;
  minNights?: number;
}

export interface ReservationRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}

export interface ReservationResponse {
  success: boolean;
  data?: Reservation;
  error?: {
    message: string;
  };
}

export interface PriceCalculationRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface PriceCalculationResponse {
  success: boolean;
  data?: {
    basePrice: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    totalPrice: number;
    nights: number;
  };
  error?: {
    message: string;
  };
}
