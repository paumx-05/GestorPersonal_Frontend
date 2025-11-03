/**
 * Schemas de validación para Reviews usando Zod
 * Valida los datos de reviews antes de enviarlos al backend
 */

import { z } from 'zod';

/**
 * Schema para validar un usuario dentro de una review
 */
export const ReviewUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
});

/**
 * Schema para validar una review individual
 */
export const ReviewSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  userId: z.string(),
  user: ReviewUserSchema,
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres').max(1000, 'El comentario no puede tener más de 1000 caracteres').optional().or(z.literal('')),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * Schema para validar el request al crear una review
 */
export const CreateReviewSchema = z.object({
  rating: z.number().min(1, 'La calificación debe ser al menos 1').max(5, 'La calificación no puede ser mayor a 5'),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres').max(1000, 'El comentario no puede tener más de 1000 caracteres').optional().or(z.literal('')),
});

/**
 * Schema para validar el request al actualizar una review
 */
export const UpdateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional().or(z.literal('')),
});

/**
 * Schema para validar la respuesta del backend al obtener reviews
 */
export const ReviewsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    reviews: z.array(ReviewSchema),
    total: z.number(),
    page: z.number().optional(),
    limit: z.number().optional(),
    averageRating: z.number().optional(),
  }),
  message: z.string().optional(),
});

/**
 * Schema para validar la respuesta del backend al crear/actualizar una review
 */
export const ReviewResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    review: ReviewSchema,
  }).optional(),
});

/**
 * Tipos TypeScript inferidos de los schemas
 */
export type Review = z.infer<typeof ReviewSchema>;
export type ReviewUser = z.infer<typeof ReviewUserSchema>;
export type CreateReviewRequest = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewSchema>;
export type ReviewsResponse = z.infer<typeof ReviewsResponseSchema>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;

