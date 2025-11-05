'use client'

// Página de restablecimiento de contraseña (reset password)
// Permite restablecer la contraseña usando el token recibido

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Obtener token de la URL si existe
  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      // Decodificar token si viene de URL (puede estar codificado)
      const decodedToken = decodeURIComponent(urlToken)
      setToken(decodedToken)
    } else {
      // En desarrollo, intentar obtener de localStorage si existe
      if (process.env.NODE_ENV === 'development') {
        const storedToken = localStorage.getItem('resetToken')
        if (storedToken) {
          setToken(storedToken)
        }
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // Validar contraseñas
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (!token) {
      setError('Token de restablecimiento requerido')
      setLoading(false)
      return
    }

    try {
      // El servicio ya decodifica el token, pero lo hacemos aquí también por seguridad
      const cleanToken = decodeURIComponent(token)
      
      await authService.resetPassword(cleanToken, newPassword)
      setSuccess(true)
      
      // Limpiar token de localStorage si existe (solo desarrollo)
      if (process.env.NODE_ENV === 'development') {
        localStorage.removeItem('resetToken')
      }
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      // Manejar errores específicos
      if (error.status === 400) {
        if (error.message.includes('token') || error.message.includes('Token')) {
          setError('Token inválido o expirado. Solicita uno nuevo.')
        } else {
          setError(error.message || 'Contraseña inválida')
        }
      } else if (error.status === 404) {
        setError('Usuario no encontrado')
      } else if (error.status === 0) {
        setError('Error de conexión. Verifica que el servidor esté disponible.')
      } else {
        setError(error.message || 'Error al restablecer la contraseña')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Restablecer Contraseña</h1>
          <p className="auth-subtitle">
            Ingresa tu nueva contraseña para restablecer tu cuenta
          </p>

          {/* Mensaje de éxito */}
          {success && (
            <div className="auth-success" style={{ 
              backgroundColor: '#d1fae5', 
              color: '#065f46', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>✓ Contraseña restablecida exitosamente</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                Redirigiendo al login...
              </p>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

      {!success && (
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Campo de token (si no viene en URL) */}
          {!searchParams.get('token') && (
            <div className="form-group">
              <label htmlFor="token" className="form-label">Token de Restablecimiento</label>
              <input
                type="text"
                id="token"
                name="token"
                className="form-input"
                placeholder="Pega aquí el token recibido"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                disabled={loading}
              />
              <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {process.env.NODE_ENV === 'development'
                  ? 'El token se envía por email o aparece en la respuesta de forgot-password'
                  : 'El token se envía por email. Copia el token del enlace recibido.'}
              </small>
              {!token && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <Link href="/forgot-password" className="auth-link">
                    Solicitar nuevo token
                  </Link>
                </div>
              )}
            </div>
          )}

              {/* Campo de nueva contraseña */}
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  Mínimo 6 caracteres
                </small>
              </div>

              {/* Campo de confirmar contraseña */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

          {/* Botón de submit */}
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading || !token}
          >
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>
      )}

          {/* Enlaces */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p className="auth-footer">
              ¿Recordaste tu contraseña?{' '}
              <Link href="/login" className="auth-link">Inicia sesión aquí</Link>
            </p>
            <p className="auth-footer" style={{ marginTop: '0.5rem' }}>
              ¿Necesitas un nuevo token?{' '}
              <Link href="/forgot-password" className="auth-link">Solicítalo aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

