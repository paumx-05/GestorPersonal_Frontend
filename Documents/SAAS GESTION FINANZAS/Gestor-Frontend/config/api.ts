// Configuración de la API
// Centraliza la URL base del backend y configuración de endpoints

export const API_CONFIG = {
  // URL base del backend - debe ser configurada via variable de entorno
  // Según documentación: http://localhost:4444
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444',
  
  // Endpoints de autenticación
  // Formato: /api/auth/<endpoint>
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me', // Obtener usuario actual
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    USERS: {
      PROFILE: '/api/users/profile', // Obtener perfil
      UPDATE_PROFILE: '/api/users/profile', // Actualizar perfil
    }
  },
  
  // Timeout para requests (ms)
  TIMEOUT: 10000,
}

