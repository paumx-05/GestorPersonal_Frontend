'use client';

import { useState } from 'react';
import { Heart, Menu, User, Globe, Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import UserMenu from './auth/UserMenu';
import NotificationBell from './notifications/NotificationBell';

/**
 * Header Component - Airbnb Navigation Bar con autenticación integrada
 * UPDATED: Sistema tradicional con páginas separadas
 * Features: Enlaces a /login, /register, /profile, User menu
 */
export default function Header() {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <svg 
                width="102" 
                height="32" 
                fill="#FF385C" 
                viewBox="0 0 102 32"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <path d="M29.24 22.68c-.16-.39-.31-.8-.47-1.15l-.74-1.67-.03-.03c-2.2-4.8-4.55-9.68-7.04-14.48l-.1-.2c-.25-.47-.5-.99-.76-1.47-.32-.57-.63-1.18-1.14-1.76a5.3 5.3 0 00-8.2 0c-.47.58-.82 1.19-1.14 1.76-.25.52-.5 1-.76 1.47l-.1.2c-2.45 4.8-4.84 9.68-7.04 14.48l-.06.06c-.22.52-.48 1.06-.73 1.64-.16.35-.32.73-.48 1.15a6.8 6.8 0 007.2 9.23 8.38 8.38 0 003.18-1.1c1.3-.73 2.55-1.79 3.95-3.32 1.4 1.53 2.68 2.59 3.95 3.32A8.38 8.38 0 0022.75 32a6.79 6.79 0 006.75-5.83 5.94 5.94 0 00-.26-3.5zm-14.36 1.66c-1.72-2.2-2.84-4.22-3.22-5.95a5.2 5.2 0 01-.1-1.96c.07-.51.26-.96.52-1.34.6-.87 1.65-1.41 2.8-1.41a3.3 3.3 0 012.8 1.4c.26.4.45.84.51 1.35.1.58.06 1.25-.1 1.96-.38 1.7-1.5 3.74-3.21 5.95z"></path>
              </svg>
            </div>
            
            {/* Cart Icon with Counter - Solo visible si está autenticado */}
            {isAuthenticated && (
              <div className="relative">
                <button className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-all duration-200">
                  <ShoppingCart className="h-5 w-5" />
                  {/* Cart counter badge */}
                  <span className="absolute -top-1 -right-1 bg-[#FF385C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    0
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Inicio
            </Link>
            <Link href="/about" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Nosotros
            </Link>
            <button className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Experiencias
            </button>
            <button className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Ayuda
            </button>
          </div>

          {/* Search Bar Central - siguiendo diseño de referencia */}
          <div className="hidden lg:flex items-center bg-slate-700/50 rounded-full px-6 py-3 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 max-w-md mx-8">
            <Search className="h-4 w-4 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Asia"
              className="bg-transparent text-white placeholder-slate-400 outline-none flex-1 text-sm"
            />
            <div className="text-slate-400 text-sm mx-3">•</div>
            <span className="text-slate-400 text-sm">Jul 11 - 14 • 2 guest</span>
            <button className="ml-3 bg-[#FF385C] hover:bg-[#E31C5F] text-white p-2 rounded-full transition-colors duration-200">
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-slate-300 text-sm font-medium transition-colors duration-200 hidden md:block">
              Airbnb your home
            </button>
            
            <button className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-all duration-200">
              <Globe className="h-5 w-5" />
            </button>

            {/* Authentication Section */}
            {isAuthenticated ? (
              // Usuario autenticado - Mostrar Notificaciones + UserMenu
              <div className="flex items-center space-x-2">
                <NotificationBell />
                <UserMenu />
              </div>
            ) : (
              // Usuario no autenticado - Mostrar enlaces a páginas
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
                  >
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-2 rounded-md hover:bg-slate-700/50 transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="flex items-center bg-slate-700/50 rounded-full px-4 py-3 border border-slate-600/50">
            <Search className="h-4 w-4 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Where are you going?"
              className="bg-transparent text-white placeholder-slate-400 outline-none flex-1 text-sm"
            />
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-700 bg-slate-800/95 backdrop-blur-md">
            <div className="px-4 py-6 space-y-4">
              {/* Navigation Links */}
              <div className="space-y-2 pb-4 border-b border-slate-700">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Nosotros
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Experiencias
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ayuda
                </Button>
              </div>

              {/* Auth Section */}
              {!isAuthenticated ? (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mi Perfil
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Auth Buttons - Solo mostrar si no está autenticado y menú cerrado */}
        {!isAuthenticated && !isMenuOpen && (
          <div className="md:hidden pb-4 flex space-x-2">
            <Link href="/login" className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button
                size="sm"
                className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
              >
                Registrarse
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}