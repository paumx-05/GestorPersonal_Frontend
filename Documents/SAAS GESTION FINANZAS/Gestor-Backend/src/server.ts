import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { exampleRoutes } from './routes/example.routes';
import { authRoutes } from './routes/auth.routes';
import { usersRoutes } from './routes/users.routes';
import { amigoRoutes } from './routes/amigo.routes';
import { gastoRoutes } from './routes/gasto.routes';
import { ingresoRoutes } from './routes/ingreso.routes';
import { mensajeRoutes } from './routes/mensaje.routes';
import { chatRoutes } from './routes/chat.routes';
import { notificacionRoutes } from './routes/notificacion.routes';
import { categoriaRoutes } from './routes/categoria.routes';
import { presupuestoRoutes } from './routes/presupuesto.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import carteraRoutes from './routes/cartera.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4444;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta raíz
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Bienvenido al API del Gestor Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      carteras: '/api/carteras',
      amigos: '/api/amigos',
      gastos: '/api/gastos',
      ingresos: '/api/ingresos',
      categorias: '/api/categorias',
      presupuestos: '/api/presupuestos',
      dashboard: '/api/dashboard',
      mensajes: '/api/mensajes',
      chat: '/api/chat',
      notificaciones: '/api/notificaciones',
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/example', exampleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/carteras', carteraRoutes);
app.use('/api/amigos', amigoRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/presupuestos', presupuestoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notificaciones', notificacionRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor (sin esperar MongoDB)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL local: http://localhost:${PORT}`);
  console.log(`🌐 URL red: http://0.0.0.0:${PORT}`);
  console.log(`📡 El servidor está escuchando en todas las interfaces de red`);
  
  // Intentar conectar a MongoDB en segundo plano
  connectDatabase()
    .then(() => {
      console.log('📦 Base de datos: MongoDB Atlas');
    })
    .catch((error) => {
      console.error('⚠️  Error al conectar con MongoDB:', error instanceof Error ? error.message : error);
      console.warn('⚠️  El servidor continuará, pero algunas funciones pueden no funcionar');
    });
});

export default app;

