// Utilidades para manejar autenticación
// Funciones para guardar y verificar el estado de autenticación
// Compatible con sistema mock y JWT

export const AUTH_KEY = 'gestor-finanzas-auth'
export const USER_KEY = 'gestor-finanzas-user'
export const USERS_KEY = 'gestor-finanzas-users'

export interface Usuario {
  id: string
  nombre: string
  email: string
  password: string
}

// Usuarios mock predefinidos (incluyendo los amigos)
const USUARIOS_MOCK: Usuario[] = [
  {
    id: 'user-main',
    nombre: 'Usuario Principal',
    email: 'gestion@gmail.com',
    password: '12345678'
  },
  {
    id: 'mock-1',
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    password: '12345678'
  },
  {
    id: 'mock-2',
    nombre: 'María García',
    email: 'maria.garcia@example.com',
    password: '12345678'
  },
  {
    id: 'mock-3',
    nombre: 'Carlos López',
    email: 'carlos.lopez@example.com',
    password: '12345678'
  }
]

// Inicializar usuarios mock si no existen
export function inicializarUsuariosMock() {
  if (typeof window !== 'undefined') {
    const usuarios = localStorage.getItem(USERS_KEY)
    if (!usuarios) {
      localStorage.setItem(USERS_KEY, JSON.stringify(USUARIOS_MOCK))
    }
  }
}

// Función para obtener todos los usuarios
export function getUsuarios(): Usuario[] {
  if (typeof window !== 'undefined') {
    inicializarUsuariosMock()
    const usuarios = localStorage.getItem(USERS_KEY)
    return usuarios ? JSON.parse(usuarios) : USUARIOS_MOCK
  }
  return USUARIOS_MOCK
}

// Función para agregar un nuevo usuario
export function agregarUsuario(usuario: Usuario) {
  if (typeof window !== 'undefined') {
    const usuarios = getUsuarios()
    // Verificar si el email ya existe
    if (usuarios.some(u => u.email === usuario.email)) {
      return false // Email ya existe
    }
    usuarios.push(usuario)
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios))
    return true
  }
  return false
}

// Función para verificar credenciales
export function verificarCredenciales(email: string, password: string): Usuario | null {
  const usuarios = getUsuarios()
  const usuario = usuarios.find(u => u.email === email && u.password === password)
  return usuario || null
}

// Función para guardar el estado de autenticación y usuario actual
export function setAuth(isAuthenticated: boolean, usuario?: Usuario) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(isAuthenticated))
    if (usuario) {
      localStorage.setItem(USER_KEY, JSON.stringify(usuario))
    } else if (!isAuthenticated) {
      // Si no está autenticado, limpiar usuario
      localStorage.removeItem(USER_KEY)
    }
    // Disparar evento personalizado para notificar cambios de autenticación
    window.dispatchEvent(new Event('authChange'))
  }
}

// Función para obtener el estado de autenticación
export function getAuth(): boolean {
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem(AUTH_KEY)
    return auth ? JSON.parse(auth) : false
  }
  return false
}

// Función para obtener el usuario actual
export function getUsuarioActual(): Usuario | null {
  if (typeof window !== 'undefined') {
    const usuario = localStorage.getItem(USER_KEY)
    return usuario ? JSON.parse(usuario) : null
  }
  return null
}

// Función para cerrar sesión
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(USER_KEY)
    // Disparar evento personalizado para notificar cambios de autenticación
    window.dispatchEvent(new Event('authChange'))
  }
}

// Exportar tipos para compatibilidad
export type { Usuario } from '@/models/auth'

