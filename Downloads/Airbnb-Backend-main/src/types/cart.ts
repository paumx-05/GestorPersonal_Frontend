// src/types/cart.ts
// Tipos TypeScript para el sistema de carrito de reservas

export interface CartItem {
  id: string;
  userId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pricePerNight: number;
  totalNights: number;
  totalPrice: number;
  createdAt: string;
  expiresAt: string;
  property?: {
    id: string;
    title: string;
    location: string;
    image: string;
  };
}

export interface CartData {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: string;
}

export interface AddToCartRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pricePerNight: number;
}

export interface UpdateCartItemRequest {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  pricePerNight?: number;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  totalNights: number;
  items: CartItem[];
}

export interface AvailabilityCheckRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  message: string;
  conflictingDates?: string[];
}

export interface CartResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Estados del carrito
export type CartItemStatus = 'active' | 'expired' | 'processing' | 'confirmed';

// Configuración del carrito
export interface CartConfig {
  maxItemsPerUser: number;
  expirationHours: number;
  maxGuestsPerProperty: number;
  minStayNights: number;
  maxStayNights: number;
}
