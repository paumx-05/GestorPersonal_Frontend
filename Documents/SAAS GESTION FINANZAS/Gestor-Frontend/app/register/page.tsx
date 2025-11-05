'use client'

// Página de registro
// Formulario para crear una nueva cuenta con soporte para JWT backend

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authController } from '@/controllers/auth.controller'

export default function RegisterPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validar contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setLoading(false)
      return
    }

    try {
      // Usar el controlador de autenticación integrado con backend MongoDB
      const result = await authController.register({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(), // Normalizar email
        password: password,
      })

      if (result.success && result.usuario) {
        // Registro exitoso - redirigir al dashboard
        router.push('/dashboard')
      } else {
        // Error en registro
        setError(result.error || 'Error al crear la cuenta')
        setLoading(false)
      }
    } catch (error: any) {
      setError(error.message || 'Error al registrar usuario')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Comienza a gestionar tus finanzas hoy</p>

          {/* Mensaje de error */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Campo de nombre */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nombre completo</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={loading}
              />
            </div>

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
                minLength={8}
                disabled={loading}
              />
            </div>

            {/* Campo de confirmar contraseña */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar contraseña
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
                minLength={8}
                disabled={loading}
              />
            </div>

            {/* Checkbox de términos */}
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-input" required disabled={loading} />
                <span>
                  Acepto los{' '}
                  <a href="#" className="form-link-inline">términos y condiciones</a>
                </span>
              </label>
            </div>

            {/* Botón de submit */}
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Enlace a login */}
          <p className="auth-footer">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="auth-link">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  )
}

