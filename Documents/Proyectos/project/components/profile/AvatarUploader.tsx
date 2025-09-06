'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

export default function AvatarUploader() {
  const { user } = useAuth();
  const [url, setUrl] = useState(user?.avatar ?? '');
  const [saved, setSaved] = useState(false);

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const save = () => {
    try {
      localStorage.setItem('profile_avatar_override', url);
      setSaved(true);
      // Notificar a la app para refrescar avatar mostrado
      window.dispatchEvent(new CustomEvent('profile:avatarUpdated', { detail: { url } }));
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Foto de Perfil</CardTitle>
        <CardDescription className="text-slate-400">Actualiza tu avatar mediante URL</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={url} alt={user?.name ?? 'User'} />
            <AvatarFallback className="bg-[#FF385C] text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="bg-slate-700 border-slate-600 text-white" />
          </div>
        </div>
        <Button onClick={save} className="bg-[#FF385C] hover:bg-[#E31C5F] text-white">Guardar avatar</Button>
        {saved && <div className="text-sm text-green-400">Avatar actualizado</div>}
      </CardContent>
    </Card>
  );
}


