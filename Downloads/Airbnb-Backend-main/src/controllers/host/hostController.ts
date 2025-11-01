import { Request, Response } from 'express';
import { HostRepositoryFactory } from '../../models/factories/HostRepositoryFactory';
import { PropertyRepositoryFactory } from '../../models/factories/PropertyRepositoryFactory';
import { ReservationRepositoryFactory } from '../../models/factories/ReservationRepositoryFactory';
import { ReviewRepositoryFactory } from '../../models/factories/ReviewRepositoryFactory';
import { findUserById } from '../../models';

const hostRepo = HostRepositoryFactory.create();
const propertyRepo = PropertyRepositoryFactory.create();
const reservationRepo = ReservationRepositoryFactory.create();
const reviewRepo = ReviewRepositoryFactory.create();

/**
 * 🔐 Helper function to validate property ownership or admin access
 * @param propertyId - ID of the property to check
 * @param userId - ID of the user making the request
 * @returns Object with isValid flag and error message if invalid
 */
const validatePropertyAccess = async (
  propertyId: string,
  userId: string
): Promise<{ isValid: boolean; error?: string; statusCode?: number }> => {
  // Get the property
  const property = await hostRepo.getHostPropertyById(propertyId);
  
  if (!property) {
    return {
      isValid: false,
      error: 'Propiedad no encontrada',
      statusCode: 404
    };
  }

  // Get user to check role
  const user = await findUserById(userId);
  if (!user) {
    return {
      isValid: false,
      error: 'Usuario no encontrado',
      statusCode: 401
    };
  }

  // Check if user is admin
  const isAdmin = user.role === 'admin';

  // Check if user owns the property
  const isOwner = property.hostId === userId;

  // Allow if user is admin or owner
  if (isAdmin || isOwner) {
    return { isValid: true };
  }

  // Deny access
  return {
    isValid: false,
    error: 'No tienes permisos para modificar esta propiedad',
    statusCode: 403
  };
};

// GET /api/host/properties - Obtener propiedades del host
export const getHostPropertiesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const properties = await hostRepo.getHostProperties(userId);

    res.json({
      success: true,
      data: {
        properties,
        total: properties.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo propiedades del host' }
    });
  }
};

// POST /api/host/properties - Crear nueva propiedad
export const createHostPropertyController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Extraer datos del body (ignorar hostId si viene)
    const { title, description, pricePerNight, location, amenities, images, maxGuests, propertyType, bedrooms, bathrooms } = req.body;

    // Validaciones básicas
    if (!title || !description || !pricePerNight || !location || !maxGuests || !propertyType) {
      res.status(400).json({
        success: false,
        error: { message: 'title, description, pricePerNight, location, maxGuests y propertyType son requeridos' }
      });
      return;
    }

    // Validar tipos de datos
    if (typeof pricePerNight !== 'number' || pricePerNight <= 0) {
      res.status(400).json({
        success: false,
        error: { message: 'pricePerNight debe ser un número mayor a 0' }
      });
      return;
    }

    if (typeof maxGuests !== 'number' || maxGuests <= 0) {
      res.status(400).json({
        success: false,
        error: { message: 'maxGuests debe ser un número mayor a 0' }
      });
      return;
    }

    // Crear propiedad - asignar hostId desde token, ignorando cualquier hostId del body
    const property = await hostRepo.createHostProperty({
      hostId: userId, // Siempre desde el token JWT, nunca desde el body
      title,
      description,
      pricePerNight,
      location,
      amenities: amenities || [],
      images: images || [],
      maxGuests,
      propertyType,
      bedrooms,
      bathrooms,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error: any) {
    console.error('Error creando propiedad:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Error creando propiedad',
        details: error.message || 'Error desconocido'
      }
    });
  }
};

// GET /api/host/properties/:id - Obtener propiedad específica del host
export const getHostPropertyController = async (req: Request, res: Response): Promise<void> => {
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

    // Validar permisos de acceso (propiedad existe, es dueño o admin)
    const accessValidation = await validatePropertyAccess(id, userId);
    
    if (!accessValidation.isValid) {
      res.status(accessValidation.statusCode || 403).json({
        success: false,
        error: { message: accessValidation.error || 'No tienes permisos para acceder a esta propiedad' }
      });
      return;
    }

    const property = await hostRepo.getHostPropertyById(id);

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo propiedad del host' }
    });
  }
};

// PUT /api/host/properties/:id - Actualizar propiedad del host
export const updateHostPropertyController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const updates = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validar permisos: verificar que la propiedad existe y pertenece al usuario o que el usuario es admin
    const accessValidation = await validatePropertyAccess(id, userId);
    
    if (!accessValidation.isValid) {
      res.status(accessValidation.statusCode || 403).json({
        success: false,
        error: { message: accessValidation.error || 'No tienes permisos para modificar esta propiedad' }
      });
      return;
    }

    // Prevenir modificación del hostId desde el body
    const { hostId, ...safeUpdates } = updates;

    const updatedProperty = await hostRepo.updateHostProperty(id, safeUpdates);
    
    if (!updatedProperty) {
      res.status(404).json({
        success: false,
        error: { message: 'Error actualizando propiedad' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Propiedad actualizada exitosamente',
        property: updatedProperty
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando propiedad' }
    });
  }
};

// DELETE /api/host/properties/:id - Eliminar propiedad del host
export const deleteHostPropertyController = async (req: Request, res: Response): Promise<void> => {
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

    // Validar permisos: verificar que la propiedad existe y pertenece al usuario o que el usuario es admin
    const accessValidation = await validatePropertyAccess(id, userId);
    
    if (!accessValidation.isValid) {
      res.status(accessValidation.statusCode || 403).json({
        success: false,
        error: { message: accessValidation.error || 'No tienes permisos para eliminar esta propiedad' }
      });
      return;
    }

    const success = await hostRepo.deleteHostProperty(id);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Error eliminando propiedad' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Propiedad eliminada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando propiedad' }
    });
  }
};

// GET /api/host/properties/:id/reservations - Obtener reservas de una propiedad
export const getHostPropertyReservationsController = async (req: Request, res: Response): Promise<void> => {
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

    // Validar permisos: verificar que la propiedad existe y pertenece al usuario o que el usuario es admin
    const accessValidation = await validatePropertyAccess(id, userId);
    
    if (!accessValidation.isValid) {
      res.status(accessValidation.statusCode || 403).json({
        success: false,
        error: { message: accessValidation.error || 'No tienes permisos para acceder a esta propiedad' }
      });
      return;
    }

    const reservations = await reservationRepo.getPropertyReservations(id);

    res.json({
      success: true,
      data: {
        reservations,
        total: reservations.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reservas de la propiedad' }
    });
  }
};

// GET /api/host/properties/:id/reviews - Obtener reviews de una propiedad
export const getHostPropertyReviewsController = async (req: Request, res: Response): Promise<void> => {
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

    // Validar permisos: verificar que la propiedad existe y pertenece al usuario o que el usuario es admin
    const accessValidation = await validatePropertyAccess(id, userId);
    
    if (!accessValidation.isValid) {
      res.status(accessValidation.statusCode || 403).json({
        success: false,
        error: { message: accessValidation.error || 'No tienes permisos para acceder a esta propiedad' }
      });
      return;
    }

    const reviews = await reviewRepo.getPropertyReviews(id);

    res.json({
      success: true,
      data: {
        reviews,
        total: reviews.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reviews de la propiedad' }
    });
  }
};

// GET /api/host/stats - Obtener estadísticas del host
export const getHostStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const stats = await hostRepo.getHostStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas del host' }
    });
  }
};
