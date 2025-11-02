'use client';

/**
 * Notifications Page - Página de notificaciones del usuario
 * URL: /notifications
 * Vista ampliada para leer y gestionar notificaciones
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  RefreshCw, 
  CheckCheck, 
  Trash2, 
  Check, 
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Gift,
  Loader2
} from 'lucide-react';
import NotificationItem from '@/components/notifications/NotificationItem';
import { AppNotification } from '@/context/NotificationsContext';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotificationsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { 
    notifications, 
    isLoading, 
    error, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    refreshNotifications,
    clearAll
  } = useNotifications();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Obtener ícono según el tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'promo': return <Gift className="h-5 w-5 text-purple-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Obtener color según el tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800';
      case 'success': return 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800';
      case 'promo': return 'border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800';
      case 'error': return 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20 dark:border-gray-800';
    }
  };

  // Agrupar notificaciones por tipo
  const groupedNotifications = {
    unread: notifications.filter(n => !n.isRead),
    read: notifications.filter(n => n.isRead),
    info: notifications.filter(n => n.type === 'info'),
    success: notifications.filter(n => n.type === 'success'),
    warning: notifications.filter(n => n.type === 'warning'),
    promo: notifications.filter(n => n.type === 'promo'),
    error: notifications.filter(n => n.type === 'error'),
  };

  // No mostrar nada si no está autenticado (evita flash)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Bell className="h-8 w-8 text-[#FF385C]" />
                Notificaciones
              </h1>
              <p className="text-slate-400 mt-2">
                {unreadCount > 0 
                  ? `${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} no leída${unreadCount !== 1 ? 's' : ''}`
                  : 'Todas tus notificaciones están al día'
                }
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => refreshNotifications()}
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </>
                )}
              </Button>
              
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
              
              {notifications.length > 0 && (
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar todas
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="link"
                onClick={() => refreshNotifications()}
                className="p-0 h-auto ml-2"
              >
                Intentar de nuevo
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF385C]" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-16 w-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No tienes notificaciones
              </h3>
              <p className="text-slate-400 text-center max-w-md">
                Cuando recibas notificaciones, aparecerán aquí. Te mantendremos informado sobre actividades importantes.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {!isLoading && notifications.length > 0 && (
          <div className="space-y-4">
            {/* Sección de Notificaciones No Leídas */}
            {groupedNotifications.unread.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 bg-[#FF385C] rounded-full"></span>
                  No leídas ({groupedNotifications.unread.length})
                </h2>
                <div className="space-y-3">
                  {groupedNotifications.unread.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`border-2 border-[#FF385C]/50 ${getTypeColor(notification.type)}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {new Date(notification.createdAt).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsRead(notification.id)}
                                  className="border-green-600 text-green-400 hover:bg-green-950/20"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Marcar leída
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeNotification(notification.id)}
                                  className="border-red-600 text-red-400 hover:bg-red-950/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de Notificaciones Leídas */}
            {groupedNotifications.read.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">
                  Leídas ({groupedNotifications.read.length})
                </h2>
                <div className="space-y-3">
                  {groupedNotifications.read.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`border ${getTypeColor(notification.type)} opacity-75 hover:opacity-100 transition-opacity`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {new Date(notification.createdAt).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeNotification(notification.id)}
                                  className="border-red-600 text-red-400 hover:bg-red-950/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estadísticas */}
        {notifications.length > 0 && (
          <Card className="mt-8 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Estadísticas</CardTitle>
              <CardDescription className="text-slate-400">
                Resumen de tus notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {notifications.length}
                  </div>
                  <div className="text-sm text-slate-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FF385C] mb-1">
                    {unreadCount}
                  </div>
                  <div className="text-sm text-slate-400">No leídas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500 mb-1">
                    {groupedNotifications.info.length}
                  </div>
                  <div className="text-sm text-slate-400">Información</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500 mb-1">
                    {groupedNotifications.success.length}
                  </div>
                  <div className="text-sm text-slate-400">Éxitos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500 mb-1">
                    {groupedNotifications.promo.length}
                  </div>
                  <div className="text-sm text-slate-400">Promociones</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

