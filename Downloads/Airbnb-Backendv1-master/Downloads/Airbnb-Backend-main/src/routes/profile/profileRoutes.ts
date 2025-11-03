import { Router } from 'express';
import { 
  getProfile,
  updateProfile,
  patchProfile, 
  changePassword, 
  getProfileSettings, 
  updateProfileSettings 
} from '../../controllers/profile/profileController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';
import { uploadAvatar, handleMulterError } from '../../middleware/upload/avatarUpload';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de perfil
router.get('/', getProfile);
// PATCH - Endpoint unificado según requisitos del frontend (soporta JSON y FormData)
router.patch('/', uploadAvatar, handleMulterError, patchProfile);
// PUT - Mantener para compatibilidad
router.put('/', updateProfile);
router.post('/change-password', changePassword);
router.get('/settings', getProfileSettings);
router.put('/settings', updateProfileSettings);

export default router;
