'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { notificationsService } from '@/lib/api/notifications';
import { Notification } from '@/schemas/notifications';

export type NotificationType = 'info' | 'success' | 'warning' | 'promo';

// Alias para compatibilidad con componentes existentes
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: NotificationType;
  isRead: boolean;
}

export interface NotificationSettings {
  enableEmail: boolean;
  enablePush: boolean;
  enableSound: boolean;
  marketingOptIn: boolean;
  muteAll: boolean;
}

interface NotificationsState {
  notifications: AppNotification[];
  settings: NotificationSettings;
}

type NotificationsAction =
  | { type: 'SET_NOTIFICATIONS'; payload: AppNotification[] }
  | { type: 'ADD'; payload: AppNotification }
  | { type: 'MARK_READ'; payload: { id: string } }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE'; payload: { id: string } }
  | { type: 'CLEAR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const SETTINGS_STORAGE_KEY = 'notification_settings';

const defaultSettings: NotificationSettings = {
  enableEmail: true,
  enablePush: false,
  enableSound: true,
  marketingOptIn: false,
  muteAll: false,
};

const initialState: NotificationsState = {
  notifications: [],
  settings: defaultSettings,
};

function notificationsReducer(state: NotificationsState, action: NotificationsAction): NotificationsState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
      };
    case 'ADD':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 100),
      };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => (n.id === action.payload.id ? { ...n, isRead: true } : n)),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      };
    case 'REMOVE':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.id),
      };
    case 'CLEAR':
      return {
        ...state,
        notifications: [],
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    default:
      return state;
  }
}

// Función helper para convertir Notification del backend a AppNotification
function mapNotificationFromBackend(notification: Notification): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as NotificationType,
    createdAt: notification.createdAt,
    isRead: notification.isRead,
  };
}

interface NotificationsContextValue extends NotificationsState {
  addNotification: (input: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  refreshNotifications: () => Promise<void>;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar settings desde localStorage (solo UI preferences)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const settings: NotificationSettings = rawSettings ? { ...defaultSettings, ...JSON.parse(rawSettings) } : defaultSettings;
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    } catch {
      dispatch({ type: 'UPDATE_SETTINGS', payload: defaultSettings });
    }
  }, []);

  // Guardar settings en localStorage cuando cambien
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
    } catch {
      // ignore write errors
    }
  }, [state.settings]);

  // Cargar notificaciones desde el backend al montar el componente
  useEffect(() => {
    refreshNotifications();
  }, []);

  // Función para cargar notificaciones desde el backend
  const refreshNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 [NotificationsContext] Cargando notificaciones desde el backend...');
      const response = await notificationsService.getAllNotifications();
      
      if (response.success && response.data) {
        const mappedNotifications = response.data.map(mapNotificationFromBackend);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: mappedNotifications });
        console.log('✅ [NotificationsContext] Notificaciones cargadas:', mappedNotifications.length);
      } else {
        console.error('❌ [NotificationsContext] Error cargando notificaciones:', response.message);
        setError(response.message || 'Error cargando notificaciones');
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      }
    } catch (err) {
      console.error('💥 [NotificationsContext] Error crítico cargando notificaciones:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión');
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para agregar notificación (solo UI - no se guarda en backend, es para pruebas)
  const addNotification = useCallback<NotificationsContextValue['addNotification']>(async (input) => {
    if (state.settings.muteAll) return;
    
    // Crear notificación local para pruebas UI
    const notification: AppNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: input.title,
      message: input.message,
      type: input.type,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    
    dispatch({ type: 'ADD', payload: notification });
    
    // Nota: Para crear notificaciones reales en el backend, se necesitaría un endpoint POST /api/notifications
    // que actualmente no está implementado según el patrón REST estándar
  }, [state.settings.muteAll]);

  // Marcar notificación como leída en el backend y actualizar estado local
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      dispatch({ type: 'MARK_READ', payload: { id } });
      
      const response = await notificationsService.markAsRead(id);
      
      if (!response.success) {
        // Revertir si falla
        await refreshNotifications();
        console.error('❌ [NotificationsContext] Error marcando como leída:', response.message);
      } else {
        console.log('✅ [NotificationsContext] Notificación marcada como leída');
      }
    } catch (err) {
      // Revertir si falla
      await refreshNotifications();
      console.error('💥 [NotificationsContext] Error crítico marcando como leída:', err);
    }
  }, [refreshNotifications]);

  // Marcar todas como leídas en el backend
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      dispatch({ type: 'MARK_ALL_READ' });
      
      const response = await notificationsService.markAllAsRead();
      
      if (!response.success) {
        // Revertir si falla
        await refreshNotifications();
        console.error('❌ [NotificationsContext] Error marcando todas como leídas:', response.message);
      } else {
        console.log('✅ [NotificationsContext] Todas las notificaciones marcadas como leídas');
      }
    } catch (err) {
      // Revertir si falla
      await refreshNotifications();
      console.error('💥 [NotificationsContext] Error crítico marcando todas como leídas:', err);
    }
  }, [refreshNotifications]);

  // Eliminar notificación del backend
  const removeNotification = useCallback(async (id: string) => {
    try {
      // Optimistic update
      dispatch({ type: 'REMOVE', payload: { id } });
      
      const response = await notificationsService.deleteNotification(id);
      
      if (!response.success) {
        // Revertir si falla
        await refreshNotifications();
        console.error('❌ [NotificationsContext] Error eliminando notificación:', response.message);
      } else {
        console.log('✅ [NotificationsContext] Notificación eliminada');
      }
    } catch (err) {
      // Revertir si falla
      await refreshNotifications();
      console.error('💥 [NotificationsContext] Error crítico eliminando notificación:', err);
    }
  }, [refreshNotifications]);

  // Limpiar todas las notificaciones (solo local, no afecta backend)
  const clearAll = useCallback(async () => {
    // Eliminar todas las notificaciones una por una del backend
    const deletePromises = state.notifications.map(n => notificationsService.deleteNotification(n.id));
    await Promise.all(deletePromises);
    
    // Refrescar desde el backend
    await refreshNotifications();
  }, [state.notifications, refreshNotifications]);

  const updateSettings = useCallback((settings: Partial<NotificationSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const unreadCount = useMemo(() => state.notifications.filter(n => !n.isRead).length, [state.notifications]);

  const value: NotificationsContextValue = {
    notifications: state.notifications,
    settings: state.settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
    refreshNotifications,
    unreadCount,
    isLoading,
    error,
  };

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
};

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}


