'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { 
  Mail, 
  Calendar, 
  Heart, 
  Shield,
  LogOut
} from 'lucide-react';
import ProfileNotificationSettings from '@/components/profile/ProfileNotificationSettings';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { profileService } from '@/lib/api/profile';
import Logo from '@/components/header/Logo';
import UserMenu from '@/components/auth/UserMenu';

/**
 * Profile Page - Página de perfil del usuario
 * URL: /profile
 * Features: Información del usuario, opciones de cuenta, protegida por auth
 */
export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const router = useRouter();
  
  // Estado para descripción local (se sincroniza con backend)
  const [userDescription, setUserDescription] = useState<string>(
    user?.description || ''
  );
  const [isSavingDescription, setIsSavingDescription] = useState<boolean>(false);
  const [descriptionError, setDescriptionError] = useState<string>('');

  // Sincronizar descripción cuando cambia el usuario (solo si realmente cambió)
  useEffect(() => {
    if (user?.description !== undefined && user.description !== userDescription) {
      setUserDescription(user.description || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.description]); // Solo depender de description, no de todo el objeto user

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);


  const getUserInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);
  
  // Memoizar la URL del avatar para evitar re-renders innecesarios
  const avatarSrc = useMemo(() => {
    if (!user?.avatar) return undefined;
    
    // Agregar cache buster solo si es necesario (cuando cambia realmente el avatar)
    // No agregarlo en cada render para evitar que parpadee
    const separator = user.avatar.includes('?') ? '&' : '?';
    return `${user.avatar}${separator}v=${user.avatar}`; // Usar la URL como version
  }, [user?.avatar]);

  // Debounce para guardar descripción
  useEffect(() => {
    // No guardar en el primer render o si el valor viene del servidor
    if (user?.description === userDescription) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSavingDescription(true);
      setDescriptionError('');
      
      try {
        const response = await profileService.updateProfile({
          description: userDescription.trim() || null
        });

        if (response.success && response.data) {
          // Actualizar solo los campos que realmente vienen en la respuesta
          // NO actualizar avatar si no viene en la respuesta (solo estamos actualizando description)
          const updateData: { name?: string; description?: string | null; avatar?: string } = {};
          
          if (response.data.name) {
            updateData.name = response.data.name;
          }
          
          if (response.data.description !== undefined) {
            updateData.description = response.data.description;
          }
          
          // Solo actualizar avatar si realmente viene en la respuesta
          // Esto evita que se borre el avatar al actualizar solo la descripción
          if (response.data.avatar !== undefined && response.data.avatar !== null) {
            updateData.avatar = response.data.avatar;
          }
          
          updateUser(updateData);
        } else {
          setDescriptionError(response.message || 'Error al guardar la descripción');
          // Revertir al valor anterior si falla
          if (user?.description !== undefined) {
            setUserDescription(user.description || '');
          }
        }
      } catch (error) {
        console.error('Error guardando descripción:', error);
        setDescriptionError('Error de conexión. Por favor, intenta de nuevo.');
        // Revertir al valor anterior si falla
        if (user?.description !== undefined) {
          setUserDescription(user.description || '');
        }
      } finally {
        setIsSavingDescription(false);
      }
    }, 1500); // Esperar 1.5 segundos después del último cambio

    return () => clearTimeout(timeoutId);
  }, [userDescription]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handler para cambios en el textarea
  const handleDescriptionChange = (value: string) => {
    // Actualizar estado local inmediatamente para mejor UX
    setUserDescription(value);
    setDescriptionError('');
  };

  // Callback para actualizar UI después de actualizar perfil
  const handleProfileUpdate = () => {
    // Ya se actualiza automáticamente desde la respuesta de updateProfile
    // No necesitamos hacer nada adicional
  };

  // Mostrar loading si no hay usuario pero está autenticado
  if (isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-slate-700">Cargando...</div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (evita flash)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header simplificado para perfil */}
      <header className="bg-white border-b-2 border-slate-200 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center flex-1">
              <Link href="/" className="flex-shrink-0">
                <Logo />
              </Link>
            </div>

            {/* Center - Título */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl font-bold text-slate-900">Mi Perfil</h1>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-2 flex-1 justify-end">
              <UserMenu />
              
              {/* Botón de cerrar sesión directo */}
              <Button
                variant="ghost"
                onClick={async () => {
                  await logout();
                  router.push('/');
                }}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-sm transition-colors duration-200"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header - Horizontal Layout */}
        <Card className="bg-white border-2 border-slate-200 shadow-lg mb-6 rounded-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 ring-4 ring-slate-200 shadow-md rounded-sm">
                  <AvatarImage 
                    src={avatarSrc}
                    alt={user.name}
                    key={user?.avatar || 'no-avatar'} // Key estable, solo cambia si realmente cambia el avatar
                  />
                  <AvatarFallback className="bg-[#FF385C] text-white text-3xl rounded-sm">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name and Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-1">{user.name}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-slate-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-sm">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-slate-700 font-medium">Verificado</span>
                  </div>
                </div>

                {/* Description Section */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Descripción breve sobre ti
                  </label>
                  <Textarea
                    value={userDescription}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Cuéntales a otros usuarios un poco sobre ti..."
                    className="min-h-[100px] bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] rounded-sm"
                    maxLength={500}
                    disabled={isSavingDescription}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500">
                      {userDescription.length}/500 caracteres
                    </p>
                    {isSavingDescription && (
                      <p className="text-xs text-slate-600 italic">Guardando...</p>
                    )}
                    {descriptionError && (
                      <p className="text-xs text-red-600">{descriptionError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid - Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Edit Form */}
            <ProfileEditForm onUpdate={handleProfileUpdate} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <Card className="bg-white border-2 border-slate-200 shadow-md rounded-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-[#FF385C]" />
                  Mi Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-50 rounded-sm border-2 border-slate-200">
                    <div className="text-3xl font-bold text-[#FF385C]">0</div>
                    <div className="text-sm text-slate-600 mt-1">Reservas</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-sm border-2 border-slate-200">
                    <div className="text-3xl font-bold text-[#FF385C]">0</div>
                    <div className="text-sm text-slate-600 mt-1">Favoritos</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-sm border-2 border-slate-200">
                    <div className="text-3xl font-bold text-[#FF385C]">0</div>
                    <div className="text-sm text-slate-600 mt-1">Reseñas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <ProfileNotificationSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
