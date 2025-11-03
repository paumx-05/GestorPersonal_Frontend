'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/lib/api/auth';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onBackToForgotPassword: () => void;
}

export default function ResetPasswordForm({ 
  token, 
  onSuccess, 
  onBackToForgotPassword 
}: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { newPassword, confirmPassword } = formData;

    // Validaciones básicas
    if (!newPassword) {
      setError('La nueva contraseña es requerida');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // Llamada al servicio de autenticación
      const response = await authService.resetPassword(token, newPassword);
      
      if (response.success) {
        setIsSuccess(true);
        
        // Auto-redirect después de 2 segundos
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(response.message || 'Error al restablecer la contraseña. Intenta nuevamente.');
      }

    } catch (error) {
      setError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (field: keyof typeof formData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
      
      // Limpiar error al escribir
      if (error) setError('');
    };

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función para alternar visibilidad de confirmación
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Vista de éxito
  if (isSuccess) {
    return (
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          ¡Contraseña Restablecida!
        </h2>
        <p className="text-slate-400 mb-6">
          Tu contraseña ha sido actualizada exitosamente. Serás redirigido al login en unos segundos.
        </p>
        
        <Button
          onClick={onSuccess}
          className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
        >
          Ir al Login
        </Button>
      </div>
    );
  }

  // Formulario principal
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Descripción */}
      <div className="text-center mb-6">
        <p className="text-slate-400 text-sm">
          Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
        </p>
      </div>

      {/* Nueva Contraseña */}
      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-sm font-medium text-slate-300">
          Nueva Contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="newPassword"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.newPassword}
            onChange={handleInputChange('newPassword')}
            className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            placeholder="Mínimo 6 caracteres"
            disabled={isLoading}
            minLength={6}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirmar Contraseña */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
          Confirmar Contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            placeholder="Repite tu nueva contraseña"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
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
        className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Restableciendo contraseña...
          </>
        ) : (
          'Restablecer Contraseña'
        )}
      </Button>

      {/* Back to Forgot Password */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToForgotPassword}
          className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-200 text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Solicitar nuevo enlace
        </button>
      </div>

      {/* Información de Seguridad */}
      <div className="mt-6 p-4 bg-slate-700/50 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-2">
          Consejos para una contraseña segura:
        </h3>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Usa al menos 6 caracteres</li>
          <li>• Combina letras, números y símbolos</li>
          <li>• Evita información personal obvia</li>
          <li>• No reutilices contraseñas de otras cuentas</li>
        </ul>
      </div>
    </form>
  );
}
