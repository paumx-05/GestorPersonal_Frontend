export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Hasheada
  avatar?: string;
  createdAt: string;
  isActive: boolean;
  role?: 'user' | 'admin';
}

export interface UserDB {
  users: User[];
  nextId: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

import { Request } from 'express';

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      createdAt?: string;
    };
    token: string;
  };
  error?: {
    message: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  avatar?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  avatar?: string;
  isActive?: boolean;
  role?: 'user' | 'admin';
}