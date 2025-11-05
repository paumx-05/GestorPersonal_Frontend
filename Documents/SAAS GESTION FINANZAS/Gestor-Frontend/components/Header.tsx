'use client'

// Componente Header con logo y botones de autenticación
// Este componente se muestra fijo en la parte superior de todas las páginas
// Cambia según el estado de autenticación del usuario

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { getAuth } from '@/lib/auth'
import { authController } from '@/controllers/auth.controller'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMessagesMenuOpen, setIsMessagesMenuOpen] = useState(false)
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const messagesMenuRef = useRef<HTMLDivElement>(null)
  const notificationsMenuRef = useRef<HTMLDivElement>(null)

  // Función para actualizar el estado de autenticación
  const updateAuthState = () => {
    setIsAuthenticated(getAuth())
  }

  // Verificar estado de autenticación al cargar y cuando cambia la ruta
  useEffect(() => {
    updateAuthState()
  }, [pathname])

  // Escuchar eventos personalizados de cambio de autenticación
  useEffect(() => {
    const handleAuthChange = () => {
      updateAuthState()
    }

    // Escuchar evento personalizado 'authChange'
    window.addEventListener('authChange', handleAuthChange)
    
    // Escuchar cambios en localStorage (para otras pestañas)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      window.removeEventListener('authChange', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  // Cerrar menús cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (messagesMenuRef.current && !messagesMenuRef.current.contains(event.target as Node)) {
        setIsMessagesMenuOpen(false)
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsMenuOpen(false)
      }
    }

    if (isProfileMenuOpen || isMessagesMenuOpen || isNotificationsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileMenuOpen, isMessagesMenuOpen, isNotificationsMenuOpen])

  // Función para cerrar sesión
  const handleLogout = async () => {
    await authController.logout()
    setIsAuthenticated(false)
    setIsProfileMenuOpen(false)
    router.push('/')
  }

  // Función para toggle del menú de perfil
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
    setIsMessagesMenuOpen(false)
    setIsNotificationsMenuOpen(false)
  }

  // Función para toggle del menú de mensajes
  const toggleMessagesMenu = () => {
    setIsMessagesMenuOpen(!isMessagesMenuOpen)
    setIsProfileMenuOpen(false)
    setIsNotificationsMenuOpen(false)
  }

  // Función para toggle del menú de notificaciones
  const toggleNotificationsMenu = () => {
    setIsNotificationsMenuOpen(!isNotificationsMenuOpen)
    setIsProfileMenuOpen(false)
    setIsMessagesMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo en la parte izquierda con enlace a home o dashboard según autenticación */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="logo">
          <span className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </span>
          <span className="logo-text">Gestor Finanzas</span>
        </Link>

        {/* Navegación - cambia según el estado de autenticación */}
        <nav className="header-nav">
          {isAuthenticated ? (
            // Si está autenticado: mostrar iconos de mensajes, notificaciones, perfil y logout
            <div className="header-user">
              {/* Icono de mensajes con menú desplegable */}
              <div className="header-menu-container" ref={messagesMenuRef}>
                <button 
                  onClick={toggleMessagesMenu}
                  className="header-icon-btn"
                  title="Mensajes"
                  aria-label="Mensajes"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </button>
                
                {/* Menú desplegable de mensajes */}
                {isMessagesMenuOpen && (
                  <div className="header-dropdown">
                    <div className="header-dropdown-header">
                      <h3 className="header-dropdown-title">Mensajes</h3>
                      <Link href="/dashboard/mensajes" className="header-dropdown-link">
                        Ver todos
                      </Link>
                    </div>
                    <div className="header-dropdown-content">
                      <div className="header-dropdown-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <p>No hay mensajes nuevos</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Icono de notificaciones con menú desplegable */}
              <div className="header-menu-container" ref={notificationsMenuRef}>
                <button 
                  onClick={toggleNotificationsMenu}
                  className="header-icon-btn"
                  title="Notificaciones"
                  aria-label="Notificaciones"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </button>
                
                {/* Menú desplegable de notificaciones */}
                {isNotificationsMenuOpen && (
                  <div className="header-dropdown">
                    <div className="header-dropdown-header">
                      <h3 className="header-dropdown-title">Notificaciones</h3>
                      <Link href="/dashboard/notificaciones" className="header-dropdown-link">
                        Ver todas
                      </Link>
                    </div>
                    <div className="header-dropdown-content">
                      <div className="header-dropdown-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <p>No hay notificaciones nuevas</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Icono de perfil con menú desplegable */}
              <div className="profile-menu-container" ref={menuRef}>
                <button 
                  onClick={toggleProfileMenu}
                  className="header-icon-btn"
                  title="Perfil"
                  aria-label="Perfil"
                >
                  <svg className="profile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
                
                {/* Menú desplegable */}
                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <Link 
                      href="/dashboard/perfil" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Perfil</span>
                    </Link>
                    
                    <Link 
                      href="/dashboard/opciones" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                      </svg>
                      <span>Opciones</span>
                    </Link>
                    
                    <Link 
                      href="/dashboard/amigos" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>Amigos</span>
                    </Link>
                    
                    <Link 
                      href="/dashboard/notificaciones" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      <span>Notificaciones</span>
                    </Link>
                    
                    <Link 
                      href="/dashboard/mensajes" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <span>Mensajes</span>
                    </Link>
                    
                    <div className="profile-menu-divider"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="profile-menu-item profile-menu-item-danger"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Icono de cerrar sesión */}
              <button 
                onClick={handleLogout} 
                className="header-icon-btn"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            // Si no está autenticado: mostrar botones de login y registro
            <>
              <Link href="/login" className="btn-nav btn-login">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn-nav btn-signup">
                Crear Cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
