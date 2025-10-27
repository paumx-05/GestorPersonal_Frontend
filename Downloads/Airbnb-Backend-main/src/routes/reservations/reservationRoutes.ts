import { Router } from 'express';
import { 
  createReservationEndpoint,
  getUserReservationsEndpoint,
  updateReservationStatusEndpoint,
  checkAvailabilityEndpoint
} from '../../controllers/reservations/reservationController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Rutas públicas
router.get('/check-availability', checkAvailabilityEndpoint);

// Rutas protegidas
router.use(authenticateToken);
router.post('/', createReservationEndpoint);
router.get('/my-reservations', getUserReservationsEndpoint);
router.patch('/:id/status', updateReservationStatusEndpoint);

export default router;