import { Router } from 'express';
import { 
  addToFavoritesController, 
  removeFromFavoritesController, 
  getUserFavoritesController,
  checkFavoriteController,
  createWishlistController,
  getUserWishlistsController,
  getPublicWishlistsController,
  getWishlistController,
  updateWishlistController,
  deleteWishlistController,
  addPropertyToWishlistController,
  removePropertyFromWishlistController,
  getFavoriteStatsController
} from '../../controllers/favorites/favoriteController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.get('/wishlists/public', getPublicWishlistsController);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Rutas de favoritos
// IMPORTANTE: Las rutas más específicas deben ir ANTES de las dinámicas

// POST - Agregar favorito (mantener ambas rutas para compatibilidad)
router.post('/add', addToFavoritesController); // Nueva ruta según requisitos del frontend (debe ir primero)
router.post('/', addToFavoritesController);

// DELETE - Eliminar favorito (mantener ambas rutas para compatibilidad)
router.delete('/remove/:propertyId', removeFromFavoritesController); // Nueva ruta según requisitos del frontend (debe ir primero)
router.delete('/:propertyId', removeFromFavoritesController);

// GET - Obtener favoritos y verificar estado
router.get('/check/:propertyId', checkFavoriteController); // Ruta específica primero
router.get('/:propertyId/status', checkFavoriteController); // Ruta alternativa según requisitos (debe ir antes de /)
router.get('/', getUserFavoritesController); // Ruta general al final

// Rutas de wishlists
router.post('/wishlists', createWishlistController);
router.get('/wishlists', getUserWishlistsController);
router.get('/wishlists/:id', getWishlistController);
router.put('/wishlists/:id', updateWishlistController);
router.delete('/wishlists/:id', deleteWishlistController);

// Gestión de propiedades en wishlists
router.post('/wishlists/:id/properties', addPropertyToWishlistController);
router.delete('/wishlists/:id/properties/:propertyId', removePropertyFromWishlistController);

// Estadísticas
router.get('/stats', getFavoriteStatsController);

export default router;
