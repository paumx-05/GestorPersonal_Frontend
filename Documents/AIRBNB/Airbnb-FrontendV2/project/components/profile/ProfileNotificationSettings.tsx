'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationsContext';

// Types for component props and notification settings
interface ProfileNotificationSettingsProps {
  className?: string;
}

interface NotificationSettings {
  enableEmail: boolean;
  enablePush: boolean;
  enableSound: boolean;
  marketingOptIn: boolean;
  muteAll: boolean;
}

interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
}

export default function ProfileNotificationSettings({ className }: ProfileNotificationSettingsProps) {
  const { settings, updateSettings, addNotification } = useNotifications();

  // Handle notification test with early returns
  const handleTestNotification = (): void => {
    const testNotification: NotificationData = {
      title: 'Prueba de notificación',
      message: 'Así se verá una notificación nueva.',
      type: 'info'
    };

    try {
      addNotification(testNotification);
    } catch (error) {
      console.error('Failed to add test notification:', error);
    }
  };

  // Handle setting updates with type safety
  const handleSettingChange = (key: keyof NotificationSettings) => 
    (value: boolean): void => {
      try {
        updateSettings({ [key]: value });
      } catch (error) {
        console.error(`Failed to update ${key}:`, error);
      }
    };

  return (
    <Card className={`bg-white border-2 border-slate-200 shadow-md rounded-sm ${className ?? ''}`}>
      <CardHeader>
        <CardTitle className="text-slate-900">Notificaciones</CardTitle>
        <CardDescription className="text-slate-600">Gestiona cómo quieres recibir notificaciones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label 
            htmlFor="email-notifications" 
            className="text-slate-800 text-sm font-medium cursor-pointer"
          >
            Recibir emails
          </label>
          <Switch 
            id="email-notifications"
            checked={settings.enableEmail} 
            onCheckedChange={handleSettingChange('enableEmail')}
            aria-label="Activar notificaciones por email"
          />
        </div>
        <div className="flex items-center justify-between">
          <label 
            htmlFor="push-notifications" 
            className="text-slate-800 text-sm font-medium cursor-pointer"
          >
            Notificaciones push
          </label>
          <Switch 
            id="push-notifications"
            checked={settings.enablePush} 
            onCheckedChange={handleSettingChange('enablePush')}
            aria-label="Activar notificaciones push"
          />
        </div>
        <div className="flex items-center justify-between">
          <label 
            htmlFor="sound-notifications" 
            className="text-slate-800 text-sm font-medium cursor-pointer"
          >
            Sonido de notificaciones
          </label>
          <Switch 
            id="sound-notifications"
            checked={settings.enableSound} 
            onCheckedChange={handleSettingChange('enableSound')}
            aria-label="Activar sonido de notificaciones"
          />
        </div>
        <div className="flex items-center justify-between">
          <label 
            htmlFor="marketing-notifications" 
            className="text-slate-800 text-sm font-medium cursor-pointer"
          >
            Marketing y promociones
          </label>
          <Switch 
            id="marketing-notifications"
            checked={settings.marketingOptIn} 
            onCheckedChange={handleSettingChange('marketingOptIn')}
            aria-label="Activar notificaciones de marketing"
          />
        </div>
        <div className="flex items-center justify-between">
          <label 
            htmlFor="mute-all-notifications" 
            className="text-slate-800 text-sm font-medium cursor-pointer"
          >
            Silenciar todas
          </label>
          <Switch 
            id="mute-all-notifications"
            checked={settings.muteAll} 
            onCheckedChange={handleSettingChange('muteAll')}
            aria-label="Silenciar todas las notificaciones"
          />
        </div>
        <Button
          className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-sm"
          onClick={handleTestNotification}
          aria-label="Probar notificación de prueba"
          tabIndex={0}
        >
          Probar notificación
        </Button>
      </CardContent>
    </Card>
  );
}


