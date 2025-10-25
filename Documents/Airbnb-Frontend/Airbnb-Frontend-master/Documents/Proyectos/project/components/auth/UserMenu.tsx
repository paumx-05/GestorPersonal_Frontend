'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Loader2 
} from 'lucide-react';

export default function UserMenu() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Log temporal para debugging
  console.log('🔍 [UserMenu] Renderizando con isAuthenticated:', isAuthenticated, 'user:', user?.name);

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
        
        <Link href="/profile">
          <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700">
            <User className="h-4 w-4" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700">
          <Calendar className="h-4 w-4" />
          <span>Mis Reservas</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700">
          <Heart className="h-4 w-4" />
          <span>Favoritos</span>
        </DropdownMenuItem>
        
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
