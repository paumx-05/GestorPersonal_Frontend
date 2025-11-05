'use client'

// Página de Perfil de Usuario
// Permite visualizar y editar información del perfil del usuario

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, getUsuarioActual } from '@/lib/auth'

interface PerfilUsuario {
  nombre: string
  email: string
  descripcion: string
  avatar: string
}

// Función para obtener la clave de localStorage para el perfil
function getStorageKey(userId?: string): string {
  const usuarioId = userId || (typeof window !== 'undefined' ? getUsuarioActual()?.id : null) || 'default'
  return `gestor-finanzas-perfil-${usuarioId}`
}

// Función para obtener el perfil del usuario
function getPerfil(userId?: string): PerfilUsuario {
  if (typeof window !== 'undefined') {
    const key = getStorageKey(userId)
    const perfil = localStorage.getItem(key)
    if (perfil) {
      return JSON.parse(perfil)
    }
    
    // Si no hay perfil guardado, usar datos del usuario actual
    const usuario = getUsuarioActual()
    if (usuario) {
      return {
        nombre: usuario.nombre,
        email: usuario.email,
        descripcion: '',
        avatar: ''
      }
    }
  }
  // Perfil por defecto
  return {
    nombre: 'Usuario',
    email: '',
    descripcion: '',
    avatar: ''
  }
}

// Función para guardar el perfil
function savePerfil(perfil: PerfilUsuario, userId?: string) {
  if (typeof window !== 'undefined') {
    const key = getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(perfil))
  }
}

export default function PerfilPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<PerfilUsuario>({
    nombre: '',
    email: '',
    descripcion: '',
    avatar: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  // Verificar autenticación y cargar perfil
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Cargar perfil del usuario actual
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const perfilData = getPerfil(usuarioActual.id)
      setPerfil(perfilData)
    }
  }, [router])

  // Función para manejar cambios en los campos
  const handleChange = (field: keyof PerfilUsuario, value: string) => {
    setPerfil(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Función para guardar cambios
  const handleSave = () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      savePerfil(perfil, usuarioActual.id)
      setIsEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  // Función para cancelar edición
  const handleCancel = () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const perfilData = getPerfil(usuarioActual.id)
      setPerfil(perfilData)
      setIsEditing(false)
    }
  }

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  return (
    <div className="perfil-page">
      <div className="perfil-container">
        {/* Header de la página */}
        <div className="perfil-header">
          <h1 className="perfil-title">Mi Perfil</h1>
          <p className="perfil-subtitle">Gestiona tu información personal</p>
        </div>

        {/* Card principal del perfil */}
        <div className="perfil-card">
          {/* Sección de Avatar y Nombre */}
          <div className="perfil-avatar-section">
            <div className="perfil-avatar-container">
              {perfil.avatar ? (
                <img 
                  src={perfil.avatar} 
                  alt={perfil.nombre}
                  className="perfil-avatar-image"
                />
              ) : (
                <div className="perfil-avatar-placeholder">
                  {getInitials(perfil.nombre)}
                </div>
              )}
            </div>
            <div className="perfil-name-section">
              {isEditing ? (
                <input
                  type="text"
                  className="perfil-input perfil-input-large"
                  value={perfil.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Nombre completo"
                />
              ) : (
                <h2 className="perfil-name">{perfil.nombre || 'Usuario'}</h2>
              )}
              <p className="perfil-email">{perfil.email}</p>
            </div>
          </div>

          {/* Descripción */}
          <div className="perfil-section">
            <label className="perfil-label">Descripción</label>
            {isEditing ? (
              <textarea
                className="perfil-textarea"
                value={perfil.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                rows={4}
              />
            ) : (
              <div className="perfil-description">
                {perfil.descripcion || 'No hay descripción disponible.'}
              </div>
            )}
          </div>

          {/* Opciones del perfil */}
          <div className="perfil-section">
            <h3 className="perfil-section-title">Opciones del Perfil</h3>
            
            <div className="perfil-options-grid">
              <div className="perfil-option-card">
                <div className="perfil-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h4 className="perfil-option-title">Información Personal</h4>
                <p className="perfil-option-description">Actualiza tu información básica</p>
              </div>

              <div className="perfil-option-card">
                <div className="perfil-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <h4 className="perfil-option-title">Seguridad</h4>
                <p className="perfil-option-description">Cambia tu contraseña y configuración de seguridad</p>
              </div>

              <div className="perfil-option-card">
                <div className="perfil-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h4 className="perfil-option-title">Facturación</h4>
                <p className="perfil-option-description">Gestiona tu plan y métodos de pago</p>
              </div>

              <div className="perfil-option-card">
                <div className="perfil-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                  </svg>
                </div>
                <h4 className="perfil-option-title">Preferencias</h4>
                <p className="perfil-option-description">Configura notificaciones y preferencias</p>
              </div>

              <div className="perfil-option-card">
                <div className="perfil-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                </div>
                <h4 className="perfil-option-title">Privacidad</h4>
                <p className="perfil-option-description">Controla quién puede ver tu información</p>
              </div>

              <div className="perfil-option-card">
                <div className="perfil-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-8.91 8.91a2.12 2.12 0 0 1-3-3l8.91-8.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                  </svg>
                </div>
                <h4 className="perfil-option-title">Exportar Datos</h4>
                <p className="perfil-option-description">Descarga una copia de tus datos</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="perfil-actions">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  className="btn btn-primary"
                >
                  Guardar Cambios
                </button>
                <button 
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Editar Perfil
              </button>
            )}
            {saved && (
              <span className="perfil-saved-message">✓ Cambios guardados</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

