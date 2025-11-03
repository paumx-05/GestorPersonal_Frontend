import { Router } from 'express';
import { 
  createReviewController, 
  getReviewsController,
  getPropertyReviewsController, 
  getUserReviewsController,
  getPropertyReviewStatsController,
  getReviewStatsController,
  updateReviewController,
  deleteReviewController
} from '../../controllers/reviews/reviewController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Rutas públicas (no requieren autenticación)
// GET /api/reviews?propertyId=xxx&page=1&limit=10&sort=newest (nueva ruta recomendada)
router.get('/', getReviewsController);
// GET /api/reviews/property/:id (mantener compatibilidad)
router.get('/property/:id', getPropertyReviewsController);
router.get('/property/:id/stats', getPropertyReviewStatsController);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

router.post('/', createReviewController);
router.get('/user/:id', getUserReviewsController);
router.get('/stats', getReviewStatsController);
router.put('/:id', updateReviewController);
router.delete('/:id', deleteReviewController);

export default router;
