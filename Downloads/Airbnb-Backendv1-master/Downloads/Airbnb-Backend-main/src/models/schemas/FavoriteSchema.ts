import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  userId: string;
  propertyId: string;
  createdAt: Date;
}

export interface IWishlist extends Document {
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  propertyIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  userId: {
    type: String,
    required: true
  },
  propertyId: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'favorites'
});

const WishlistSchema = new Schema<IWishlist>({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  propertyIds: [{
    type: String
  }]
}, {
  timestamps: true,
  collection: 'wishlists'
});

// Indexes
FavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
WishlistSchema.index({ userId: 1 });
WishlistSchema.index({ isPublic: 1 });

export const FavoriteModel = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
export const WishlistModel = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
