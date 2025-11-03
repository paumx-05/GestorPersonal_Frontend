import { User, DoorOpen, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useReservationCart } from '@/context/ReservationCartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Button } from '@/components/ui/button';
import UserMenu from '../auth/UserMenu';
import NotificationBell from '../notifications/NotificationBell';
import { COLORS } from '@/lib/constants';

/**
 * AuthSection Component - Sección de autenticación del header
 * Implementa navegación del icono de usuario y logout según memorias
 */
interface AuthSectionProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export default function AuthSection({ isMobile = false, onLinkClick }: AuthSectionProps) {
  const { isAuthenticated, logout, user } = useAuth();
  const { getTotalItems } = useReservationCart();
  const { getTotalFavorites } = useFavorites();

  // Log temporal para debugging
  console.log('🔍 [AuthSection] Renderizando con isAuthenticated:', isAuthenticated, 'user:', user?.name);

  const handleLogout = async () => {
    try {
      await logout();
      if (onLinkClick) onLinkClick();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isMobile) {
    if (!isAuthenticated) {
      return (
        <>
          <Link href="/login">
            <Button
              variant="ghost"
              className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
              onClick={onLinkClick}
            >
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
              onClick={onLinkClick}
            >
              Registrarse
            </Button>
          </Link>
        </>
      );
    }

    return (
      <div className="space-y-2">
        <Link href="/account">
          <Button
            variant="ghost"
            className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
            onClick={onLinkClick}
          >
            <User className="h-4 w-4 mr-2" />
            Cuenta
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 text-red-400 hover:text-red-300"
          onClick={handleLogout}
        >
          <DoorOpen className="h-4 w-4 mr-2" />
          Salir
        </Button>
      </div>
    );
  }

  // Desktop version
  if (!isAuthenticated) {
    return (
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
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Favorites Icon with Counter - A la izquierda del carrito */}
      {isAuthenticated && (
        <div className="relative">
          <Link href="/favorites">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-all duration-200"
              title={`${getTotalFavorites()} favorito${getTotalFavorites() !== 1 ? 's' : ''}`}
            >
              <Heart className="h-5 w-5" />
              {getTotalFavorites() > 0 && (
                <span className={`absolute -top-1 -right-1 bg-[${COLORS.primary}] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium`}>
                  {getTotalFavorites()}
                </span>
              )}
            </Button>
          </Link>
        </div>
      )}

      {/* Cart Icon with Counter - Al lado de favoritos */}
      {isAuthenticated && (
        <div className="relative">
          <Link href="/cart">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-all duration-200"
              title={`${getTotalItems()} reserva${getTotalItems() !== 1 ? 's' : ''} en el carrito`}
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className={`absolute -top-1 -right-1 bg-[${COLORS.primary}] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium`}>
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </Link>
        </div>
      )}
      
      <NotificationBell />
      <UserMenu />
      
      {/* Icono de logout (DoorOpen) en la parte derecha */}
      <Button
        variant="ghost"
        className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-all duration-200"
        onClick={handleLogout}
        title="Cerrar sesión"
      >
        <DoorOpen className="h-5 w-5" />
      </Button>
    </div>
  );
}
