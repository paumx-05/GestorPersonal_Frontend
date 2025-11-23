import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as carteraController from '../controllers/cartera.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/', authenticate, carteraController.getCarteras);
router.get('/:id', authenticate, carteraController.getCarteraById);
router.post('/', authenticate, carteraController.createCartera);
router.put('/:id', authenticate, carteraController.updateCartera);
router.delete('/:id', authenticate, carteraController.deleteCartera);

export default router;

