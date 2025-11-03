'use client';

/**
 * Componente que muestra una notificación de bienvenida automáticamente
 * cada vez que el usuario inicia sesión (login activo)
 */
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationsContext';

const WELCOME_NOTIFICATION_KEY = 'welcome_notification_session';

export default function WelcomeNotification() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { addNotification } = useNotifications();
  const previousAuthStateRef = useRef<{ isAuthenticated: boolean; userId: string | null }>({
    isAuthenticated: false,
    userId: null,
  });
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Esperar a que la autenticación termine de cargar
    if (isLoading) {
      return;
    }

    // En el primer render, solo guardar el estado actual sin mostrar notificación
    if (!hasInitializedRef.current) {
      previousAuthStateRef.current = {
        isAuthenticated: isAuthenticated,
        userId: user?.id || null,
      };
      hasInitializedRef.current = true;
      
      // Si el usuario ya estaba autenticado al cargar (sesión persistente), no mostrar notificación
      if (isAuthenticated && user) {
        // Marcar en sessionStorage que ya vimos este usuario en esta sesión
        sessionStorage.setItem(WELCOME_NOTIFICATION_KEY, user.id);
      }
      return;
    }

    const previousAuth = previousAuthStateRef.current;
    const currentAuth = {
      isAuthenticated: isAuthenticated,
      userId: user?.id || null,
    };

    // Detectar si hubo un cambio de estado de autenticación
    const wasNotAuthenticated = !previousAuth.isAuthenticated;
    const isNowAuthenticated = currentAuth.isAuthenticated && currentAuth.userId !== null;
    
    // Verificar si ya se mostró la notificación para este usuario en esta sesión
    const sessionUserId = sessionStorage.getItem(WELCOME_NOTIFICATION_KEY);
    const hasShownInSession = sessionUserId === currentAuth.userId;

    // Solo mostrar notificación si:
    // 1. El usuario pasó de NO autenticado a autenticado (login activo)
    // 2. Y no se ha mostrado ya la notificación para este usuario en esta sesión
    const isLoginEvent = wasNotAuthenticated && isNowAuthenticated;
    const shouldShow = isLoginEvent && !hasShownInSession && user;

    if (shouldShow) {
      // Pequeño delay para asegurar que el contexto de notificaciones esté completamente listo
      const timer = setTimeout(() => {
        try {
          addNotification({
            title: `¡Bienvenido de nuevo, ${user.name}! 👋`,
            message: 'Esperamos que disfrutes tu experiencia en nuestra plataforma.',
            type: 'success',
          });
          
          console.log('✅ [WelcomeNotification] Notificación de bienvenida mostrada para:', user.name);
          
          // Marcar en sessionStorage que ya mostramos la notificación para este usuario
          if (user.id) {
            sessionStorage.setItem(WELCOME_NOTIFICATION_KEY, user.id);
          }
        } catch (error) {
          console.error('💥 [WelcomeNotification] Error mostrando notificación de bienvenida:', error);
        }
      }, 1000); // Delay de 1 segundo para asegurar que todo esté inicializado

      return () => clearTimeout(timer);
    }

    // Actualizar el estado anterior para la próxima vez
    previousAuthStateRef.current = currentAuth;

    // Si el usuario cerró sesión, limpiar el sessionStorage
    if (!isAuthenticated && previousAuth.isAuthenticated) {
      sessionStorage.removeItem(WELCOME_NOTIFICATION_KEY);
    }
  }, [isAuthenticated, user, isLoading, addNotification]);

  // Este componente no renderiza nada, solo maneja la lógica
  return null;
}

