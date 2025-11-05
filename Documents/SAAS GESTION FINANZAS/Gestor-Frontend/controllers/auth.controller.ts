// Controlador de autenticación
// Lógica de negocio y orquestación de la autenticación
// Integración completa con backend MongoDB (sin fallback a mock)

import { authService } from '@/services/auth.service'
import type { LoginRequest, RegisterRequest, AuthError } from '@/models/auth'
import { saveToken, clearTokens, isTokenValid } from '@/utils/jwt'
import { getUsuarioActual, setAuth } from '@/lib/auth'

/**
 * Controlador de autenticación
 */
export const authController = {
  /**
   * Maneja el proceso de login
   * Integración directa con backend MongoDB
   */
  async login(credentials: LoginRequest): Promise<{ success: boolean; usuario?: any; error?: string }> {
    try {
      const response = await authService.login(credentials)
      
      // Actualizar estado de autenticación local
      setAuth(true, response.usuario)
      
      return {
        success: true,
        usuario: response.usuario,
      }
    } catch (error: any) {
      // Manejar errores específicos del backend
      const errorMessage = error.message || 'Error al iniciar sesión'
      
      // Mapear errores comunes
      if (error.status === 401) {
        return {
          success: false,
          error: 'Email o contraseña incorrectos',
        }
      }
      
      if (error.status === 400) {
        return {
          success: false,
          error: errorMessage,
        }
      }
      
      if (error.status === 0) {
        return {
          success: false,
          error: 'Error de conexión. Verifica que el servidor esté disponible.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },
  
  /**
   * Maneja el proceso de registro
   * Integración directa con backend MongoDB
   */
  async register(data: RegisterRequest): Promise<{ success: boolean; usuario?: any; error?: string }> {
    try {
      const response = await authService.register(data)
      
      // Actualizar estado de autenticación local
      setAuth(true, response.usuario)
      
      return {
        success: true,
        usuario: response.usuario,
      }
    } catch (error: any) {
      // Manejar errores específicos del backend
      const errorMessage = error.message || 'Error al registrar usuario'
      
      // Mapear errores comunes
      if (error.status === 409) {
        return {
          success: false,
          error: 'Este email ya está registrado',
        }
      }
      
      if (error.status === 400) {
        return {
          success: false,
          error: errorMessage,
        }
      }
      
      if (error.status === 0) {
        return {
          success: false,
          error: 'Error de conexión. Verifica que el servidor esté disponible.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },
  
  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    // Verificar token válido
    if (!isTokenValid()) {
      return false
    }
    
    // Verificar usuario en localStorage
    const usuario = getUsuarioActual()
    return !!usuario
  },
  
  /**
   * Obtiene el usuario actual
   */
  getCurrentUser() {
    return getUsuarioActual()
  },
  
  /**
   * Maneja el cierre de sesión
   */
  async logout(): Promise<void> {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      // Limpiar estado local
      clearTokens()
      setAuth(false)
    }
  },
  
  /**
   * Actualiza el usuario actual desde el backend
   * Útil para refrescar datos del usuario después de cambios
   */
  async refreshUser(): Promise<boolean> {
    try {
      const { usuario } = await authService.getCurrentUser()
      setAuth(true, usuario)
      return true
    } catch (error) {
      console.error('Error al refrescar usuario:', error)
      return false
    }
  },
}
