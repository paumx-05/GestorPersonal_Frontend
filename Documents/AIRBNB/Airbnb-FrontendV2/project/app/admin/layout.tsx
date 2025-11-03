'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/api/admin';
import AdminNavigation from '@/components/admin/AdminNavigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const router = useRouter();

  // Verificar rol de admin al cargar
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      try {
        setIsCheckingRole(true);
        const response = await adminService.checkAdminRole();
        
        if (response.success && response.data?.isAdmin) {
          setIsAdmin(true);
        } else {
          // Usuario no es admin, redirigir
          router.push('/');
        }
      } catch (error) {
        console.error('Error verificando rol de admin:', error);
        router.push('/');
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (!isLoading) {
      checkAdminRole();
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Mostrar loading mientras se verifica el rol
  if (isLoading || isCheckingRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // Si no es admin, no mostrar nada (ya se redirigió)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del panel de admin */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Panel de Administración
                </h1>
              </div>
            </div>

            {/* Información del usuario */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.name}</span>
                <span className="text-gray-500 ml-2">(Admin)</span>
              </div>
              
              {/* Botón de logout */}
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/login');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal con sidebar */}
      <div className="flex">
        {/* Sidebar de navegación */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <AdminNavigation />
        </div>
        
        {/* Contenido principal */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
