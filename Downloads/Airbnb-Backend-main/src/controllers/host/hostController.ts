import { Request, Response } from 'express';
import { HostRepositoryFactory } from '../../models/factories/HostRepositoryFactory';
import { PropertyRepositoryFactory } from '../../models/factories/PropertyRepositoryFactory';
import { ReservationRepositoryFactory } from '../../models/factories/ReservationRepositoryFactory';
import { ReviewRepositoryFactory } from '../../models/factories/ReviewRepositoryFactory';

const hostRepo = HostRepositoryFactory.create();
const propertyRepo = PropertyRepositoryFactory.create();
const reservationRepo = ReservationRepositoryFactory.create();
const reviewRepo = ReviewRepositoryFactory.create();

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
    const { title, description, pricePerNight, location, amenities, images, maxGuests, propertyType, bedrooms, bathrooms } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

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

    // Crear propiedad
    const property = await hostRepo.createHostProperty({
      hostId: userId,
      title,
      description,
      pricePerNight,
      location,
      amenities: amenities || [],
      images: images || [],
      maxGuests,
      propertyType,
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

    const property = await hostRepo.getHostPropertyById(id);

    if (!property || property.hostId !== userId) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

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

    // Verificar que la propiedad pertenece al host
    const property = await hostRepo.getHostPropertyById(id);
    if (!property || property.hostId !== userId) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    const updatedProperty = await hostRepo.updateHostProperty(id, updates);
    
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

    // Verificar que la propiedad pertenece al host
    const property = await hostRepo.getHostPropertyById(id);
    if (!property || property.hostId !== userId) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
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

    // Verificar que la propiedad pertenece al host
    const property = await hostRepo.getHostPropertyById(id);
    if (!property || property.hostId !== userId) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
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

    // Verificar que la propiedad pertenece al host
    const property = await hostRepo.getHostPropertyById(id);
    if (!property || property.hostId !== userId) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
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
