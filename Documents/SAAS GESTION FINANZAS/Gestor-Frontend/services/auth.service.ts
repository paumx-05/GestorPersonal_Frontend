// Servicio de autenticación
// Maneja las llamadas HTTP al backend para autenticación
// Integración completa con backend MongoDB (sin fallback a mock)

import { API_CONFIG } from '@/config/api'
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  BackendAuthResponse,
  BackendMeResponse,
  BackendLogoutResponse,
  BackendError,
  AuthError 
} from '@/models/auth'
import type { 
  ForgotPasswordResponse,
  ResetPasswordResponse 
} from '@/schemas/auth.schema'
import { saveToken, clearTokens, getToken } from '@/utils/jwt'
import { z } from 'zod'
import { 
  AuthResponseSchema, 
  MeResponseSchema, 
  LogoutResponseSchema,
  BackendErrorSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordResponseSchema
} from '@/schemas/auth.schema'

// Telemetría básica: logs de red y latencia
const logRequest = (endpoint: string, method: string, startTime: number) => {
  const duration = Date.now() - startTime
  console.log(`[API] ${method} ${endpoint} - ${duration}ms`)
}

const logError = (endpoint: string, method: string, status: number, error: string) => {
  console.error(`[API ERROR] ${method} ${endpoint} - ${status}: ${error}`)
}

/**
 * Realiza una petición HTTP al backend con manejo de errores y validación
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const token = getToken()
  const startTime = Date.now()
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  // Agregar token de autenticación si existe
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    }
    
    // Log detallado del request (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('[API DEBUG]', {
        method: options.method || 'GET',
        url,
        headers: requestOptions.headers,
        body: options.body ? JSON.parse(options.body as string) : undefined,
      })
    }
    
    const response = await fetch(url, requestOptions)
    
    const data = await response.json()
    
    // Log de request
    logRequest(endpoint, options.method || 'GET', startTime)
    
    if (!response.ok) {
      // Intentar parsear como error del backend
      const errorData = BackendErrorSchema.safeParse(data)
      
      const error: AuthError = {
        message: errorData.success 
          ? errorData.data.error 
          : data.error || data.message || `Error ${response.status}: ${response.statusText}`,
        status: response.status,
      }
      
      logError(endpoint, options.method || 'GET', response.status, error.message)
      
      // Si es 401, limpiar tokens automáticamente
      if (response.status === 401) {
        clearTokens()
      }
      
      throw error
    }
    
    // Validar respuesta con schema si se proporciona
    if (schema) {
      const validated = schema.safeParse(data)
      if (!validated.success) {
        console.error('[VALIDATION ERROR]', validated.error)
        throw {
          message: 'Respuesta del servidor inválida',
          status: response.status,
        } as AuthError
      }
      return validated.data
    }
    
    return data
  } catch (error: any) {
    logError(endpoint, options.method || 'GET', error.status || 0, error.message || 'Network error')
    
    // Si es error de timeout o red
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw {
        message: 'Error de conexión. Verifica que el servidor esté disponible.',
        status: 0,
      } as AuthError
    }
    
    throw error
  }
}

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Inicia sesión con email y contraseña
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Validar request
    const validated = LoginRequestSchema.safeParse(credentials)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as AuthError
    }
    
    const response = await fetchAPI<BackendAuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      AuthResponseSchema
    )
    
    // Guardar token
    saveToken(response.data.token)
    
    // Transformar respuesta del backend al formato del frontend
    return {
      token: response.data.token,
      usuario: response.data.user,
    }
  },
  
  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Validar request
    const validated = RegisterRequestSchema.safeParse(data)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as AuthError
    }
    
    const response = await fetchAPI<BackendAuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      AuthResponseSchema
    )
    
    // Guardar token
    saveToken(response.data.token)
    
    // Transformar respuesta del backend al formato del frontend
    return {
      token: response.data.token,
      usuario: response.data.user,
    }
  },
  
  /**
   * Obtiene el usuario actual autenticado
   */
  async getCurrentUser(): Promise<{ usuario: any }> {
    const response = await fetchAPI<BackendMeResponse>(
      API_CONFIG.ENDPOINTS.AUTH.ME,
      {
        method: 'GET',
      },
      MeResponseSchema
    )
    
    return {
      usuario: response.data,
    }
  },
  
  /**
   * Cierra sesión
   */
  async logout(): Promise<void> {
    try {
      // El logout no requiere validación estricta de respuesta
      await fetchAPI(
        API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
        {
          method: 'POST',
        }
      )
    } catch (error) {
      // Incluso si falla, limpiar tokens localmente
      console.error('Error al cerrar sesión:', error)
    } finally {
      clearTokens()
    }
  },
  
  /**
   * Solicita reset de contraseña
   */
  async forgotPassword(email: string): Promise<{ 
    message: string
    resetToken?: string
    resetLink?: string
  }> {
    // Validar request
    const validated = ForgotPasswordRequestSchema.safeParse({ email })
    if (!validated.success) {
      console.error('[FORGOT PASSWORD] Error de validación:', validated.error.issues)
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as AuthError
    }
    
    console.log('[FORGOT PASSWORD] Datos validados:', validated.data)
    console.log('[FORGOT PASSWORD] Endpoint:', API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD)
    console.log('[FORGOT PASSWORD] BASE_URL:', API_CONFIG.BASE_URL)
    console.log('[FORGOT PASSWORD] URL completa:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD}`)
    
    const response = await fetchAPI<ForgotPasswordResponse>(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      ForgotPasswordResponseSchema
    )
    
    console.log('[FORGOT PASSWORD] Respuesta del API:', response)
    
    return {
      message: response.message,
      resetToken: response.resetToken, // Solo en desarrollo
      resetLink: response.resetLink, // Solo en desarrollo - enlace completo
    }
  },
  
  /**
   * Restablece la contraseña con token
   * El token debe ser decodificado si viene de URL (puede estar codificado)
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Decodificar token si viene de URL (puede estar codificado)
    const cleanToken = decodeURIComponent(token)
    
    // Validar request
    const validated = ResetPasswordRequestSchema.safeParse({ token: cleanToken, newPassword })
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as AuthError
    }
    
    const response = await fetchAPI<ResetPasswordResponse>(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      ResetPasswordResponseSchema
    )
    
    return {
      message: response.message,
    }
  },
}
