import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as amigoController from '../controllers/amigo.controller';

const router = Router();

// Todas las rutas de amigos requieren autenticación
router.use(authenticate);

// GET /api/amigos - Obtener todos los amigos
router.get('/', amigoController.getAmigos);

// GET /api/amigos/search?q= - Buscar amigos por nombre o email
router.get('/search', amigoController.searchAmigos);

// GET /api/amigos/estado/:estado - Obtener amigos por estado
router.get('/estado/:estado', amigoController.getAmigosByEstado);

// GET /api/amigos/:id - Obtener un amigo por ID
router.get('/:id', amigoController.getAmigoById);

// POST /api/amigos - Crear un nuevo amigo
router.post('/', amigoController.createAmigo);

// PUT /api/amigos/:id - Actualizar un amigo existente
router.put('/:id', amigoController.updateAmigo);

// PUT /api/amigos/:id/estado - Actualizar estado de un amigo
router.put('/:id/estado', amigoController.updateEstadoAmigo);

// DELETE /api/amigos/:id - Eliminar un amigo
router.delete('/:id', amigoController.deleteAmigo);

export { router as amigoRoutes };


