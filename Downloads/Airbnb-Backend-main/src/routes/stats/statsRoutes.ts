import { Router } from 'express';
import { Request, Response } from 'express';
import { getRateLimitStats, clearAllRateLimits, clearRateLimitForIP } from '../../middleware/rateLimiter';
import { cache } from '../../utils/cache';
import logger from '../../utils/logger';
import { authenticateToken, requireAdmin } from '../../middleware/auth/authMiddleware';

const router = Router();

// GET /api/stats - Estadísticas del sistema
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const rateLimitStats = getRateLimitStats();
    const cacheStats = cache.getStats();
    const loggerMetrics = logger.getMetrics();

    res.json({
      success: true,
      data: {
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          timestamp: new Date().toISOString()
        },
        rateLimiting: rateLimitStats,
        cache: cacheStats,
        logging: loggerMetrics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas' }
    });
  }
});

// GET /api/stats/logs - Ver logs del sistema
router.get('/logs', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, limit = 50 } = req.query;
    const logs = logger.getLogs(level as any, Number(limit));

    res.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        level: level || 'all'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo logs' }
    });
  }
});

// POST /api/stats/logs/clear - Limpiar logs
router.post('/logs/clear', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    logger.clearLogs();

    res.json({
      success: true,
      data: {
        message: 'Logs limpiados exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error limpiando logs' }
    });
  }
});

// POST /api/stats/rate-limits/clear - Limpiar todos los rate limits
router.post('/rate-limits/clear', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    clearAllRateLimits();

    res.json({
      success: true,
      data: {
        message: 'Todos los rate limits han sido limpiados exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error limpiando rate limits' }
    });
  }
});

// POST /api/stats/rate-limits/clear-dev - Limpiar rate limits para desarrollo (sin autenticación)
router.post('/rate-limits/clear-dev', async (req: Request, res: Response): Promise<void> => {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      res.status(403).json({
        success: false,
        error: { message: 'Este endpoint solo está disponible en desarrollo' }
      });
      return;
    }

    clearAllRateLimits();

    res.json({
      success: true,
      data: {
        message: 'Rate limits limpiados para desarrollo'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error limpiando rate limits' }
    });
  }
});

// POST /api/stats/rate-limits/clear/:ip - Limpiar rate limit de IP específica
router.post('/rate-limits/clear/:ip', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ip } = req.params;
    const cleared = clearRateLimitForIP(ip);

    res.json({
      success: true,
      data: {
        message: cleared ? `Rate limit limpiado para IP: ${ip}` : `No se encontró rate limit para IP: ${ip}`,
        cleared
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error limpiando rate limit' }
    });
  }
});

export default router;