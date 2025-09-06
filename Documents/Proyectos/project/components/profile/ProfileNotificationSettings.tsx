'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationsContext';

export default function ProfileNotificationSettings() {
  const { settings, updateSettings, addNotification } = useNotifications();

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Notificaciones</CardTitle>
        <CardDescription className="text-slate-400">Gestiona cómo quieres recibir notificaciones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Recibir emails</span>
          <Switch checked={settings.enableEmail} onCheckedChange={(v) => updateSettings({ enableEmail: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Notificaciones push</span>
          <Switch checked={settings.enablePush} onCheckedChange={(v) => updateSettings({ enablePush: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Sonido de notificaciones</span>
          <Switch checked={settings.enableSound} onCheckedChange={(v) => updateSettings({ enableSound: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Marketing y promociones</span>
          <Switch checked={settings.marketingOptIn} onCheckedChange={(v) => updateSettings({ marketingOptIn: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Silenciar todas</span>
          <Switch checked={settings.muteAll} onCheckedChange={(v) => updateSettings({ muteAll: v })} />
        </div>
        <Button
          className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
          onClick={() => addNotification({ title: 'Prueba de notificación', message: 'Así se verá una notificación nueva.', type: 'info' })}
        >
          Probar notificación
        </Button>
      </CardContent>
    </Card>
  );
}


