import { Router } from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllNotificationsAsRead, 
  removeNotification, 
  clearAllUserNotifications,
  createTestNotification,
  getUserNotificationSettings,
  updateUserNotificationSettings
} from '../../controllers/notifications/notificationController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de notificaciones
// IMPORTANTE: Las rutas específicas deben ir antes de las rutas con parámetros dinámicos
router.get('/', getNotifications);
router.patch('/mark-all-read', markAllNotificationsAsRead);
router.delete('/clear-all', clearAllUserNotifications);
router.post('/test', createTestNotification);
router.get('/settings', getUserNotificationSettings);
router.put('/settings', updateUserNotificationSettings);
router.patch('/:id/read', markAsRead);
router.delete('/:id', removeNotification);

export default router;
