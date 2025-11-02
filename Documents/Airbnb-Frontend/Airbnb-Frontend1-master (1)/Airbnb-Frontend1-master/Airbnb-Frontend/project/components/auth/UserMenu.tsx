'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  Heart, 
  Calendar, 
  LogOut, 
  Menu,
  Loader2,
  Shield,
  Home,
  Users,
  Building2,
  LayoutDashboard,
  Bell
} from 'lucide-react';
import { adminService } from '@/lib/api/admin';

export default function UserMenu() {
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  
  // Verificar rol de admin basado en user.role del backend
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user || !isAuthenticated) {
        console.log('⚠️ [UserMenu] No hay usuario o no está autenticado');
        setIsCheckingRole(false);
        setIsAdmin(false);
        return;
      }

      console.log('🔍 [UserMenu] Verificando rol de admin...');
      console.log('🔍 [UserMenu] User object:', { id: user.id, email: user.email, name: user.name, role: user.role });

      // PRIORIDAD 1: Verificar role directamente del objeto user (viene del backend)
      if (user.role === 'admin') {
        console.log('✅ [UserMenu] Usuario es admin según user.role del contexto');
        setIsAdmin(true);
        setIsCheckingRole(false);
        return;
      }

      // PRIORIDAD 2: Verificar en localStorage (puede tener datos más actualizados)
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔍 [UserMenu] Verificando localStorage - role:', parsedUser.role);
          
          if (parsedUser.role === 'admin') {
            console.log('✅ [UserMenu] Usuario es admin según localStorage');
            setIsAdmin(true);
            setIsCheckingRole(false);
            return;
          }
        }
      } catch (error) {
        console.log('⚠️ [UserMenu] Error leyendo localStorage:', error);
      }

      // PRIORIDAD 3: Si user.role no está disponible, consultar backend
      if (!user.role) {
        console.warn('⚠️ [UserMenu] user.role no está disponible, consultando backend...');
        setIsCheckingRole(true);
        
        try {
          const response = await adminService.checkAdminRole();
          console.log('📥 [UserMenu] Respuesta de checkAdminRole:', response);
          
          if (response.success && response.data?.isAdmin) {
            console.log('✅ [UserMenu] Usuario es admin según backend');
            setIsAdmin(true);
          } else {
            console.log('ℹ️ [UserMenu] Usuario no es admin según backend');
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('💥 [UserMenu] Error verificando rol con backend:', error);
          setIsAdmin(false);
        } finally {
          setIsCheckingRole(false);
        }
      } else {
        // Si user.role está definido pero no es 'admin'
        console.log(`ℹ️ [UserMenu] Usuario tiene role="${user.role}" (no es admin)`);
        setIsAdmin(false);
        setIsCheckingRole(false);
      }
    };

    if (!isLoading && isAuthenticated) {
      checkAdminRole();
    } else if (!isAuthenticated) {
      setIsAdmin(false);
      setIsCheckingRole(false);
    }
  }, [user, isAuthenticated, isLoading]);

  // Log temporal para debugging - IMPORTANTE: Verificar el estado de isAdmin
  console.log('🔍 [UserMenu] Renderizando - isAuthenticated:', isAuthenticated, 'user:', user?.name, 'isAdmin:', isAdmin, 'isCheckingRole:', isCheckingRole);
  console.log('🔍 [UserMenu] ¿Debe mostrar menú admin?', isAdmin === true);
  console.log('🔍 [UserMenu] ¿Debe mostrar submenú Gestión?', isAdmin === true);

  if (!user) {
    console.log('🔍 [UserMenu] No hay usuario, no renderizando');
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2 border border-slate-600/50 rounded-full p-2 hover:shadow-lg hover:border-slate-500/50 transition-all duration-200 bg-slate-700/30"
        >
          <Menu className="h-4 w-4 text-slate-400" />
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-[#FF385C] text-white text-xs">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-slate-800 border-slate-700 text-white"
      >
        <DropdownMenuLabel className="flex items-center space-x-3 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-[#FF385C] text-white">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-slate-400">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-700" />
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700" asChild>
        <Link href="/profile">
            <User className="h-4 w-4" />
            <span>Mi Perfil</span>
          </Link>
          </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700" asChild>
          <Link href="/notifications">
            <Bell className="h-4 w-4" />
            <span>Notificaciones</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700">
          <Calendar className="h-4 w-4" />
          <span>Mis Reservas</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700">
          <Heart className="h-4 w-4" />
          <span>Favoritos</span>
        </DropdownMenuItem>

        {/* Opciones según rol */}
        {/* Mostrar menú de admin si el usuario tiene role === 'admin' */}
        {(() => {
          // Verificar role directamente del user o del estado isAdmin
          const userRole = user?.role;
          const isAdminUser = isAdmin === true || userRole === 'admin';
          console.log('🔍 [UserMenu] Renderizando menú - user.role:', userRole, 'isAdmin:', isAdmin, 'debe mostrar admin?', isAdminUser);
          return isAdminUser;
        })() ? (
          <>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuLabel className="text-xs text-slate-400 px-2 py-1.5">
              Administración
            </DropdownMenuLabel>
            <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700" asChild>
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" />
                <span>Panel de Admin</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700" asChild>
              <Link href="/admin/users">
                <Users className="h-4 w-4" />
                <span>Gestionar Usuarios</span>
              </Link>
            </DropdownMenuItem>
            
            {/* Submenú "Gestión" para admins */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700">
                <Building2 className="h-4 w-4" />
                <span>Gestión</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-slate-800 border-slate-700">
                <DropdownMenuItem 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700"
                  onSelect={(e) => {
                    e.preventDefault();
                    console.log('🔍 [UserMenu] Click en "Gestión de Propiedades"');
                    console.log('🔍 [UserMenu] Navegando a /admin/properties');
                    // Usar router.push con replace para evitar problemas de navegación
                    router.push('/admin/properties');
                    // Cerrar el menú después de navegar
                    setTimeout(() => {
                      const menu = document.querySelector('[role="menu"]');
                      if (menu) {
                        const trigger = menu.closest('[data-radix-dropdown-menu-content]')?.previousElementSibling as HTMLElement;
                        if (trigger) trigger.click();
                      }
                    }, 100);
                  }}
                >
                  <Home className="h-4 w-4" />
                  <span>Gestión de Propiedades</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        ) : null}
        
        {/* Mostrar "Mis Propiedades" solo si NO es admin y NO está verificando */}
        {!isAdmin && !isCheckingRole && (
          <>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuLabel className="text-xs text-slate-400 px-2 py-1.5">
              Mis Propiedades
            </DropdownMenuLabel>
            <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700" asChild>
              <Link href="/my-properties">
                <Home className="h-4 w-4" />
                <span>Mis Propiedades</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700">
          <Settings className="h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-700" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700 text-red-400 hover:text-red-300"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cerrando sesión...</span>
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
