'use client';

import { useNotifications } from '@/context/NotificationsContext';
import NotificationItem from './NotificationItem';
import { Button } from '@/components/ui/button';

export default function NotificationList() {
  const { notifications, markAsRead, removeNotification, markAllAsRead, clearAll } = useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-300">No tienes notificaciones</div>
    );
  }

  return (
    <div className="w-80">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-slate-200 text-sm font-semibold">Notificaciones</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700" onClick={markAllAsRead}>Marcar todas</Button>
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700" onClick={clearAll}>Limpiar</Button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto space-y-2 px-3 pb-3">
        {notifications.map(n => (
          <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} onRemove={removeNotification} />
        ))}
      </div>
    </div>
  );
}


