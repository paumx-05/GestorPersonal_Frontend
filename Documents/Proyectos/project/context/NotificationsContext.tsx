'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'promo';

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
  | { type: 'ADD'; payload: AppNotification }
  | { type: 'MARK_READ'; payload: { id: string } }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE'; payload: { id: string } }
  | { type: 'CLEAR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'HYDRATE'; payload: { notifications: AppNotification[]; settings: NotificationSettings } };

const NOTIFICATIONS_STORAGE_KEY = 'notifications';
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
    case 'HYDRATE':
      return {
        notifications: action.payload.notifications,
        settings: action.payload.settings,
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

interface NotificationsContextValue extends NotificationsState {
  addNotification: (input: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const notifications: AppNotification[] = rawNotifications ? JSON.parse(rawNotifications) : [];
      const settings: NotificationSettings = rawSettings ? { ...defaultSettings, ...JSON.parse(rawSettings) } : defaultSettings;
      dispatch({ type: 'HYDRATE', payload: { notifications, settings } });
    } catch {
      dispatch({ type: 'HYDRATE', payload: { notifications: [], settings: defaultSettings } });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(state.notifications));
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
    } catch {
      // ignore write errors
    }
  }, [state.notifications, state.settings]);

  const addNotification = useCallback<NotificationsContextValue['addNotification']>((input) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const createdAt = new Date().toISOString();
    const notification: AppNotification = {
      id,
      title: input.title,
      message: input.message,
      type: input.type,
      createdAt,
      isRead: false,
    };
    if (state.settings.muteAll) return;
    dispatch({ type: 'ADD', payload: notification });
  }, [state.settings.muteAll]);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_READ', payload: { id } });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', payload: { id } });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

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
    unreadCount,
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


