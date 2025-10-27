/**
 * DOCUMENTACIÓN DINÁMICA DE API
 * Genera documentación automática de todos los endpoints
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

interface EndpointInfo {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  requestBody?: any;
  responseExample?: any;
  queryParams?: any;
}

const endpoints: EndpointInfo[] = [
  {
    method: 'POST',
    path: '/api/auth/register',
    description: 'Registrar nuevo usuario',
    auth: false,
    requestBody: {
      email: 'string (required)',
      password: 'string (required, min 6 chars)',
      name: 'string (required, min 2 chars)'
    },
    responseExample: {
      success: true,
      data: {
        user: {
          id: 'string',
          email: 'string',
          name: 'string',
          avatar: 'string'
        },
        token: 'string'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Iniciar sesión',
    auth: false,
    requestBody: {
      email: 'string (required)',
      password: 'string (required)'
    },
    responseExample: {
      success: true,
      data: {
        user: { /* user object */ },
        token: 'string'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/auth/forgot-password',
    description: 'Solicitar recuperación de contraseña',
    auth: false,
    requestBody: {
      email: 'string (required)'
    },
    responseExample: {
      success: true,
      data: {
        message: 'Si el email está registrado, recibirás instrucciones'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/auth/reset-password',
    description: 'Restablecer contraseña con token',
    auth: false,
    requestBody: {
      token: 'string (required)',
      newPassword: 'string (required, min 6 chars)'
    },
    responseExample: {
      success: true,
      data: {
        message: 'Contraseña restablecida exitosamente'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    description: 'Obtener perfil del usuario autenticado',
    auth: true,
    responseExample: {
      success: true,
      data: {
        user: { /* user object */ }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/users',
    description: 'Listar usuarios (con paginación)',
    auth: true,
    queryParams: {
      page: 'number (default: 1)',
      limit: 'number (default: 10, max: 100)',
      search: 'string (optional)'
    }
  },
  {
    method: 'GET',
    path: '/api/users/stats',
    description: 'Obtener estadísticas de usuarios',
    auth: true,
    responseExample: {
      success: true,
      data: {
        statistics: {
          total: 10,
          active: 8,
          inactive: 2
        }
      }
    }
  }
];

router.get('/', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      title: 'Airbnb Backend API Documentation',
      version: '1.0.0',
      description: 'API REST completa para el sistema Airbnb',
      baseUrl: `${req.protocol}://${req.get('host')}`,
      endpoints: endpoints.map(ep => ({
        ...ep,
        fullPath: `${req.protocol}://${req.get('host')}${ep.path}`,
        headers: ep.auth ? { 'Authorization': 'Bearer <token>' } : {}
      })),
      examples: {
        login: {
          url: `${req.protocol}://${req.get('host')}/api/auth/login`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            email: 'demo@airbnb.com',
            password: 'demo123'
          }
        },
        forgotPassword: {
          url: `${req.protocol}://${req.get('host')}/api/auth/forgot-password`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            email: 'demo@airbnb.com'
          }
        }
      }
    }
  });
});

export default router;
