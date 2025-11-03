/**
 * 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO
 * Centraliza todas las variables de entorno del sistema
 */

export const config = {
  // Configuración del servidor
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración de base de datos
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://airbnb-user:airbnb-password@airbnb-cluster.mongodb.net/airbnb-backend?retryWrites=true&w=majority',
  dbType: process.env.DB_TYPE || 'mongodb',
  
  // Configuración JWT
  jwtSecret: process.env.JWT_SECRET || 'airbnb-backend-super-secret-jwt-key-2024-production-ready',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Configuración de CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Configuración de rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests por ventana
  
  // Configuración de logs
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Configuración de desarrollo
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // URLs y paths
  apiPrefix: process.env.API_PREFIX || '/api',
  uploadsPath: process.env.UPLOADS_PATH || './uploads',
  
  // Configuración de email (para futuras implementaciones)
  emailService: process.env.EMAIL_SERVICE || 'mock',
  emailFrom: process.env.EMAIL_FROM || 'noreply@airbnb-backend.com',
  
  // Configuración de seguridad
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production'
};

export default config;
