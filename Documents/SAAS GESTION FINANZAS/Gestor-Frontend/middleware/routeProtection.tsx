// Middleware de protección de rutas
// Componente HOC y utilidades para proteger rutas que requieren autenticación

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authController } from '@/controllers/auth.controller'
import { isTokenValid, getToken } from '@/utils/jwt'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * Componente que protege una ruta verificando autenticación
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar autenticación mediante el controlador
        if (!authController.isAuthenticated()) {
          router.push(redirectTo)
          return
        }

        // Verificar token válido (JWT con expiración de 7 días según backend)
        const token = getToken()
        if (!token || !isTokenValid()) {
          router.push(redirectTo)
          return
        }
        
        // Si el token está expirado, el usuario debe hacer login nuevamente
        // (El backend no implementa refresh token según la documentación)

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

/**
 * Hook para verificar autenticación en componentes
 */
export function useAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authController.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }

    checkAuth()

    // Escuchar cambios en autenticación
    const handleAuthChange = () => {
      checkAuth()
    }

    window.addEventListener('authChange', handleAuthChange)
    return () => window.removeEventListener('authChange', handleAuthChange)
  }, [])

  const logout = async () => {
    await authController.logout()
    router.push('/login')
  }

  return {
    isAuthenticated,
    isLoading,
    usuario: authController.getCurrentUser(),
    logout,
  }
}

