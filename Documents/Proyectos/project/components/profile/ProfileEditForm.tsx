'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfileEditForm() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [isSaved, setIsSaved] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  const handleSave = () => {
    // Mock: persist in localStorage to simulate profile update
    try {
      const raw = localStorage.getItem('airbnb_auth_token');
      if (raw) {
        // In a real app, call API and update context
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch {}
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Archivo no válido. Selecciona una imagen.');
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } catch {
      setUploadError('No se pudo leer la imagen.');
    }
  };

  const applyUploadedAvatar = () => {
    if (!preview) return;
    try {
      localStorage.setItem('profile_avatar_override', preview);
      window.dispatchEvent(new CustomEvent('profile:avatarUpdated', { detail: { url: preview } }));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      setUploadError('No se pudo guardar el avatar.');
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Información Personal</CardTitle>
        <CardDescription className="text-slate-400">Actualiza tu nombre y revisa tu correo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Nombre</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Email</label>
          <Input value={user?.email ?? ''} readOnly className="bg-slate-700 border-slate-600 text-white opacity-70" />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Subir nueva foto</label>
          <input type="file" accept="image/*" onChange={onFileChange} className="block w-full text-sm text-slate-300" />
          {preview && (
            <div className="mt-3">
              <img src={preview} alt="Preview" className="h-24 w-24 rounded-full object-cover border border-slate-600" />
              <div className="mt-2 flex gap-2">
                <Button onClick={applyUploadedAvatar} className="bg-[#FF385C] hover:bg-[#E31C5F] text-white">Usar esta imagen</Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setPreview(null)}>Cancelar</Button>
              </div>
            </div>
          )}
          {uploadError && <div className="text-sm text-red-400 mt-2">{uploadError}</div>}
        </div>

        <Button onClick={handleSave} className="bg-[#FF385C] hover:bg-[#E31C5F] text-white">Guardar cambios</Button>
        {isSaved && <div className="text-sm text-green-400">Cambios guardados</div>}
      </CardContent>
    </Card>
  );
}


