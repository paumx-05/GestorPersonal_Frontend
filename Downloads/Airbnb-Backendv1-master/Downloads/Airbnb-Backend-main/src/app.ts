import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { register } from './controllers/auth/authController';
import authRoutes from './routes/auth/authRoutes';
import notificationRoutes from './routes/notifications/notificationRoutes';
import profileRoutes from './routes/profile/profileRoutes';
import searchRoutes from './routes/search/searchRoutes';
import propertyRoutes from './routes/properties/propertyRoutes';
import statsRoutes from './routes/stats/statsRoutes';
import reservationRoutes from './routes/reservations/reservationRoutes';
import reviewRoutes from './routes/reviews/reviewRoutes';
import hostRoutes from './routes/host/hostRoutes';
import favoriteRoutes from './routes/favorites/favoriteRoutes';
import paymentRoutes from './routes/payments/paymentRoutes';
import cartRoutes from './routes/cart/cartRoutes';
import userRoutes from './routes/users/userRoutes';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';
import { generalRateLimit } from './middleware/rateLimiter';
import { securityHeaders } from './middleware/security';

dotenv.config();
const app = express();

// =============================================================================
// MIDDLEWARES BÁSICOS (ORDEN IMPORTANTE)
// =============================================================================
// Middleware de seguridad con Helmet
app.use(helmet());

// Headers de seguridad personalizados adicionales
app.use(securityHeaders);

// CORS: Permite peticiones desde diferentes dominios
app.use(cors());

// Middleware de logging
app.use(morgan('combined'));

// Rate limiting general
app.use(generalRateLimit);

// Parsear JSON PRIMERO
app.use(express.json({ limit: '10mb' }));

// Parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (avatares)
app.use('/uploads', express.static('uploads'));

// =============================================================================
// RUTAS PRINCIPALES
// =============================================================================

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏠 Airbnb Backend API - Sistema Completo',
    data: {
      server: 'Airbnb Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          profile: 'GET /api/auth/me'
        },
        notifications: {
          list: 'GET /api/notifications',
          markRead: 'PATCH /api/notifications/:id/read',
          markAllRead: 'PATCH /api/notifications/mark-all-read',
          delete: 'DELETE /api/notifications/:id',
          clearAll: 'DELETE /api/notifications/clear-all',
          test: 'POST /api/notifications/test',
          settings: 'GET /api/notifications/settings',
          updateSettings: 'PUT /api/notifications/settings'
        },
        profile: {
          get: 'GET /api/profile',
          update: 'PATCH /api/profile (soporta JSON y FormData)',
          updateLegacy: 'PUT /api/profile (legacy)',
          changePassword: 'POST /api/profile/change-password',
          settings: 'GET /api/profile/settings',
          updateSettings: 'PUT /api/profile/settings'
        },
        search: {
          properties: 'GET /api/search/properties',
          suggestions: 'GET /api/search/suggestions',
          filters: 'GET /api/search/filters'
        },
        properties: {
          getAll: 'GET /api/properties',
          get: 'GET /api/properties/:id',
          popular: 'GET /api/properties/popular',
          update: 'PUT /api/properties/:id (admin only)',
          delete: 'DELETE /api/properties/:id (admin only)'
        },
        stats: {
          system: 'GET /api/stats',
          logs: 'GET /api/stats/logs',
          clearLogs: 'POST /api/stats/logs/clear'
        },
        reservations: {
          create: 'POST /api/reservations',
          myReservations: 'GET /api/reservations/my-reservations',
          propertyReservations: 'GET /api/reservations/property/:id',
          updateStatus: 'PATCH /api/reservations/:id/status',
          checkAvailability: 'GET /api/reservations/check-availability',
          calculatePrice: 'POST /api/reservations/calculate-price',
          stats: 'GET /api/reservations/stats'
        },
        reviews: {
          create: 'POST /api/reviews',
          propertyReviews: 'GET /api/reviews/property/:id',
          userReviews: 'GET /api/reviews/user/:id',
          propertyStats: 'GET /api/reviews/property/:id/stats',
          update: 'PUT /api/reviews/:id',
          delete: 'DELETE /api/reviews/:id',
          stats: 'GET /api/reviews/stats'
        },
        host: {
          properties: 'GET /api/host/properties',
          createProperty: 'POST /api/host/properties',
          getProperty: 'GET /api/host/properties/:id',
          updateProperty: 'PUT /api/host/properties/:id',
          deleteProperty: 'DELETE /api/host/properties/:id',
          propertyReservations: 'GET /api/host/properties/:id/reservations',
          propertyReviews: 'GET /api/host/properties/:id/reviews',
          stats: 'GET /api/host/stats'
        },
        favorites: {
          add: 'POST /api/favorites',
          remove: 'DELETE /api/favorites/:propertyId',
          list: 'GET /api/favorites',
          checkStatus: 'GET /api/favorites/:propertyId/status',
          createWishlist: 'POST /api/favorites/wishlists',
          getWishlists: 'GET /api/favorites/wishlists',
          getPublicWishlists: 'GET /api/favorites/wishlists/public',
          getWishlist: 'GET /api/favorites/wishlists/:id',
          updateWishlist: 'PUT /api/favorites/wishlists/:id',
          deleteWishlist: 'DELETE /api/favorites/wishlists/:id',
          addToWishlist: 'POST /api/favorites/wishlists/:id/properties',
          removeFromWishlist: 'DELETE /api/favorites/wishlists/:id/properties/:propertyId',
          stats: 'GET /api/favorites/stats'
        },
        payments: {
          calculate: 'POST /api/payments/checkout/calculate',
          process: 'POST /api/payments/checkout/process',
          methods: 'GET /api/payments/methods',
          transactions: 'GET /api/payments/transactions',
          transaction: 'GET /api/payments/transactions/:id',
          refund: 'POST /api/payments/transactions/:id/refund'
        },
        cart: {
          get: 'GET /api/cart',
          add: 'POST /api/cart/add',
          remove: 'DELETE /api/cart/remove/:itemId',
          update: 'PUT /api/cart/update/:itemId',
          clear: 'DELETE /api/cart/clear',
          summary: 'GET /api/cart/summary',
          item: 'GET /api/cart/item/:itemId',
          checkAvailability: 'POST /api/cart/check-availability',
          stats: 'GET /api/cart/stats'
        }
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de notificaciones
app.use('/api/notifications', notificationRoutes);

// Rutas de perfil
app.use('/api/profile', profileRoutes);

// Rutas de búsqueda
app.use('/api/search', searchRoutes);

// Rutas de propiedades
app.use('/api/properties', propertyRoutes);

// Rutas de estadísticas
app.use('/api/stats', statsRoutes);

// Rutas de reservas
app.use('/api/reservations', reservationRoutes);

// Rutas de reviews
app.use('/api/reviews', reviewRoutes);

// Rutas de host
app.use('/api/host', hostRoutes);

// Rutas de favoritos
app.use('/api/favorites', favoriteRoutes);

// Rutas de pagos
app.use('/api/payments', paymentRoutes);

// Rutas de carrito
app.use('/api/cart', cartRoutes);

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString()
    }
  });
});

// =============================================================================
// MANEJO DE ERRORES
// =============================================================================
// Middleware de manejo de errores
app.use(errorHandler);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Ruta no encontrada' }
  });
});

export default app;