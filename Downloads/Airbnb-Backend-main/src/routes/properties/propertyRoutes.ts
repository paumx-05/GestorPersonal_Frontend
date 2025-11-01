import { Router } from 'express';
import { getAllProperties, getProperty, getPopularProperties } from '../../controllers/properties/propertyController';

const router = Router();

// Rutas públicas de propiedades
// IMPORTANTE: Las rutas específicas (/popular y /) deben ir ANTES de /:id para evitar conflictos
router.get('/popular', getPopularProperties);
router.get('/', getAllProperties); // GET /api/properties - Listar todas las propiedades
router.get('/:id', getProperty);

export default router;
