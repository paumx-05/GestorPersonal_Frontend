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
      avatar?: string | null; // Permitir null también
      description?: string | null; // Agregar description para compatibilidad
      createdAt?: string;
      role?: 'user' | 'admin';
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
  description?: string;
  isActive?: boolean;
  role?: 'user' | 'admin';
}