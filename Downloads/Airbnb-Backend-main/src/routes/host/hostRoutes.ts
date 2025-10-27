import { Router } from 'express';
import { 
  getHostPropertiesController, 
  createHostPropertyController,
  getHostPropertyController,
  updateHostPropertyController,
  deleteHostPropertyController,
  getHostPropertyReservationsController,
  getHostPropertyReviewsController,
  getHostStatsController
} from '../../controllers/host/hostController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de propiedades del host
router.get('/properties', getHostPropertiesController);
router.post('/properties', createHostPropertyController);
router.get('/properties/:id', getHostPropertyController);
router.put('/properties/:id', updateHostPropertyController);
router.delete('/properties/:id', deleteHostPropertyController);

// Rutas de gestión de propiedades
router.get('/properties/:id/reservations', getHostPropertyReservationsController);
router.get('/properties/:id/reviews', getHostPropertyReviewsController);

// Estadísticas del host
router.get('/stats', getHostStatsController);

export default router;
