'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

// Types for component props and state
interface AvatarUploaderProps {
  className?: string;
}

interface AvatarUpdateEvent {
  detail: {
    url: string;
  };
}

export default function AvatarUploader({ className }: AvatarUploaderProps) {
  const { user } = useAuth();
  const [url, setUrl] = useState<string>(user?.avatar ?? '');
  const [saved, setSaved] = useState<boolean>(false);

  // Generate user initials from name
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Handle avatar save with early returns
  const handleSave = (): void => {
    if (!url.trim()) {
      return;
    }

    try {
      localStorage.setItem('profile_avatar_override', url);
      setSaved(true);
      // Notify app to refresh displayed avatar
      const customEvent = new CustomEvent('profile:avatarUpdated', { 
        detail: { url } 
      });
      window.dispatchEvent(customEvent);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUrl(e.target.value);
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className ?? ''}`}>
      <CardHeader>
        <CardTitle className="text-white">Foto de Perfil</CardTitle>
        <CardDescription className="text-slate-400">Actualiza tu avatar mediante URL</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={url} 
              alt={`Avatar de ${user?.name ?? 'Usuario'}`} 
            />
            <AvatarFallback className="bg-[#FF385C] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input 
              id="avatar-url-input"
              value={url} 
              onChange={handleUrlChange}
              onKeyDown={handleKeyDown}
              placeholder="https://..." 
              className="bg-slate-700 border-slate-600 text-white"
              aria-label="URL de imagen de avatar"
              tabIndex={0}
            />
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
          aria-label="Guardar avatar"
          tabIndex={0}
        >
          Guardar avatar
        </Button>
        {saved && (
          <div className="text-sm text-green-400" role="status">
            Avatar actualizado
          </div>
        )}
      </CardContent>
    </Card>
  );
}


