'use client'

// Página de inicio de sesión
// Formulario para autenticación de usuarios con soporte para JWT backend

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authController } from '@/controllers/auth.controller'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Función para manejar el submit del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Usar el controlador de autenticación integrado con backend MongoDB
      const result = await authController.login({ 
        email: email.trim().toLowerCase(), // Normalizar email
        password 
      })

      if (result.success && result.usuario) {
        // Autenticación exitosa - redirigir al dashboard
        router.push('/dashboard')
      } else {
        // Error en autenticación
        setError(result.error || 'Email o contraseña incorrectos')
        setLoading(false)
      }
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-subtitle">Accede a tu cuenta de Gestor Finanzas</p>

          {/* Mensaje de error */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Campo de email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Campo de contraseña */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Opción de recordar sesión */}
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-input" disabled={loading} />
                <span>Recordar sesión</span>
              </label>
              <Link href="/forgot-password" className="form-link">¿Olvidaste tu contraseña?</Link>
            </div>

            {/* Botón de submit */}
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Información de demo - Solo en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="auth-demo">
              <p className="auth-demo-text">
                <strong>Modo desarrollo:</strong><br />
                Si el backend no está disponible, se usará autenticación mock
              </p>
            </div>
          )}

          {/* Enlace a registro */}
          <p className="auth-footer">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="auth-link">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  )
}
