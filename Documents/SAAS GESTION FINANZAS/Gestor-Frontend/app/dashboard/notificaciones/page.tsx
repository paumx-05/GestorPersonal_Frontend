'use client'

// Página de Notificaciones
// Permite ver y gestionar todas las notificaciones del usuario

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth } from '@/lib/auth'

interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  tipo: 'info' | 'success' | 'warning' | 'error'
  fecha: string
  leida: boolean
}

import { getUsuarioActual } from '@/lib/auth'

// Función para obtener notificaciones del usuario actual
function getNotificaciones(userId?: string): Notificacion[] {
  if (typeof window !== 'undefined') {
    const usuarioId = userId || getUsuarioActual()?.id || 'default'
    const NOTIFICACIONES_KEY = `gestor-finanzas-notificaciones-${usuarioId}`
    const notificaciones = localStorage.getItem(NOTIFICACIONES_KEY)
    if (notificaciones) {
      return JSON.parse(notificaciones)
    }
  }
  return []
}

// Función para guardar notificaciones del usuario actual
function saveNotificaciones(notificaciones: Notificacion[], userId?: string) {
  if (typeof window !== 'undefined') {
    const usuarioId = userId || getUsuarioActual()?.id || 'default'
    const NOTIFICACIONES_KEY = `gestor-finanzas-notificaciones-${usuarioId}`
    localStorage.setItem(NOTIFICACIONES_KEY, JSON.stringify(notificaciones))
  }
}

export default function NotificacionesPage() {
  const router = useRouter()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [filtro, setFiltro] = useState<'todos' | 'no-leidas'>('todos')

  // Verificar autenticación y cargar notificaciones
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Cargar notificaciones del usuario actual
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const notificacionesData = getNotificaciones(usuarioActual.id)
      setNotificaciones(notificacionesData)
    }
  }, [router])

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(notificacion => {
    if (filtro === 'no-leidas') {
      return !notificacion.leida
    }
    return true
  })

  // Función para marcar notificación como leída
  const marcarComoLeida = (id: string) => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const notificacionesActualizadas = notificaciones.map(notificacion => 
        notificacion.id === id ? { ...notificacion, leida: true } : notificacion
      )
      setNotificaciones(notificacionesActualizadas)
      saveNotificaciones(notificacionesActualizadas, usuarioActual.id)
    }
  }

  // Función para marcar todas como leídas
  const marcarTodasComoLeidas = () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const notificacionesActualizadas = notificaciones.map(notificacion => 
        ({ ...notificacion, leida: true })
      )
      setNotificaciones(notificacionesActualizadas)
      saveNotificaciones(notificacionesActualizadas, usuarioActual.id)
    }
  }

  // Función para eliminar notificación
  const eliminarNotificacion = (id: string) => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const notificacionesActualizadas = notificaciones.filter(notificacion => notificacion.id !== id)
      setNotificaciones(notificacionesActualizadas)
      saveNotificaciones(notificacionesActualizadas, usuarioActual.id)
    }
  }

  // Función para eliminar todas las notificaciones
  const eliminarTodas = () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual && confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
      setNotificaciones([])
      saveNotificaciones([], usuarioActual.id)
    }
  }

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length

  // Función para obtener el icono según el tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        )
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )
    }
  }

  return (
    <div className="notificaciones-page">
      <div className="notificaciones-container">
        {/* Header de la página */}
        <div className="notificaciones-header">
          <div>
            <h1 className="notificaciones-title">Notificaciones</h1>
            <p className="notificaciones-subtitle">
              {notificacionesNoLeidas > 0 
                ? `${notificacionesNoLeidas} notificación${notificacionesNoLeidas > 1 ? 'es' : ''} no leída${notificacionesNoLeidas > 1 ? 's' : ''}`
                : 'No hay notificaciones nuevas'}
            </p>
          </div>
          <div className="notificaciones-actions">
            {notificacionesNoLeidas > 0 && (
              <button
                onClick={marcarTodasComoLeidas}
                className="btn btn-secondary"
              >
                Marcar todas como leídas
              </button>
            )}
            {notificaciones.length > 0 && (
              <button
                onClick={eliminarTodas}
                className="btn btn-danger"
              >
                Eliminar todas
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="notificaciones-filtros">
          <button
            onClick={() => setFiltro('todos')}
            className={`btn-filtro ${filtro === 'todos' ? 'active' : ''}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('no-leidas')}
            className={`btn-filtro ${filtro === 'no-leidas' ? 'active' : ''}`}
          >
            No leídas {notificacionesNoLeidas > 0 && `(${notificacionesNoLeidas})`}
          </button>
        </div>

        {/* Lista de notificaciones */}
        <div className="notificaciones-lista">
          {notificacionesFiltradas.length === 0 ? (
            <div className="notificaciones-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <p>No hay notificaciones {filtro === 'no-leidas' ? 'no leídas' : ''}</p>
            </div>
          ) : (
            notificacionesFiltradas.map((notificacion) => (
              <div
                key={notificacion.id}
                className={`notificacion-item ${!notificacion.leida ? 'no-leida' : ''} tipo-${notificacion.tipo}`}
              >
                <div className="notificacion-icon" data-tipo={notificacion.tipo}>
                  {getTipoIcon(notificacion.tipo)}
                </div>
                <div className="notificacion-content">
                  <div className="notificacion-header">
                    <h3 className="notificacion-titulo">{notificacion.titulo}</h3>
                    {!notificacion.leida && <span className="notificacion-badge">Nueva</span>}
                  </div>
                  <p className="notificacion-mensaje">{notificacion.mensaje}</p>
                  <div className="notificacion-footer">
                    <span className="notificacion-fecha">
                      {new Date(notificacion.fecha).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <div className="notificacion-actions">
                      {!notificacion.leida && (
                        <button
                          onClick={() => marcarComoLeida(notificacion.id)}
                          className="btn-link"
                        >
                          Marcar como leída
                        </button>
                      )}
                      <button
                        onClick={() => eliminarNotificacion(notificacion.id)}
                        className="btn-link btn-link-danger"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

