export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  reservationId: string;
  rating: number; // 1-5
  comment?: string;
  categories: {
    cleanliness: number;
    communication: number;
    checkin: number;
    accuracy: number;
    location: number;
    value: number;
  };
  createdAt: string;
  updatedAt?: string;
  isVerified: boolean;
}

export interface ReviewStats {
  propertyId: string;
  averageRating: number;
  totalReviews: number;
  categoryAverages: {
    cleanliness: number;
    communication: number;
    checkin: number;
    accuracy: number;
    location: number;
    value: number;
  };
}

export interface ReviewRequest {
  propertyId: string;
  reservationId: string;
  rating: number;
  comment: string;
  categories: {
    cleanliness: number;
    communication: number;
    checkin: number;
    accuracy: number;
    location: number;
    value: number;
  };
}

export interface ReviewResponse {
  success: boolean;
  data?: Review;
  error?: {
    message: string;
  };
}
