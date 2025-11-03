'use client';

import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import { COLORS, COMMON_STYLES, TEXT } from '@/lib/constants';
import Logo from './header/Logo';
import NavigationLinks from './header/NavigationLinks';
import SearchBar from './header/SearchBar';
import AuthSection from './header/AuthSection';
import Link from 'next/link';

/**
 * Header Component - Airbnb Navigation Bar refactorizado
 * Componente principal que orquesta los subcomponentes
 * Mejorado para legibilidad y mantenimiento
 */
export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const { isMenuOpen, toggleMenu, closeMenu } = useMobileMenu();

  // Log temporal para debugging
  console.log('🔍 [Header] Renderizando con isAuthenticated:', isAuthenticated, 'user:', user?.name);

  return (
    <header className={`${COLORS.background} backdrop-blur-md border-b ${COLORS.border} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Logo />
          </div>

          {/* Navigation Links - Desktop */}
          <NavigationLinks />

          {/* Search Bar Central */}
          <SearchBar />

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Authentication Section */}
            <AuthSection />

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className={`md:hidden ${COMMON_STYLES.button.icon}`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <SearchBar isMobile />

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className={`md:hidden border-t border-slate-700 ${COLORS.background} backdrop-blur-md`}>
            <div className="px-4 py-6 space-y-4">
              {/* Navigation Links */}
              <NavigationLinks isMobile onLinkClick={closeMenu} />

              {/* Auth Section */}
              <AuthSection isMobile onLinkClick={closeMenu} />
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
                {TEXT.auth.login}
              </Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button
                size="sm"
                className={`w-full ${COMMON_STYLES.button.primary}`}
              >
                {TEXT.auth.register}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}