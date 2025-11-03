'use client';

import { AppNotification } from '@/context/NotificationsContext';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Clock3 } from 'lucide-react';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function NotificationItem({ notification, onMarkRead, onRemove }: NotificationItemProps) {
  const created = new Date(notification.createdAt);
  const timeLabel = created.toLocaleString();

  return (
    <div className={`flex items-start gap-3 p-3 rounded-md ${notification.isRead ? 'bg-slate-700/30' : 'bg-slate-700/60'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white truncate">{notification.title}</p>
          <span className="ml-2 shrink-0 inline-flex items-center text-xs text-slate-400"><Clock3 className="h-3 w-3 mr-1" />{timeLabel}</span>
        </div>
        <p className="text-sm text-slate-300 mt-1 break-words">{notification.message}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        {!notification.isRead && (
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700" onClick={() => onMarkRead(notification.id)}>
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button size="sm" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700" onClick={() => onRemove(notification.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


