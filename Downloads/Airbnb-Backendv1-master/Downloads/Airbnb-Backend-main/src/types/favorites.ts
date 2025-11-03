export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  propertyIds: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistRequest {
  name: string;
  description?: string;
  propertyIds?: string[];
  isPublic?: boolean;
}

export interface FavoriteResponse {
  success: boolean;
  data?: any;
  error?: {
    message: string;
  };
}
