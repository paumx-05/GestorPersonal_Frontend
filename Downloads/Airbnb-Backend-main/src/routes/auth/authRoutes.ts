import { Router } from 'express';
import { register, login, logout, getProfile, forgotPassword, resetPassword, refreshTokenEndpoint } from '../../controllers/auth/authController';
import { authenticateToken, optionalAuth } from '../../middleware/auth/authMiddleware';
import { authRateLimit } from '../../middleware/rateLimiter';

const router = Router();

// Aplicar rate limiting a todas las rutas de auth
router.use(authRateLimit);

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshTokenEndpoint);

// Rutas protegidas
router.get('/me', authenticateToken, getProfile);

// Ruta de prueba para verificar middleware
router.get('/test', optionalAuth, (req, res) => {
  const user = (req as any).user;
  
  res.json({
    success: true,
    data: {
      message: user ? `Hola ${user.email}` : 'Hola usuario anónimo',
      authenticated: !!user,
      user: user || null
    }
  });
});

export default router;
