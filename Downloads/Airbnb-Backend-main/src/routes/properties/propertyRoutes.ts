import { Router } from 'express';
import { getProperty, getPopularProperties } from '../../controllers/properties/propertyController';

const router = Router();

// Rutas públicas de propiedades
// IMPORTANTE: /popular debe ir ANTES de /:id para evitar que 'popular' sea tratado como un ID
router.get('/popular', getPopularProperties);
router.get('/:id', getProperty);

export default router;
