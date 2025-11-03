'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    console.log('🔍 [LoginForm] Enviando credenciales:', {
      email: formData.email,
      password: formData.password ? '***' : 'undefined'
    });
    
    // Validación básica
    if (!formData.email.trim()) {
      console.log('❌ [LoginForm] Email vacío');
      return;
    }
    
    if (!formData.password.trim()) {
      console.log('❌ [LoginForm] Contraseña vacía');
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      console.log('✅ [LoginForm] Login exitoso');
      onSuccess();
    } catch (error) {
      console.log('💥 [LoginForm] Error en login:', error);
      // Error handling is managed by the context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fillDemoData = () => {
    setFormData({
      email: 'admin@demo1.com',
      password: 'demo1234'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            value={formData.email}
            onChange={handleChange}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-300">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link 
          href="/forgot-password"
          className="text-sm text-slate-400 hover:text-[#FF385C] transition-colors duration-200"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Demo Button */}
      <Button
        type="button"
        variant="outline"
        onClick={fillDemoData}
        className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        Usar datos demo
      </Button>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </Button>

      {/* Switch to Register */}
      <div className="text-center">
        <p className="text-slate-400 text-sm">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#FF385C] hover:text-[#E31C5F] font-medium"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </form>
  );
}
