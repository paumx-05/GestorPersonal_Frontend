'use client'

// Página de Chat con un Amigo
// Permite enviar y recibir mensajes con un amigo específico

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getAuth, getUsuarioActual } from '@/lib/auth'

interface Mensaje {
  id: string
  remitente: string
  asunto: string
  contenido: string
  fecha: string
  leido: boolean
  amigoId?: string
  usuarioId?: string
  esSistema?: boolean
}

interface Amigo {
  id: string
  nombre: string
  email: string
  avatar?: string
  fechaAmistad: string
  estado: 'activo' | 'pendiente' | 'bloqueado'
}

const AMIGOS_KEY = 'gestor-finanzas-amigos'

// Función helper para crear mensajes mock de ejemplo (útil para pruebas)
// Esta función puede ser llamada desde la consola del navegador
// Ejemplo: window.crearMensajeMock('mock-1', 'user-main', 'Juan Pérez', 25.50, 'Cena en McDonald\'s')
export function crearMensajeMock(
  usuarioIdReceptor: string, 
  usuarioIdEmisor: string, 
  nombreEmisor: string, 
  monto: number, 
  descripcion: string
) {
  if (typeof window !== 'undefined') {
    const MENSAJES_KEY_RECEPTOR = `gestor-finanzas-mensajes-${usuarioIdReceptor}`
    const mensajes = localStorage.getItem(MENSAJES_KEY_RECEPTOR)
    let mensajesList: Mensaje[] = []
    
    if (mensajes) {
      try {
        mensajesList = JSON.parse(mensajes)
      } catch (e) {
        mensajesList = []
      }
    }
    
    const nuevoMensaje: Mensaje = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      remitente: nombreEmisor,
      asunto: `Recordatorio de pago: ${descripcion}`,
      contenido: `Hola,\n\nTe recordamos que debes pagar ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(monto)} por el gasto "${descripcion}".\n\nPor favor, realiza el pago cuando puedas.\n\nGracias.`,
      fecha: new Date().toISOString(),
      leido: false,
      amigoId: usuarioIdEmisor, // ID del usuario que envía (desde la perspectiva del receptor)
      usuarioId: usuarioIdEmisor, // ID del usuario que envía
      esSistema: true
    }
    
    mensajesList.push(nuevoMensaje)
    localStorage.setItem(MENSAJES_KEY_RECEPTOR, JSON.stringify(mensajesList))
    
    console.log(`✅ Mensaje mock creado para el usuario ${usuarioIdReceptor}`)
    return nuevoMensaje
  }
  return null
}

// Hacer la función disponible globalmente para uso desde la consola
if (typeof window !== 'undefined') {
  (window as any).crearMensajeMock = crearMensajeMock
}

// Función para obtener mensajes del usuario actual
function getMensajesUsuario(usuarioId: string): Mensaje[] {
  if (typeof window !== 'undefined') {
    const MENSAJES_KEY = `gestor-finanzas-mensajes-${usuarioId}`
    const mensajes = localStorage.getItem(MENSAJES_KEY)
    if (mensajes) {
      return JSON.parse(mensajes)
    }
  }
  return []
}

// Función para guardar mensajes del usuario actual
function saveMensajesUsuario(usuarioId: string, mensajes: Mensaje[]) {
  if (typeof window !== 'undefined') {
    const MENSAJES_KEY = `gestor-finanzas-mensajes-${usuarioId}`
    localStorage.setItem(MENSAJES_KEY, JSON.stringify(mensajes))
  }
}

// Función para guardar mensaje en el chat del amigo también (para que el amigo lo vea cuando inicie sesión)
function saveMensajeAmigo(amigoId: string, mensaje: Mensaje, nombreRemitente: string) {
  if (typeof window !== 'undefined') {
    const MENSAJES_KEY_AMIGO = `gestor-finanzas-mensajes-${amigoId}`
    const mensajesAmigo = localStorage.getItem(MENSAJES_KEY_AMIGO)
    let mensajesList: Mensaje[] = []
    
    if (mensajesAmigo) {
      try {
        mensajesList = JSON.parse(mensajesAmigo)
      } catch (e) {
        mensajesList = []
      }
    }
    
    // Crear el mensaje desde la perspectiva del amigo (el remitente es el usuario actual)
    const mensajeAmigo: Mensaje = {
      ...mensaje,
      id: mensaje.id + '-amigo',
      remitente: nombreRemitente, // Nombre del usuario que envía (desde la perspectiva del amigo)
      amigoId: mensaje.usuarioId, // El amigoId debe ser el ID del usuario que envía (desde la perspectiva del amigo)
      esSistema: false
    }
    
    mensajesList.push(mensajeAmigo)
    localStorage.setItem(MENSAJES_KEY_AMIGO, JSON.stringify(mensajesList))
  }
}

// Función para obtener amigo
function getAmigo(amigoId: string, userId?: string): Amigo | null {
  if (typeof window !== 'undefined') {
    const usuarioId = userId || getUsuarioActual()?.id || 'default'
    const AMIGOS_KEY_USER = `gestor-finanzas-amigos-${usuarioId}`
    const amigos = localStorage.getItem(AMIGOS_KEY_USER)
    if (amigos) {
      const amigosList: Amigo[] = JSON.parse(amigos)
      return amigosList.find(a => a.id === amigoId) || null
    }
  }
  return null
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const amigoId = params?.amigoId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [amigo, setAmigo] = useState<Amigo | null>(null)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  // Verificar autenticación y cargar datos
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (amigoId) {
      const usuarioActual = getUsuarioActual()
      if (usuarioActual) {
        const amigoData = getAmigo(amigoId, usuarioActual.id)
        if (!amigoData) {
          router.push('/dashboard/amigos')
          return
        }
        setAmigo(amigoData)
        loadMensajes()
        
        // Removido el mensaje mock automático para evitar interferencias
      }
    }
  }, [amigoId, router])

  // Scroll automático al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Listener para detectar cambios en localStorage y recargar mensajes
  useEffect(() => {
    const usuarioActual = getUsuarioActual()
    if (!usuarioActual || !amigoId) return

    const MENSAJES_KEY = `gestor-finanzas-mensajes-${usuarioActual.id}`
    
    // Función para manejar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === MENSAJES_KEY) {
        console.log('🔄 Cambio detectado en localStorage, recargando mensajes...')
        loadMensajes()
      }
    }

    // Escuchar cambios en localStorage (desde otras pestañas/ventanas)
    window.addEventListener('storage', handleStorageChange)

    // También verificar periódicamente si hay nuevos mensajes (para cambios en la misma pestaña)
    const intervalId = setInterval(() => {
      const mensajesActuales = getMensajesUsuario(usuarioActual.id)
      
      // Filtrar mensajes de este chat usando la misma lógica que loadMensajes
      const mensajesFiltrados = mensajesActuales.filter(m => {
        if (m.amigoId === amigoId) {
          return true
        }
        if (m.usuarioId === amigoId && m.amigoId === usuarioActual.id) {
          return true
        }
        return false
      })
      
      if (mensajesFiltrados.length !== mensajes.length) {
        console.log('🔄 Nuevos mensajes detectados, recargando...', {
          anteriores: mensajes.length,
          nuevos: mensajesFiltrados.length,
          mensajesNuevos: mensajesFiltrados.filter(m => 
            !mensajes.some(msg => msg.id === m.id)
          ).map(m => ({
            id: m.id,
            remitente: m.remitente,
            contenido: m.contenido.substring(0, 50) + '...'
          }))
        })
        loadMensajes()
      }
    }, 1000) // Verificar cada 1 segundo para una respuesta más rápida

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [amigoId, mensajes.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Función para cargar mensajes del chat
  const loadMensajes = () => {
    const usuarioActual = getUsuarioActual()
    if (!usuarioActual) return
    
    const todosMensajes = getMensajesUsuario(usuarioActual.id)
    
    // Log para depuración
    console.log('🔍 Cargando mensajes del chat:', {
      usuarioActual: usuarioActual.id,
      amigoId: amigoId,
      totalMensajes: todosMensajes.length,
      todosMensajes: todosMensajes.map(m => ({
        id: m.id,
        remitente: m.remitente,
        amigoId: m.amigoId,
        usuarioId: m.usuarioId,
        contenido: m.contenido.substring(0, 50) + '...'
      }))
    })
    
    // Filtrar mensajes de este amigo
    // Un mensaje pertenece a este chat si:
    // 1. El amigoId del mensaje coincide con el amigoId del chat (mensajes recibidos del amigo)
    // 2. O el usuarioId del mensaje coincide con el amigoId del chat Y el amigoId del mensaje coincide con el usuario actual (mensajes enviados por el amigo)
    const mensajesChat = todosMensajes.filter(m => {
      // Caso 1: Mensaje recibido del amigo (el amigo envió el mensaje al usuario actual)
      if (m.amigoId === amigoId) {
        return true
      }
      // Caso 2: Mensaje enviado por el amigo (el amigo está en el chat con el usuario actual)
      if (m.usuarioId === amigoId && m.amigoId === usuarioActual.id) {
        return true
      }
      return false
    })
    
    console.log('📨 Mensajes filtrados para el chat:', {
      filtrados: mensajesChat.length,
      filtro: {
        amigoId: amigoId,
        usuarioActual: usuarioActual.id
      },
      mensajes: mensajesChat.map(m => ({
        id: m.id,
        remitente: m.remitente,
        amigoId: m.amigoId,
        usuarioId: m.usuarioId,
        contenido: m.contenido.substring(0, 50) + '...'
      }))
    })
    
    // Ordenar por fecha (más antiguos primero)
    mensajesChat.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    setMensajes(mensajesChat)
  }

  // Función para enviar mensaje
  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoMensaje.trim() || !amigo) return

    const usuarioActual = getUsuarioActual()
    if (!usuarioActual) return

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 200))

    const todosMensajes = getMensajesUsuario(usuarioActual.id)
    const nuevoMensajeObj: Mensaje = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      remitente: 'Tú',
      asunto: `Chat con ${amigo.nombre}`,
      contenido: nuevoMensaje.trim(),
      fecha: new Date().toISOString(),
      leido: true,
      amigoId: amigoId,
      usuarioId: usuarioActual.id,
      esSistema: false
    }

    todosMensajes.push(nuevoMensajeObj)
    saveMensajesUsuario(usuarioActual.id, todosMensajes)
    
    // También guardar el mensaje en el chat del amigo para que lo vea cuando inicie sesión
    saveMensajeAmigo(amigoId, nuevoMensajeObj, usuarioActual.nombre)
    
    setNuevoMensaje('')
    loadMensajes()
    setLoading(false)
  }

  // Función para obtener iniciales
  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  // Formatear fecha para mostrar
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    const ahora = new Date()
    const esHoy = fecha.toDateString() === ahora.toDateString()
    
    if (esHoy) {
      return fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!amigo) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-loading">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Header del chat */}
        <div className="chat-header">
          <Link href="/dashboard/amigos" className="chat-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="chat-header-info">
            <div className="chat-avatar">
              {amigo.avatar ? (
                <img src={amigo.avatar} alt={amigo.nombre} className="chat-avatar-image" />
              ) : (
                <div className="chat-avatar-placeholder">
                  {getInitials(amigo.nombre)}
                </div>
              )}
            </div>
            <div>
              <h1 className="chat-title">{amigo.nombre}</h1>
              <p className="chat-subtitle">{amigo.email}</p>
            </div>
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="chat-messages-container">
          {mensajes.length === 0 ? (
            <div className="chat-empty">
              <p>No hay mensajes aún. ¡Comienza la conversación!</p>
            </div>
          ) : (
            <div className="chat-messages">
              {mensajes.map((mensaje) => {
                const usuarioActual = getUsuarioActual()
                
                // Determinar si el mensaje es del usuario actual o del amigo
                // Un mensaje es "mío" (enviado por el usuario actual) si:
                // 1. El remitente es "Tú" (mensaje manual enviado por el usuario)
                // 2. O el usuarioId del mensaje coincide con el usuario actual Y el amigoId coincide con el amigo actual
                //    (significa que el usuario actual envió este mensaje a este amigo)
                const esMio = mensaje.remitente === 'Tú' || 
                              (mensaje.usuarioId === usuarioActual?.id && mensaje.amigoId === amigoId)
                
                const esSistema = mensaje.esSistema === true
                
                // Si el mensaje NO es mío, entonces es del amigo (recibido)
                // Esto incluye:
                // - Mensajes del sistema enviados por el amigo (usuarioId del amigo)
                // - Mensajes manuales enviados por el amigo
                const esDelAmigo = !esMio
                
                // Los mensajes se muestran a la derecha solo si fueron enviados por el usuario actual
                // Todos los demás mensajes (recibidos del amigo) van a la izquierda
                const mostrarDerecha = esMio
                
                return (
                  <div
                    key={mensaje.id}
                    className={`chat-message ${mostrarDerecha ? 'chat-message-mio' : ''} ${esSistema && mostrarDerecha ? 'chat-message-sistema' : ''}`}
                  >
                    <div className="chat-message-content">
                      {esDelAmigo && (
                        <div className="chat-message-remitente">{amigo?.nombre || mensaje.remitente}</div>
                      )}
                      <div className="chat-message-text">{mensaje.contenido}</div>
                      <div className="chat-message-fecha">{formatFecha(mensaje.fecha)}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Formulario para enviar mensaje */}
        <form className="chat-form" onSubmit={enviarMensaje}>
          <input
            type="text"
            className="chat-input"
            placeholder="Escribe un mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!nuevoMensaje.trim() || loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

