export interface HostProperty {
  id: string;
  hostId: string;
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  amenities: string[];
  images: string[];
  maxGuests: number;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HostStats {
  totalProperties: number;
  activeProperties: number;
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  totalRevenue: number;
  averageRating: number;
}

export interface HostPropertyUpdate {
  title?: string;
  description?: string;
  pricePerNight?: number;
  location?: string;
  amenities?: string[];
  images?: string[];
  maxGuests?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  isActive?: boolean;
}

export interface HostResponse {
  success: boolean;
  data?: any;
  error?: {
    message: string;
  };
}
