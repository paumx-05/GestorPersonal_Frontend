import { Router } from 'express';
import { getAllProperties, getProperty, getPopularProperties, updateProperty, deleteProperty } from '../../controllers/properties/propertyController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Rutas públicas de propiedades
// IMPORTANTE: Las rutas específicas (/popular y /) deben ir ANTES de /:id para evitar conflictos
router.get('/popular', getPopularProperties);
router.get('/', getAllProperties); // GET /api/properties - Listar todas las propiedades
router.get('/:id', getProperty);

// Rutas protegidas: solo para admins
router.put('/:id', authenticateToken, updateProperty); // PUT /api/properties/:id - Actualizar propiedad (admin)
router.delete('/:id', authenticateToken, deleteProperty); // DELETE /api/properties/:id - Eliminar propiedad (admin)

export default router;
