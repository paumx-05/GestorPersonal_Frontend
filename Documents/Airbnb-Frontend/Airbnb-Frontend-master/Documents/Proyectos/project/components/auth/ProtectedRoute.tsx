/**
 * Componente de protección de rutas con renovación automática de tokens
 * Implementa la protección de rutas según la guía FRONTEND_TOKEN_REFRESH_GUIDE.md
 */

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Cargando...</p>
    </div>
  </div>
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y no hay usuario autenticado, redirigir al login
    if (!isLoading && !isAuthenticated) {
      console.log('🔒 [ProtectedRoute] Usuario no autenticado, redirigiendo al login');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Si no está autenticado, no mostrar nada (ya se redirigió)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Si está autenticado, mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
