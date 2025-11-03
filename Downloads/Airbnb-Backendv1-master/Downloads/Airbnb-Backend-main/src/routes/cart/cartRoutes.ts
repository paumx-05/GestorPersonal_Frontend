// src/routes/cart/cartRoutes.ts
// Rutas REST para el sistema de carrito de reservas

import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth/authMiddleware';
import {
  getUserCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItem,
  clearUserCart,
  getCartSummary,
  checkPropertyAvailability,
  getCartItemById,
  getCartStatistics
} from '../../controllers/cart/cartController';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas del carrito
router.get('/', getUserCart); // GET /api/cart - Obtener carrito del usuario
router.post('/add', addItemToCart); // POST /api/cart/add - Agregar item al carrito
router.delete('/remove/:itemId', removeItemFromCart); // DELETE /api/cart/remove/:itemId - Eliminar item del carrito
router.put('/update/:itemId', updateCartItem); // PUT /api/cart/update/:itemId - Actualizar item del carrito
router.delete('/clear', clearUserCart); // DELETE /api/cart/clear - Limpiar carrito completo
router.get('/summary', getCartSummary); // GET /api/cart/summary - Obtener resumen del carrito
router.get('/item/:itemId', getCartItemById); // GET /api/cart/item/:itemId - Obtener item específico
router.post('/check-availability', checkPropertyAvailability); // POST /api/cart/check-availability - Verificar disponibilidad
router.get('/stats', getCartStatistics); // GET /api/cart/stats - Obtener estadísticas (admin)

export default router;
