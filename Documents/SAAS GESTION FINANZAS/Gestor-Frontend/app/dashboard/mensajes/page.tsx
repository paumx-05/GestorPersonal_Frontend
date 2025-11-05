'use client'

// Página de Mensajes
// Permite ver y gestionar todos los mensajes del usuario

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth } from '@/lib/auth'

interface Mensaje {
  id: string
  remitente: string
  asunto: string
  contenido: string
  fecha: string
  leido: boolean
  amigoId?: string // ID del amigo si es un mensaje de chat
  esSistema?: boolean // Si es un mensaje automático del sistema
}

import { getUsuarioActual } from '@/lib/auth'

// Función para obtener mensajes del usuario actual
function getMensajes(userId?: string): Mensaje[] {
  if (typeof window !== 'undefined') {
    const usuarioId = userId || getUsuarioActual()?.id || 'default'
    const MENSAJES_KEY = `gestor-finanzas-mensajes-${usuarioId}`
    const mensajes = localStorage.getItem(MENSAJES_KEY)
    if (mensajes) {
      return JSON.parse(mensajes)
    }
  }
  return []
}

// Función para guardar mensajes del usuario actual
function saveMensajes(mensajes: Mensaje[], userId?: string) {
  if (typeof window !== 'undefined') {
    const usuarioId = userId || getUsuarioActual()?.id || 'default'
    const MENSAJES_KEY = `gestor-finanzas-mensajes-${usuarioId}`
    localStorage.setItem(MENSAJES_KEY, JSON.stringify(mensajes))
  }
}

export default function MensajesPage() {
  const router = useRouter()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<Mensaje | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'no-leidos'>('todos')

  // Verificar autenticación y cargar mensajes
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Cargar mensajes
    const mensajesData = getMensajes()
    setMensajes(mensajesData)
  }, [router])

  // Filtrar mensajes
  const mensajesFiltrados = mensajes.filter(mensaje => {
    if (filtro === 'no-leidos') {
      return !mensaje.leido
    }
    return true
  })

  // Función para marcar mensaje como leído
  const marcarComoLeido = (id: string) => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const mensajesActualizados = mensajes.map(mensaje => 
        mensaje.id === id ? { ...mensaje, leido: true } : mensaje
      )
      setMensajes(mensajesActualizados)
      saveMensajes(mensajesActualizados, usuarioActual.id)
    }
  }

  // Función para eliminar mensaje
  const eliminarMensaje = (id: string) => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const mensajesActualizados = mensajes.filter(mensaje => mensaje.id !== id)
      setMensajes(mensajesActualizados)
      saveMensajes(mensajesActualizados, usuarioActual.id)
      if (mensajeSeleccionado?.id === id) {
        setMensajeSeleccionado(null)
      }
    }
  }

  // Función para seleccionar mensaje
  const seleccionarMensaje = (mensaje: Mensaje) => {
    setMensajeSeleccionado(mensaje)
    if (!mensaje.leido) {
      marcarComoLeido(mensaje.id)
    }
  }

  const mensajesNoLeidos = mensajes.filter(m => !m.leido).length

  return (
    <div className="mensajes-page">
      <div className="mensajes-container">
        {/* Header de la página */}
        <div className="mensajes-header">
          <div>
            <h1 className="mensajes-title">Mensajes</h1>
            <p className="mensajes-subtitle">
              {mensajesNoLeidos > 0 
                ? `${mensajesNoLeidos} mensaje${mensajesNoLeidos > 1 ? 's' : ''} no leído${mensajesNoLeidos > 1 ? 's' : ''}`
                : 'No hay mensajes nuevos'}
            </p>
          </div>
          <div className="mensajes-filtros">
            <button
              onClick={() => setFiltro('todos')}
              className={`btn-filtro ${filtro === 'todos' ? 'active' : ''}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro('no-leidos')}
              className={`btn-filtro ${filtro === 'no-leidos' ? 'active' : ''}`}
            >
              No leídos {mensajesNoLeidos > 0 && `(${mensajesNoLeidos})`}
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mensajes-content">
          {/* Lista de mensajes */}
          <div className="mensajes-lista">
            {mensajesFiltrados.length === 0 ? (
              <div className="mensajes-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <p>No hay mensajes {filtro === 'no-leidos' ? 'no leídos' : ''}</p>
              </div>
            ) : (
              mensajesFiltrados.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`mensaje-item ${!mensaje.leido ? 'no-leido' : ''} ${mensajeSeleccionado?.id === mensaje.id ? 'seleccionado' : ''}`}
                  onClick={() => seleccionarMensaje(mensaje)}
                >
                  <div className="mensaje-item-header">
                    <div className="mensaje-item-info">
                      <h3 className="mensaje-remitente">{mensaje.remitente}</h3>
                      {!mensaje.leido && <span className="mensaje-badge">Nuevo</span>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        eliminarMensaje(mensaje.id)
                      }}
                      className="mensaje-delete"
                      title="Eliminar mensaje"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <p className="mensaje-asunto">{mensaje.asunto}</p>
                  <p className="mensaje-preview">{mensaje.contenido.substring(0, 100)}...</p>
                  <span className="mensaje-fecha">{new Date(mensaje.fecha).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              ))
            )}
          </div>

          {/* Vista de mensaje seleccionado */}
          {mensajeSeleccionado && (
            <div className="mensaje-detalle">
              <div className="mensaje-detalle-header">
                <div>
                  <h2 className="mensaje-detalle-asunto">{mensajeSeleccionado.asunto}</h2>
                  <p className="mensaje-detalle-remitente">De: {mensajeSeleccionado.remitente}</p>
                  <p className="mensaje-detalle-fecha">
                    {new Date(mensajeSeleccionado.fecha).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => eliminarMensaje(mensajeSeleccionado.id)}
                  className="btn btn-danger"
                  title="Eliminar mensaje"
                >
                  Eliminar
                </button>
              </div>
              <div className="mensaje-detalle-contenido">
                <p>{mensajeSeleccionado.contenido}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

