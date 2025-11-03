import { Request, Response } from 'express';
import { 
  createReview, 
  getPropertyReviews, 
  getUserReviews,
  getReviewById,
  getPropertyReviewStats,
  getAllReviews,
  getReviewStats,
  updateReview,
  deleteReview
} from '../../models';
import { ReviewRequest } from '../../types/reviews';
import { UserModel } from '../../models/schemas/UserSchema';
import { ReviewModel } from '../../models/schemas/ReviewSchema';

// POST /api/reviews - Crear nueva review
export const createReviewController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { propertyId, reservationId, rating, comment, categories } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validaciones básicas - comment es opcional según las especificaciones
    if (!propertyId || !rating) {
      res.status(400).json({
        success: false,
        error: { message: 'propertyId y rating son requeridos' }
      });
      return;
    }

    // Validar rating
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        error: { message: 'Rating debe estar entre 1 y 5' }
      });
      return;
    }

    // Validar comment si está presente y no está vacío (mínimo 10 caracteres, máximo 1000)
    const commentTrimmed = comment ? String(comment).trim() : '';
    if (commentTrimmed && (commentTrimmed.length < 10 || commentTrimmed.length > 1000)) {
      res.status(400).json({
        success: false,
        error: { message: 'El comentario debe tener entre 10 y 1000 caracteres' }
      });
      return;
    }

    // Validar categorías si están presentes
    if (categories) {
      const requiredCategories = ['cleanliness', 'communication', 'checkin', 'accuracy', 'location', 'value'];
      for (const category of requiredCategories) {
        if (categories[category] && (categories[category] < 1 || categories[category] > 5)) {
          res.status(400).json({
            success: false,
            error: { message: `Categoría ${category} debe estar entre 1 y 5` }
          });
          return;
        }
      }
    }

    // Verificar si el usuario ya tiene una review para esta propiedad
    const existingReview = await ReviewModel.findOne({ userId, propertyId });
    
    if (existingReview) {
      res.status(409).json({
        success: false,
        error: {
          message: 'Ya has dejado una reseña para esta propiedad',
          code: 'DUPLICATE_REVIEW'
        }
      });
      return;
    }

    // Crear review (solo incluir comment si tiene contenido)
    const review = await createReview({
      propertyId,
      userId,
      reservationId,
      rating,
      comment: commentTrimmed || undefined,
      categories: categories || {},
      isVerified: reservationId ? true : false
    });

    res.status(201).json({
      success: true,
      message: 'Review creada exitosamente',
      data: {
        review: {
          id: review.id,
          propertyId: review.propertyId,
          userId: review.userId,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error creando review' }
    });
  }
};

// GET /api/reviews - Obtener reviews con query params (nueva ruta recomendada)
export const getReviewsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId, page = '1', limit = '10', sort = 'newest' } = req.query;

    if (!propertyId) {
      res.status(400).json({
        success: false,
        error: { message: 'propertyId es requerido' }
      });
      return;
    }

    // Obtener todas las reviews de la propiedad
    let reviews = await getPropertyReviews(propertyId as string);
    const total = reviews.length;

    // Calcular averageRating
    const averageRating = total > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / total) * 10) / 10
      : 0;

    // Aplicar ordenamiento
    switch (sort) {
      case 'oldest':
        reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'newest':
      default:
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Aplicar paginación
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    const paginatedReviews = reviews.slice(skip, skip + limitNum);

    // Obtener información del usuario para cada review
    const reviewsWithUser = await Promise.all(
      paginatedReviews.map(async (review) => {
        try {
          const user = await UserModel.findById(review.userId);
          return {
            id: review.id,
            propertyId: review.propertyId,
            userId: review.userId,
            user: {
              id: review.userId,
              name: user?.name || 'Usuario',
              avatar: user?.avatar || undefined
            },
            rating: review.rating,
            comment: review.comment || undefined,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
          };
        } catch (error) {
          return {
            id: review.id,
            propertyId: review.propertyId,
            userId: review.userId,
            user: {
              id: review.userId,
              name: 'Usuario',
              avatar: undefined
            },
            rating: review.rating,
            comment: review.comment || undefined,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
          };
        }
      })
    );

    res.json({
      success: true,
      message: 'Reviews obtenidas exitosamente',
      data: {
        reviews: reviewsWithUser,
        total,
        page: pageNum,
        limit: limitNum,
        averageRating
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reviews' }
    });
  }
};

// GET /api/reviews/property/:id - Obtener reviews de una propiedad (mantener compatibilidad)
export const getPropertyReviewsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10', sort = 'newest' } = req.query;

    // Obtener todas las reviews de la propiedad
    let reviews = await getPropertyReviews(id);
    const total = reviews.length;

    // Calcular averageRating
    const averageRating = total > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / total) * 10) / 10
      : 0;

    // Aplicar ordenamiento
    switch (sort) {
      case 'oldest':
        reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'newest':
      default:
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Aplicar paginación
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    const paginatedReviews = reviews.slice(skip, skip + limitNum);

    // Obtener información del usuario para cada review
    const reviewsWithUser = await Promise.all(
      paginatedReviews.map(async (review) => {
        try {
          const user = await UserModel.findById(review.userId);
          return {
            id: review.id,
            propertyId: review.propertyId,
            userId: review.userId,
            user: {
              id: review.userId,
              name: user?.name || 'Usuario',
              avatar: user?.avatar || undefined
            },
            rating: review.rating,
            comment: review.comment || undefined,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
          };
        } catch (error) {
          return {
            id: review.id,
            propertyId: review.propertyId,
            userId: review.userId,
            user: {
              id: review.userId,
              name: 'Usuario',
              avatar: undefined
            },
            rating: review.rating,
            comment: review.comment || undefined,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
          };
        }
      })
    );

    res.json({
      success: true,
      message: 'Reviews obtenidas exitosamente',
      data: {
        reviews: reviewsWithUser,
        total,
        page: pageNum,
        limit: limitNum,
        averageRating
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reviews de la propiedad' }
    });
  }
};

// GET /api/reviews/user/:id - Obtener reviews de un usuario
export const getUserReviewsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Solo permitir ver las propias reviews
    if (userId !== id) {
      res.status(403).json({
        success: false,
        error: { message: 'No tienes permisos para ver estas reviews' }
      });
      return;
    }

    const reviews = await getUserReviews(id);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reviews del usuario' }
    });
  }
};

// GET /api/reviews/property/:id/stats - Obtener estadísticas de reviews de una propiedad
export const getPropertyReviewStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const stats = await getPropertyReviewStats(id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas de reviews' }
    });
  }
};

// GET /api/reviews/stats - Estadísticas generales de reviews (admin)
export const getReviewStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const stats = getReviewStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas generales de reviews' }
    });
  }
};

// PUT /api/reviews/:id - Actualizar review
export const updateReviewController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const { rating, comment, categories } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const review = await getReviewById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        error: { message: 'Review no encontrada' }
      });
      return;
    }

    // Solo el autor puede actualizar su review
    if (review.userId !== userId) {
      res.status(403).json({
        success: false,
        error: { message: 'No tienes permisos para actualizar esta review' }
      });
      return;
    }

    // Validar rating si se proporciona
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      res.status(400).json({
        success: false,
        error: { message: 'Rating debe estar entre 1 y 5' }
      });
      return;
    }

    // Validar comment si se proporciona y no está vacío
    let commentTrimmed: string | undefined = undefined;
    if (comment !== undefined && comment !== null) {
      commentTrimmed = String(comment).trim();
      // Si después de trim está vacío, tratarlo como undefined (no actualizar)
      if (commentTrimmed === '') {
        commentTrimmed = undefined;
      } else if (commentTrimmed.length < 10 || commentTrimmed.length > 1000) {
        res.status(400).json({
          success: false,
          error: { message: 'El comentario debe tener entre 10 y 1000 caracteres' }
        });
        return;
      }
    }

    const updates: any = {};
    if (rating !== undefined) updates.rating = rating;
    if (commentTrimmed !== undefined) updates.comment = commentTrimmed;
    if (categories !== undefined) updates.categories = categories;

    const updatedReview = await updateReview(id, updates);
    
    if (!updatedReview) {
      res.status(500).json({
        success: false,
        error: { message: 'Error actualizando review' }
      });
      return;
    }

    res.json({
      success: true,
      message: 'Review actualizada exitosamente',
      data: {
        review: {
          id: updatedReview.id,
          rating: updatedReview.rating,
          comment: updatedReview.comment,
          updatedAt: (updatedReview as any).updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando review' }
    });
  }
};

// DELETE /api/reviews/:id - Eliminar review
export const deleteReviewController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const review = await getReviewById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        error: { message: 'Review no encontrada' }
      });
      return;
    }

    // Solo el autor puede eliminar su review (o admin, pero no tenemos sistema de roles aquí)
    if (review.userId !== userId) {
      res.status(403).json({
        success: false,
        error: { message: 'No tienes permisos para eliminar esta review' }
      });
      return;
    }

    const success = await deleteReview(id);
    
    if (!success) {
      res.status(500).json({
        success: false,
        error: { message: 'Error eliminando review' }
      });
      return;
    }

    res.json({
      success: true,
      message: 'Review eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando review' }
    });
  }
};
