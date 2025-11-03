'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
  };

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-center">
            {mode === 'login' 
              ? 'Bienvenido de vuelta a Airbnb Luxury' 
              : 'Únete a nuestra comunidad de viajeros'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {mode === 'login' ? (
            <LoginForm 
              onSuccess={handleSuccess}
              onSwitchToRegister={() => handleModeSwitch('register')}
            />
          ) : (
            <RegisterForm 
              onSuccess={handleSuccess}
              onSwitchToLogin={() => handleModeSwitch('login')}
            />
          )}
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 text-center">
            <strong>Demo:</strong> usa admin@demo1.com / demo1234
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}


