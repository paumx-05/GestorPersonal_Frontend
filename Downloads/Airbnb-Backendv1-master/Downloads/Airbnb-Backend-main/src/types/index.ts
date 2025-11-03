// Tipos globales para la aplicación

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  images: string[];
  amenities: string[];
  maxGuests: number;
  rating: number;
  reviewCount: number;
  host: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Re-exportar tipos del carrito
export * from './cart';