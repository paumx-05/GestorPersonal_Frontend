import { Request, Response } from 'express';
import { 
  createReservation, 
  getUserReservations, 
  getPropertyReservations,
  updateReservationStatus,
  checkAvailability,
  createNotification
} from '../../models';

// POST /api/reservations
export const createReservationEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { propertyId, checkIn, checkOut, guests, specialRequests } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validaciones
    if (!propertyId || !checkIn || !checkOut || !guests) {
      res.status(400).json({
        success: false,
        error: { message: 'Faltan datos requeridos' }
      });
      return;
    }

    // Validar que guests sea un número positivo
    if (typeof guests !== 'number' || guests < 1) {
      res.status(400).json({
        success: false,
        error: { message: 'El número de huéspedes debe ser mayor a 0' }
      });
      return;
    }

    // Validar formato de fechas
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      res.status(400).json({
        success: false,
        error: { message: 'Formato de fechas inválido' }
      });
      return;
    }

    if (checkInDate >= checkOutDate) {
      res.status(400).json({
        success: false,
        error: { message: 'La fecha de check-out debe ser posterior a la de check-in' }
      });
      return;
    }

    // Verificar disponibilidad
    const isAvailable = await checkAvailability(propertyId, checkIn, checkOut);
    if (!isAvailable) {
      res.status(400).json({
        success: false,
        error: { message: 'Propiedad no disponible para las fechas seleccionadas' }
      });
      return;
    }

    // Crear reserva
    const reservation = await createReservation({
      propertyId,
      userId,
      hostId: 'host-1', // Mock host ID
      checkIn,
      checkOut,
      guests,
      totalPrice: 1500 * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)),
      status: 'pending',
      specialRequests,
      paymentStatus: 'pending'
    });

    // Crear notificación
    await createNotification({
      userId,
      type: 'reservation',
      title: 'Reserva creada',
      message: `Tu solicitud de reserva ha sido enviada. Espera la confirmación del host.`,
      isRead: false,
      data: {
        reservationId: reservation.id,
        propertyId
      }
    });

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error creando reserva' }
    });
  }
};

// GET /api/reservations/my-reservations
export const getUserReservationsEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const reservations = await getUserReservations(userId);

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reservas' }
    });
  }
};

// PATCH /api/reservations/:id/status
export const updateReservationStatusEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      res.status(400).json({
        success: false,
        error: { message: 'Estado de reserva inválido' }
      });
      return;
    }

    const success = await updateReservationStatus(id, status);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Reserva no encontrada' }
      });
      return;
    }

    // Crear notificación de cambio de estado
    await createNotification({
      userId,
      type: 'reservation',
      title: `Reserva ${status}`,
      message: `Tu reserva ha sido ${status}.`,
      isRead: false,
      data: {
        reservationId: id,
        status
      }
    });

    res.json({
      success: true,
      data: { 
        message: `Reserva ${status} exitosamente`,
        reservationId: id,
        status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando estado de reserva' }
    });
  }
};

// GET /api/reservations/check-availability
export const checkAvailabilityEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId, checkIn, checkOut } = req.query;

    if (!propertyId || !checkIn || !checkOut) {
      res.status(400).json({
        success: false,
        error: { message: 'Faltan parámetros requeridos' }
      });
      return;
    }

    const isAvailable = await checkAvailability(
      propertyId as string,
      checkIn as string,
      checkOut as string
    );

    res.json({
      success: true,
      data: { 
        available: isAvailable,
        propertyId,
        checkIn,
        checkOut
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error verificando disponibilidad' }
    });
  }
};