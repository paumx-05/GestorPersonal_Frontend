'use client'

// Página de recuperación de contraseña (forgot password)
// Permite solicitar un token para restablecer la contraseña

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [resetLink, setResetLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // Validar que el email no esté vacío
    const emailValue = email.trim().toLowerCase()
    if (!emailValue) {
      setError('Por favor ingresa un email')
      setLoading(false)
      return
    }

    try {
      console.log('[FORGOT PASSWORD] Enviando request para:', emailValue)
      const result = await authService.forgotPassword(emailValue)
      console.log('[FORGOT PASSWORD] Respuesta recibida:', result)

      setSuccess(true)
      
      // En desarrollo, el token y link vienen en la respuesta
      if (result.resetToken) {
        setResetToken(result.resetToken)
        console.log('[FORGOT PASSWORD] Token recibido:', result.resetToken)
      }
      if (result.resetLink) {
        setResetLink(result.resetLink)
        console.log('[FORGOT PASSWORD] Link recibido:', result.resetLink)
      }
    } catch (error: any) {
      console.error('[FORGOT PASSWORD] Error:', error)
      // Manejar errores específicos
      if (error.status === 400) {
        setError(error.message || 'Email inválido')
      } else if (error.status === 0) {
        setError('Error de conexión. Verifica que el servidor esté disponible.')
      } else {
        setError(error.message || 'Error al procesar la solicitud')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Recuperar Contraseña</h1>
          <p className="auth-subtitle">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
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
              <p style={{ margin: 0, fontWeight: 'bold' }}>✓ Solicitud enviada</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                {process.env.NODE_ENV === 'development' && resetToken
                  ? 'En desarrollo: Token disponible'
                  : 'Si el email existe, recibirás un enlace para restablecer tu contraseña.'}
              </p>
              
              {/* En desarrollo, mostrar token y link */}
              {process.env.NODE_ENV === 'development' && resetToken && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Token de reset:</p>
                  <code style={{ display: 'block', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                    {resetToken}
                  </code>
                  {resetLink && (
                    <>
                      <p style={{ margin: '0.5rem 0 0.25rem 0', fontWeight: 'bold' }}>Enlace completo:</p>
                      <code style={{ display: 'block', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                        {resetLink}
                      </code>
                    </>
                  )}
                  <Link 
                    href={resetLink || `/reset-password?token=${encodeURIComponent(resetToken)}`}
                    className="btn btn-primary"
                    style={{ display: 'inline-block', marginTop: '0.5rem' }}
                  >
                    Restablecer Contraseña
                  </Link>
                </div>
              )}
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

              {/* Botón de submit */}
              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
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
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="auth-link">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

