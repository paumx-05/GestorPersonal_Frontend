'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (next.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (next !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Mock success
    setSuccess(true);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Cambiar contraseña</CardTitle>
        <CardDescription className="text-slate-400">Actualiza tu contraseña de forma segura</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Contraseña actual</label>
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nueva contraseña</label>
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Confirmar contraseña</label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          {success && <div className="text-sm text-green-400">Contraseña actualizada</div>}
          <Button type="submit" className="bg-[#FF385C] hover:bg-[#E31C5F] text-white">Guardar</Button>
        </form>
      </CardContent>
    </Card>
  );
}


