/**
 * Base schemas and common patterns for Mongoose models
 */

import { Schema } from 'mongoose';

// Common location schema
export const locationSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
}, { _id: false });

// Common user reference schema
export const userReferenceSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String }
}, { _id: false });

// Common timestamp options
export const timestampOptions = {
  timestamps: true
};

// Common collection options
export const getCollectionOptions = (collectionName: string) => ({
  timestamps: true,
  collection: collectionName
});

// Common field definitions
export const commonFields = {
  userId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
};
