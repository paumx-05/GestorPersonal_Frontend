'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { authService } from '@/lib/api/auth';

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onSuccess, onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!email) {
      setError('El email es requerido');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      // Llamada real al backend
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setIsSuccess(true);
        
        // Auto-redirect después de 3 segundos
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        setError(response.message || 'Error al enviar el email. Intenta nuevamente.');
      }

    } catch (error) {
      setError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(''); // Limpiar error al escribir
  };

  // Vista de éxito
  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          ¡Email Enviado!
        </h3>
        <p className="text-slate-400">
          Hemos enviado un enlace de recuperación a <strong>{email}</strong>
        </p>
        <p className="text-sm text-slate-500">
          Revisa tu bandeja de entrada y spam. El enlace expira en 24 horas.
        </p>
        <Button
          onClick={onBackToLogin}
          variant="outline"
          className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al login
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
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-300">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={handleChange}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            placeholder="tu@email.com"
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
        disabled={isLoading || !email}
        className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando email...
          </>
        ) : (
          'Enviar enlace de recuperación'
        )}
      </Button>

      {/* Back to Login */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-200 text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al login
        </button>
      </div>

      {/* Backend Info */}
      <div className="mt-6 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
        <p className="text-xs text-slate-400 text-center">
          <strong className="text-slate-300">Backend:</strong> Conectado al servidor real de autenticación
        </p>
      </div>
    </form>
  );
}


