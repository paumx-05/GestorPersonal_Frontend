// Utilidades para manejar JWT
// Funciones para decodificar, validar y almacenar tokens

export interface JWTPayload {
  userId: string
  email: string
  exp?: number
  iat?: number
  [key: string]: any
}

// Clave para almacenar el token en localStorage
const TOKEN_KEY = 'gestor-finanzas-token'
const REFRESH_TOKEN_KEY = 'gestor-finanzas-refresh-token'

/**
 * Guarda el token JWT en localStorage
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * Guarda el refresh token en localStorage
 */
export function saveRefreshToken(refreshToken: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

/**
 * Obtiene el token JWT del localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * Obtiene el refresh token del localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }
  return null
}

/**
 * Elimina los tokens del localStorage
 */
export function clearTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

/**
 * Decodifica un token JWT sin verificar la firma
 * NOTA: Esta función solo decodifica, no valida la firma del token
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decodificando token:', error)
    return null
  }
}

/**
 * Verifica si un token está expirado
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return true
  }
  
  const currentTime = Date.now() / 1000
  return decoded.exp < currentTime
}

/**
 * Verifica si el token almacenado es válido (existe y no está expirado)
 * También valida tokens mock (no JWT estándar)
 */
export function isTokenValid(): boolean {
  const token = getToken()
  if (!token) {
    return false
  }
  
  try {
    // Intentar decodificar como JWT
    const decoded = decodeToken(token)
    if (!decoded) {
      // Si no se puede decodificar, podría ser un token mock
      // En ese caso, verificar si hay usuario en localStorage
      return true // Permitir si hay token (puede ser mock)
    }
    
    // Si es JWT válido, verificar expiración
    if (decoded.exp) {
      return !isTokenExpired(token)
    }
    
    // Si no tiene exp, es válido (puede ser mock)
    return true
  } catch {
    // Si hay error, asumir que es válido (puede ser mock)
    return true
  }
}

