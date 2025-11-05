'use client'

// Página de Amigos
// Permite gestionar la lista de amigos del usuario

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuth } from '@/lib/auth'

interface Amigo {
  id: string
  nombre: string
  email: string
  avatar?: string
  fechaAmistad: string
  estado: 'activo' | 'pendiente' | 'bloqueado'
}

import { getUsuarioActual } from '@/lib/auth'

// Función para obtener la clave de localStorage para amigos
function getStorageKey(userId?: string): string {
  const usuarioId = userId || (typeof window !== 'undefined' ? getUsuarioActual()?.id : null) || 'default'
  return `gestor-finanzas-amigos-${usuarioId}`
}

// Función para obtener amigos
function getAmigos(userId?: string): Amigo[] {
  if (typeof window !== 'undefined') {
    const key = getStorageKey(userId)
    const amigos = localStorage.getItem(key)
    if (amigos) {
      return JSON.parse(amigos)
    }
  }
  return []
}

// Función para guardar amigos
function saveAmigos(amigos: Amigo[], userId?: string) {
  if (typeof window !== 'undefined') {
    const key = getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(amigos))
  }
}

export default function AmigosPage() {
  const router = useRouter()
  const [amigos, setAmigos] = useState<Amigo[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'activos' | 'pendientes' | 'bloqueados'>('todos')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombreAmigo, setNombreAmigo] = useState('')
  const [emailAmigo, setEmailAmigo] = useState('')

  // Verificar autenticación y cargar amigos
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Cargar amigos del usuario actual
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const amigosData = getAmigos(usuarioActual.id)
      
      // Verificar si necesita corrección
      let necesitaCorreccion = false
      let amigosMock: Amigo[] = []
      
      // Usuario principal debe tener los 3 amigos mock
      if (usuarioActual.id === 'user-main') {
        const amigosEsperados = ['mock-1', 'mock-2', 'mock-3']
        const tieneTodosLosAmigos = amigosEsperados.every(id => 
          amigosData.some(a => a.id === id)
        )
        if (amigosData.length === 0 || !tieneTodosLosAmigos || amigosData.length !== 3) {
          necesitaCorreccion = true
          amigosMock = [
            {
              id: 'mock-1',
              nombre: 'Juan Pérez',
              email: 'juan.perez@example.com',
              fechaAmistad: new Date().toISOString(),
              estado: 'activo' as const
            },
            {
              id: 'mock-2',
              nombre: 'María García',
              email: 'maria.garcia@example.com',
              fechaAmistad: new Date().toISOString(),
              estado: 'activo' as const
            },
            {
              id: 'mock-3',
              nombre: 'Carlos López',
              email: 'carlos.lopez@example.com',
              fechaAmistad: new Date().toISOString(),
              estado: 'activo' as const
            }
          ]
        }
      } 
      // Juan Pérez (y otros usuarios) solo deben tener al usuario principal
      else {
        const tieneUsuarioPrincipal = amigosData.some(a => a.id === 'user-main')
        const tieneASiMismo = amigosData.some(a => a.id === usuarioActual.id)
        if (amigosData.length === 0 || !tieneUsuarioPrincipal || tieneASiMismo || amigosData.length !== 1) {
          necesitaCorreccion = true
          amigosMock = [
            {
              id: 'user-main',
              nombre: 'Usuario Principal',
              email: 'gestion@gmail.com',
              fechaAmistad: new Date().toISOString(),
              estado: 'activo' as const
            }
          ]
        }
      }
      
      // Si necesita corrección, guardar los amigos correctos
      if (necesitaCorreccion) {
        saveAmigos(amigosMock, usuarioActual.id)
        setAmigos(amigosMock)
      } else {
        setAmigos(amigosData)
      }
    }
  }, [router])

  // Filtrar y buscar amigos
  const amigosFiltrados = amigos.filter(amigo => {
    // Filtro por estado
    if (filtro !== 'todos' && amigo.estado !== filtro) {
      return false
    }
    // Búsqueda por nombre o email
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase()
      return (
        amigo.nombre.toLowerCase().includes(busquedaLower) ||
        amigo.email.toLowerCase().includes(busquedaLower)
      )
    }
    return true
  })

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  // Función para agregar amigo
  const agregarAmigo = () => {
    if (!nombreAmigo.trim() || !emailAmigo.trim()) {
      alert('Por favor completa todos los campos')
      return
    }

    // Verificar si el email ya existe
    if (amigos.some(amigo => amigo.email.toLowerCase() === emailAmigo.toLowerCase())) {
      alert('Este usuario ya está en tu lista de amigos')
      return
    }

    const nuevoAmigo: Amigo = {
      id: Date.now().toString(),
      nombre: nombreAmigo.trim(),
      email: emailAmigo.trim(),
      fechaAmistad: new Date().toISOString(),
      estado: 'activo'
    }

    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const amigosActualizados = [...amigos, nuevoAmigo]
      setAmigos(amigosActualizados)
      saveAmigos(amigosActualizados, usuarioActual.id)
    }
    setNombreAmigo('')
    setEmailAmigo('')
    setMostrarFormulario(false)
  }

  // Función para eliminar amigo
  const eliminarAmigo = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este amigo?')) {
      const usuarioActual = getUsuarioActual()
      if (usuarioActual) {
        const amigosActualizados = amigos.filter(amigo => amigo.id !== id)
        setAmigos(amigosActualizados)
        saveAmigos(amigosActualizados, usuarioActual.id)
      }
    }
  }

  // Función para cambiar estado de amigo
  const cambiarEstado = (id: string, nuevoEstado: Amigo['estado']) => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const amigosActualizados = amigos.map(amigo =>
        amigo.id === id ? { ...amigo, estado: nuevoEstado } : amigo
      )
      setAmigos(amigosActualizados)
      saveAmigos(amigosActualizados, usuarioActual.id)
    }
  }

  const contarPorEstado = (estado: Amigo['estado']) => {
    return amigos.filter(amigo => amigo.estado === estado).length
  }

  return (
    <div className="amigos-page">
      <div className="amigos-container">
        {/* Header de la página */}
        <div className="amigos-header">
          <div>
            <h1 className="amigos-title">Amigos</h1>
            <p className="amigos-subtitle">
              {amigos.length > 0 
                ? `${amigos.length} amigo${amigos.length > 1 ? 's' : ''} en tu lista`
                : 'No tienes amigos agregados'}
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="btn btn-primary"
          >
            {mostrarFormulario ? 'Cancelar' : '+ Agregar Amigo'}
          </button>
        </div>

        {/* Formulario para agregar amigo */}
        {mostrarFormulario && (
          <div className="amigos-form-card">
            <h3 className="amigos-form-title">Agregar Nuevo Amigo</h3>
            <div className="amigos-form">
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  className="form-input"
                  placeholder="Nombre completo"
                  value={nombreAmigo}
                  onChange={(e) => setNombreAmigo(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="email@ejemplo.com"
                  value={emailAmigo}
                  onChange={(e) => setEmailAmigo(e.target.value)}
                />
              </div>
              <button
                onClick={agregarAmigo}
                className="btn btn-primary"
              >
                Agregar Amigo
              </button>
            </div>
          </div>
        )}

        {/* Barra de búsqueda y filtros */}
        <div className="amigos-controls">
          <div className="amigos-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="amigos-search-input"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="amigos-filtros">
            <button
              onClick={() => setFiltro('todos')}
              className={`btn-filtro ${filtro === 'todos' ? 'active' : ''}`}
            >
              Todos ({amigos.length})
            </button>
            <button
              onClick={() => setFiltro('activos')}
              className={`btn-filtro ${filtro === 'activos' ? 'active' : ''}`}
            >
              Activos ({contarPorEstado('activo')})
            </button>
            <button
              onClick={() => setFiltro('pendientes')}
              className={`btn-filtro ${filtro === 'pendientes' ? 'active' : ''}`}
            >
              Pendientes ({contarPorEstado('pendiente')})
            </button>
            <button
              onClick={() => setFiltro('bloqueados')}
              className={`btn-filtro ${filtro === 'bloqueados' ? 'active' : ''}`}
            >
              Bloqueados ({contarPorEstado('bloqueado')})
            </button>
          </div>
        </div>

        {/* Lista de amigos */}
        <div className="amigos-lista">
          {amigosFiltrados.length === 0 ? (
            <div className="amigos-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p>
                {busqueda.trim() || filtro !== 'todos'
                  ? 'No se encontraron amigos con los filtros seleccionados'
                  : 'No tienes amigos agregados. ¡Agrega tu primer amigo!'}
              </p>
            </div>
          ) : (
            <div className="amigos-grid">
              {amigosFiltrados.map((amigo) => (
                <div key={amigo.id} className="amigo-card">
                  <div className="amigo-avatar">
                    {amigo.avatar ? (
                      <img src={amigo.avatar} alt={amigo.nombre} className="amigo-avatar-image" />
                    ) : (
                      <div className="amigo-avatar-placeholder">
                        {getInitials(amigo.nombre)}
                      </div>
                    )}
                  </div>
                  <div className="amigo-info">
                    <h3 className="amigo-nombre">{amigo.nombre}</h3>
                    <p className="amigo-email">{amigo.email}</p>
                    <span className={`amigo-estado estado-${amigo.estado}`}>
                      {amigo.estado === 'activo' && 'Activo'}
                      {amigo.estado === 'pendiente' && 'Pendiente'}
                      {amigo.estado === 'bloqueado' && 'Bloqueado'}
                    </span>
                    <p className="amigo-fecha">
                      Amigos desde {new Date(amigo.fechaAmistad).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="amigo-actions">
                    {/* Botón de chat - siempre visible */}
                    <Link
                      href={`/dashboard/chat/${amigo.id}`}
                      className="btn-link btn-link-chat"
                      title="Abrir chat"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Chat
                    </Link>
                    {amigo.estado === 'activo' && (
                      <>
                        <button
                          onClick={() => cambiarEstado(amigo.id, 'pendiente')}
                          className="btn-link"
                          title="Marcar como pendiente"
                        >
                          Pendiente
                        </button>
                        <button
                          onClick={() => cambiarEstado(amigo.id, 'bloqueado')}
                          className="btn-link btn-link-warning"
                          title="Bloquear amigo"
                        >
                          Bloquear
                        </button>
                      </>
                    )}
                    {amigo.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(amigo.id, 'activo')}
                        className="btn-link"
                        title="Aceptar amigo"
                      >
                        Aceptar
                      </button>
                    )}
                    {amigo.estado === 'bloqueado' && (
                      <button
                        onClick={() => cambiarEstado(amigo.id, 'activo')}
                        className="btn-link"
                        title="Desbloquear amigo"
                      >
                        Desbloquear
                      </button>
                    )}
                    <button
                      onClick={() => eliminarAmigo(amigo.id)}
                      className="btn-link btn-link-danger"
                      title="Eliminar amigo"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

