'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { profileService } from '@/lib/api/profile';

// Types for component props and form data
interface ProfileEditFormProps {
  className?: string;
  onUpdate?: () => void;
}

interface ProfileFormData {
  name: string;
}

export default function ProfileEditForm({ className, onUpdate }: ProfileEditFormProps) {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name ?? ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  // Actualizar formData cuando cambia el usuario
  useEffect(() => {
    if (user?.name) {
      setFormData({ name: user.name });
    }
  }, [user]);

  // Handle profile save with backend integration
  const handleSave = async (): Promise<void> => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsSaved(false);

    try {
      const updateData: { name: string; avatar?: File } = {
        name: formData.name.trim()
      };

      // Incluir avatar si hay archivo seleccionado
      if (avatarFile) {
        updateData.avatar = avatarFile;
      }

      const response = await profileService.updateProfile(updateData);

      if (response.success && response.data) {
        setIsSaved(true);
        setPreview(null);
        setAvatarFile(null);
        
        console.log('🔍 [ProfileEditForm] Respuesta del backend:', JSON.stringify(response.data, null, 2));
        console.log('🔍 [ProfileEditForm] Avatar recibido:', response.data.avatar);
        
        // Actualizar el usuario directamente desde la respuesta (más eficiente y seguro)
        // Usar los datos actualizados del backend sin hacer otra llamada
        const avatarUrl = response.data.avatar || undefined;
        
        updateUser({
          name: response.data.name,
          avatar: avatarUrl,
        });
        
        console.log('✅ [ProfileEditForm] Usuario actualizado con avatar:', avatarUrl);
        
        // Disparar evento para notificar actualización de avatar
        if (avatarUrl) {
          const customEvent = new CustomEvent('user:avatarUpdated', {
            detail: { url: avatarUrl }
          });
          window.dispatchEvent(customEvent);
          console.log('📢 [ProfileEditForm] Evento user:avatarUpdated disparado');
        }
        
        // Callback opcional para notificar actualización
        if (onUpdate) {
          onUpdate();
        }

        setTimeout(() => setIsSaved(false), 3000);
      } else {
        // Mostrar errores de validación
        if (response.errors && response.errors.length > 0) {
          const errorMessages = response.errors.map(e => e.message).join(', ');
          setError(errorMessages);
        } else {
          setError(response.message || 'Error al actualizar el perfil');
        }
      }
    } catch (err) {
      console.error('Error guardando perfil:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file change with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUploadError('');
    setError('');
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Formato no válido. Use JPG, PNG o WebP.');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    // Guardar archivo para subir
    setAvatarFile(file);

    // Crear preview
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setPreview(result);
        }
      };
      reader.onerror = () => {
        setUploadError('No se pudo leer la imagen.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError('Error al procesar la imagen.');
      console.error('File reading error:', error);
    }
  };

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
    setError('');
  };

  // Clear preview
  const handleClearPreview = (): void => {
    setPreview(null);
    setAvatarFile(null);
    setUploadError('');
    
    // Resetear el input file
    const fileInput = document.getElementById('profile-avatar-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card className={`bg-white border-2 border-slate-200 shadow-md rounded-sm ${className ?? ''}`}>
      <CardHeader>
        <CardTitle className="text-slate-900">Información Personal</CardTitle>
        <CardDescription className="text-slate-600">Actualiza tu nombre y revisa tu correo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label 
            htmlFor="profile-name" 
            className="block text-sm font-medium text-slate-800 mb-1"
          >
            Nombre
          </label>
          <Input 
            id="profile-name"
            value={formData.name} 
            onChange={handleNameChange} 
            className="bg-white border-2 border-slate-300 text-slate-900 focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] rounded-sm"
            aria-label="Nombre de usuario"
            tabIndex={0}
            required
            disabled={isLoading}
            maxLength={100}
          />
          {error && (
            <div className="text-sm text-red-600 mt-1" role="alert">
              {error}
            </div>
          )}
        </div>
        <div>
          <label 
            htmlFor="profile-email" 
            className="block text-sm font-medium text-slate-800 mb-1"
          >
            Email
          </label>
          <Input 
            id="profile-email"
            value={user?.email ?? ''} 
            readOnly 
            className="bg-slate-50 border-2 border-slate-300 text-slate-600 rounded-sm"
            aria-label="Email de usuario (solo lectura)"
            tabIndex={-1}
          />
        </div>
        <div>
          <label 
            htmlFor="profile-avatar-upload" 
            className="block text-sm font-medium text-slate-800 mb-1"
          >
            Subir nueva foto
          </label>
          <input 
            id="profile-avatar-upload"
            type="file" 
            accept="image/jpeg,image/png,image/webp" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-[#FF385C] file:text-white hover:file:bg-[#E31C5F] file:cursor-pointer"
            aria-label="Seleccionar imagen de avatar"
            tabIndex={0}
            disabled={isLoading}
          />
          {preview && (
            <div className="mt-3">
              <img 
                src={preview} 
                alt="Vista previa del avatar" 
                className="h-24 w-24 rounded-sm object-cover border-2 border-slate-200 shadow-sm"
              />
              <div className="mt-2 flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm" 
                  onClick={handleClearPreview}
                  aria-label="Cancelar y eliminar vista previa"
                  tabIndex={0}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          {uploadError && (
            <div className="text-sm text-red-600 mt-2" role="alert">
              {uploadError}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Formatos: JPG, PNG o WebP. Máximo 5MB
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          className="bg-[#FF385C] hover:bg-[#E31C5F] text-white w-full rounded-sm"
          aria-label="Guardar cambios del perfil"
          tabIndex={0}
          disabled={isLoading || !formData.name.trim()}
        >
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        {isSaved && (
          <div className="text-sm text-green-600" role="status">
            Cambios guardados exitosamente
          </div>
        )}
      </CardContent>
    </Card>
  );
}
