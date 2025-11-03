'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Reset Password Page - Página de restablecimiento de contraseña
 * URL: /reset-password/[token]
 * Features: Formulario de reset con token, validación, redirección automática
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Validar token al cargar la página
  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido');
      return;
    }

    // Validar formato JWT (3 partes separadas por puntos)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      setError('Token de recuperación inválido');
      return;
    }

    // Decodificar payload para verificar expiración
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        setError('Token de recuperación expirado');
        return;
      }
      
      console.log('🔍 [ResetPassword] Token JWT válido:', {
        email: payload.email,
        type: payload.type,
        exp: payload.exp,
        tiempoRestante: payload.exp ? Math.floor((payload.exp - now) / 60) : 'N/A'
      });
    } catch (error) {
      console.log('❌ [ResetPassword] Error decodificando token:', error);
      setError('Token de recuperación inválido');
      return;
    }

    console.log('🔍 [ResetPassword] Token recibido:', token.substring(0, 30) + '...');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 [ResetPassword] Enviando reset de contraseña...');
      
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      console.log('📥 [ResetPassword] Respuesta:', data);

      if (response.ok && data.success) {
        setIsSuccess(true);
        
        // Auto-redirect después de 3 segundos
        setTimeout(() => {
          router.push('/login?message=password-reset-success');
        }, 3000);
      } else {
        setError(data.message || 'Error al restablecer la contraseña');
      }

    } catch (error) {
      console.error('💥 [ResetPassword] Error:', error);
      setError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(''); // Limpiar error al escribir
  };

  // Vista de éxito
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              ¡Contraseña Restablecida!
            </h1>
            <p className="text-slate-400">
              Tu contraseña ha sido actualizada exitosamente
            </p>
            <p className="text-sm text-slate-500">
              Serás redirigido al login en unos segundos...
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
            >
              Ir al Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header con Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <svg 
                width="102" 
                height="32" 
                fill="#FF385C" 
                viewBox="0 0 102 32"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <path d="M29.24 22.68c-.16-.39-.31-.8-.47-1.15l-.74-1.67-.03-.03c-2.2-4.8-4.55-9.68-7.04-14.48l-.1-.2c-.25-.47-.5-.99-.76-1.47-.32-.57-.63-1.18-1.14-1.76a5.3 5.3 0 00-8.2 0c-.47.58-.82 1.19-1.14 1.76-.25.52-.5 1-.76 1.47l-.1.2c-2.45 4.8-4.84 9.68-7.04 14.48l-.06.06c-.22.52-.48 1.06-.73 1.64-.16.35-.32.73-.48 1.15a6.8 6.8 0 007.2 9.23 8.38 8.38 0 003.18-1.1c1.3-.73 2.55-1.79 3.95-3.32 1.4 1.53 2.68 2.59 3.95 3.32A8.38 8.38 0 0022.75 32a6.79 6.79 0 006.75-5.83 5.94 5.94 0 00-.26-3.5zm-14.36 1.66c-1.72-2.2-2.84-4.22-3.22-5.95a5.2 5.2 0 01-.1-1.96c.07-.51.26-.96.52-1.34.6-.87 1.65-1.41 2.8-1.41a3.3 3.3 0 012.8 1.4c.26.4.45.84.51 1.35.1.58.06 1.25-.1 1.96-.38 1.7-1.5 3.74-3.21 5.95z"></path>
              </svg>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-slate-400">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Reset Password Form Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nueva Contraseña */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-slate-300">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  placeholder="Repite tu nueva contraseña"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restableciendo...
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </Button>
          </form>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link 
            href="/login"
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}