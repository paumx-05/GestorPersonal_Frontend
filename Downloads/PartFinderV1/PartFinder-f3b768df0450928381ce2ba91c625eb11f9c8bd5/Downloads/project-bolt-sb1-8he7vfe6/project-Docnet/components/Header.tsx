'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, ShoppingCart, User, LogOut, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionMock } from '@/hooks/use-session-mock';
import { authMock } from '@/lib/mocks/auth';

interface HeaderProps {
  cartItems: number;
  onAddToCart: () => void;
}

export default function Header({ cartItems, onAddToCart }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useSessionMock();

  async function handleLogout() {
    await authMock.logout();
    await logout();
    router.replace('/');
  }

  const handleUserClick = () => {
    if (isAuthenticated) router.push('/account');
    else router.push('/login');
  };

  return (
    <header className="bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <Wrench className="h-8 w-8 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold truncate">PartFinder</h1>
          </div>

          <div className="flex lg:hidden items-center gap-2 flex-wrap">
            <button onClick={onAddToCart} className="relative flex items-center hover:text-red-200 transition-colors" aria-label="Carrito">
              <ShoppingCart className="h-6 w-6" />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItems}
                </span>
              )}
            </button>

            <button onClick={handleUserClick} className="flex items-center hover:text-red-200 transition-colors" aria-label={isAuthenticated ? 'Mi cuenta' : 'Login'}>
              <User className="h-6 w-6" />
            </button>

            {!isAuthenticated ? (
              <>  
                <Link href="/login" className="text-xs underline">Login</Link>
                <Link href="/register" className="text-xs underline">Registro</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="flex items-center hover:text-red-200 transition-colors" aria-label="Salir">
                <LogOut className="h-6 w-6" />
              </button>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#catalogo" className="hover:text-red-200 transition-colors">Catálogos</a>
            <a href="#remotos" className="hover:text-red-200 transition-colors">Remotos</a>
            <a href="#gestion" className="hover:text-red-200 transition-colors">Gestión</a>
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="hover:text-red-200 transition-colors">Login</Link>
                <Link href="/register" className="hover:text-red-200 transition-colors">Registro</Link>
              </>
            ) : null}
          </nav>

          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <div className="hidden xl:flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>+34 900 123 456</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>info@PartFinder.es</span>
              </div>
            </div>

            <button onClick={onAddToCart} className="relative flex items-center space-x-1 hover:text-red-200 transition-colors" aria-label="Carrito">
              <ShoppingCart className="h-5 w-5" />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItems}
                </span>
              )}
            </button>

            <button onClick={handleUserClick} className="flex items-center space-x-1 hover:text-red-200 transition-colors" aria-label={isAuthenticated ? 'Mi cuenta' : 'Login'}>
              <User className="h-5 w-5" />
            </button>

            {isAuthenticated && (
              <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-red-200 transition-colors" aria-label="Salir">
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
