'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Heart, 
  Settings, 
  LogOut,
  Edit,
  Shield,
  CreditCard
} from 'lucide-react';
import ProfileNotificationSettings from '@/components/profile/ProfileNotificationSettings';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import AvatarUploader from '@/components/profile/AvatarUploader';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';

/**
 * Profile Page - Página de perfil del usuario
 * URL: /profile
 * Features: Información del usuario, opciones de cuenta, protegida por auth
 */
export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const avatarOverride = typeof window !== 'undefined' ? localStorage.getItem('profile_avatar_override') : null;
  const currentAvatar = avatarOverride || user?.avatar;

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Refrescar avatar cuando se actualice desde el uploader
  useEffect(() => {
    const handler = (e: Event) => {
      // No necesitamos hacer nada aquí, el render leerá de localStorage
      // Forzar re-render con un no-op setState si fuera necesario (no aquí)
    };
    window.addEventListener('profile:avatarUpdated', handler);
    return () => window.removeEventListener('profile:avatarUpdated', handler);
  }, []);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Mostrar loading si no hay usuario pero está autenticado
  if (isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (evita flash)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al inicio
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
            <div></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentAvatar} alt={user.name} />
                    <AvatarFallback className="bg-[#FF385C] text-white text-xl">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-white text-xl">{user.name}</CardTitle>
                <CardDescription className="text-slate-400">{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Cuenta verificada
                  </div>
                </div>
                
                <Separator className="my-4 bg-slate-700" />
                
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Account Settings */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuración de Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Información Personal
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Notificaciones
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Privacidad
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Métodos de Pago
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile customization */}
            <div className="space-y-6">
              <ProfileEditForm />
              <AvatarUploader />
              <ChangePasswordForm />
            </div>

            {/* Notification Settings */}
            <ProfileNotificationSettings />

            {/* Activity */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Mi Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-slate-400">Reservas</div>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-slate-400">Favoritos</div>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-slate-400">Reseñas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Ver Favoritos
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Mis Reservas
                </Button>
                <Separator className="bg-slate-700" />
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="w-full bg-transparent border-red-600 text-red-400 hover:bg-red-600/10 justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}


