import { useState } from 'react';

/**
 * useMobileMenu Hook - Hook personalizado para manejar el estado del menú móvil
 * Simplifica la lógica del menú móvil y la hace reutilizable
 */
export function useMobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    openMenu
  };
}
