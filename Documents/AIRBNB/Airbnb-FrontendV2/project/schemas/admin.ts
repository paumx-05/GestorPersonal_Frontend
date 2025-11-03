/**
 * Esquemas de validación para el panel de administración
 * Validación runtime con Zod para datos del backend
 */

import { z } from 'zod';

// Esquema para métricas de usuarios
export const UserMetricsSchema = z.object({
  totalUsers: z.number().min(0),
  activeUsers: z.number().min(0),
  inactiveUsers: z.number().min(0),
  verifiedUsers: z.number().min(0),
  unverifiedUsers: z.number().min(0),
  newUsersToday: z.number().min(0),
  newUsersThisWeek: z.number().min(0),
  newUsersThisMonth: z.number().min(0),
  registrationGrowth: z.number(),
  lastUpdated: z.string().datetime()
});

// Esquema para estadísticas de registros
export const RegistrationStatsSchema = z.object({
  date: z.string(),
  count: z.number().min(0)
});

// Esquema para métricas de actividad
export const ActivityMetricsSchema = z.object({
  totalLogins: z.number().min(0),
  loginsToday: z.number().min(0),
  loginsThisWeek: z.number().min(0),
  loginsThisMonth: z.number().min(0),
  averageSessionDuration: z.number().min(0),
  mostActiveHour: z.number().min(0).max(23)
});

// Esquema para estadísticas detalladas de usuarios
export const UserStatsSchema = z.object({
  totalUsers: z.number().min(0),
  usersByStatus: z.object({
    active: z.number().min(0),
    inactive: z.number().min(0)
  }),
  usersByVerification: z.object({
    verified: z.number().min(0),
    unverified: z.number().min(0)
  }),
  usersByGender: z.object({
    male: z.number().min(0),
    female: z.number().min(0),
    other: z.number().min(0)
  }),
  usersByAgeGroup: z.object({
    '18-25': z.number().min(0),
    '26-35': z.number().min(0),
    '36-45': z.number().min(0),
    '46-55': z.number().min(0),
    '55+': z.number().min(0)
  })
});

// Esquema para respuesta de administración
export const AdminResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional()
});

// Esquema para usuario individual
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional()
});

// Esquema para lista paginada de usuarios
export const PaginatedUsersSchema = z.object({
  users: z.array(UserSchema),
  pagination: z.object({
    page: z.number().min(1),
    limit: z.number().min(1),
    total: z.number().min(0),
    totalPages: z.number().min(0)
  })
});

// Tipos derivados de los esquemas
export type UserMetrics = z.infer<typeof UserMetricsSchema>;
export type RegistrationStats = z.infer<typeof RegistrationStatsSchema>;
export type ActivityMetrics = z.infer<typeof ActivityMetricsSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type AdminResponse = z.infer<typeof AdminResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;

// Función para validar respuesta de métricas de usuarios
export function validateUserMetrics(data: unknown): UserMetrics {
  return UserMetricsSchema.parse(data);
}

// Función para validar respuesta de estadísticas de usuarios
export function validateUserStats(data: unknown): UserStats {
  return UserStatsSchema.parse(data);
}

// Función para validar respuesta de administración
export function validateAdminResponse(data: unknown): AdminResponse {
  return AdminResponseSchema.parse(data);
}

// Función para validar lista paginada de usuarios
export function validatePaginatedUsers(data: unknown): PaginatedUsers {
  return PaginatedUsersSchema.parse(data);
}
