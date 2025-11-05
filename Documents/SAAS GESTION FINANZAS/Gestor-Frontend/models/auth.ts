// Modelos de autenticación
// Define las interfaces y tipos relacionados con autenticación
// Alineados con la respuesta del backend

export interface Usuario {
  id: string
  nombre: string
  email: string
  descripcion?: string | null
  avatar?: string | null
  role?: 'regular' | 'admin'
  fechaCreacion?: string // ISO date string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  email: string
  password: string
  descripcion?: string
}

// Respuesta del backend para login/register
export interface BackendAuthResponse {
  success: boolean
  data: {
    user: Usuario
    token: string
  }
  message?: string
}

// Respuesta del backend para /me
export interface BackendMeResponse {
  success: boolean
  data: Usuario
}

// Respuesta del backend para logout
export interface BackendLogoutResponse {
  success: boolean
  message: string
}

// Error del backend
export interface BackendError {
  success: false
  error: string
  message?: string
}

// Respuesta unificada para el frontend (después de procesar backend)
export interface AuthResponse {
  token: string
  usuario: Usuario
}

export interface AuthError {
  message: string
  code?: string
  status?: number
}

export interface AuthState {
  isAuthenticated: boolean
  usuario: Usuario | null
  token: string | null
  isLoading: boolean
}

