/**
 * RUTAS DE USUARIOS - CRUD COMPLETO
 * Define endpoints RESTful para gestión de usuarios
 * Sigue estándares REST API
 */

import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createNewUser,
  updateUserById,
  deleteUserById,
  getUserStatistics,
  updateUserRole,
  getCurrentUser
} from '../../controllers/users/userController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validatePagination
} from '../../middleware/validation/userValidation';

const router = Router();

// =============================================================================
// RUTAS PROTEGIDAS (requieren autenticación)
// =============================================================================

/**
 * GET /api/users
 * Listar usuarios con paginación y filtros
 * Query params: page, limit, search
 */
router.get('/', authenticateToken, validatePagination, getUsers);

/**
 * GET /api/users/me
 * Obtener perfil del usuario autenticado
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * GET /api/users/stats
 * Obtener estadísticas de usuarios
 */
router.get('/stats', authenticateToken, getUserStatistics);

/**
 * GET /api/users/:id
 * Obtener usuario específico por ID
 */
router.get('/:id', authenticateToken, validateUserId, getUserById);

/**
 * POST /api/users
 * Crear nuevo usuario
 * Body: { email, name, password, avatar? }
 */
router.post('/', authenticateToken, validateCreateUser, createNewUser);

/**
 * PUT /api/users/:id
 * Actualizar usuario completo
 * Body: { name?, email?, avatar?, isActive? }
 */
router.put('/:id', authenticateToken, validateUserId, validateUpdateUser, updateUserById);

/**
 * PATCH /api/users/:id/role
 * Actualizar rol del usuario
 * Body: { role: "user" | "admin" }
 */
router.patch('/:id/role', authenticateToken, validateUserId, updateUserRole);

/**
 * DELETE /api/users/:id
 * Eliminar usuario (soft delete)
 */
router.delete('/:id', authenticateToken, validateUserId, deleteUserById);

export default router;
