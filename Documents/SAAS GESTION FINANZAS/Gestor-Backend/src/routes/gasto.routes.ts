import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as gastoController from '../controllers/gasto.controller';

const router = Router();

// Todas las rutas de gastos requieren autenticación
router.use(authenticate);

// POST /api/gastos - Crear un nuevo gasto (debe ir antes de las rutas con parámetros)
router.post('/', gastoController.createGasto);

// GET /api/gastos/:mes/categoria/:categoria - Obtener gastos por categoría (ruta más específica primero)
router.get('/:mes/categoria/:categoria', gastoController.getGastosByCategoria);

// GET /api/gastos/:mes/total - Obtener total de gastos del mes (ruta específica antes de la genérica)
router.get('/:mes/total', gastoController.getTotalGastosByMes);

// GET /api/gastos/:mes - Obtener todos los gastos de un mes
router.get('/:mes', gastoController.getGastosByMes);

// PUT /api/gastos/:id - Actualizar un gasto existente
router.put('/:id', gastoController.updateGasto);

// DELETE /api/gastos/:id - Eliminar un gasto
router.delete('/:id', gastoController.deleteGasto);

export { router as gastoRoutes };

