'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Database, Server, Wifi } from 'lucide-react';

interface ResetPasswordDebuggerProps {
  token: string;
}

export default function ResetPasswordDebugger({ token }: ResetPasswordDebuggerProps) {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [details, setDetails] = useState<string>('');
  const [step, setStep] = useState<string>('');

  const debugResetPassword = async () => {
    setStatus('testing');
    setDetails('Iniciando diagnóstico completo del reset de contraseña...');
    setStep('Paso 1: Verificando token...');
    
    try {
      console.log('🔍 [ResetPasswordDebugger] Iniciando diagnóstico...');
      console.log('🔍 [ResetPasswordDebugger] Token:', token);
      
      // Paso 1: Verificar que el token sea válido
      if (!token || !token.startsWith('reset_')) {
        setStatus('error');
        setDetails(`❌ Token inválido\n\nToken: ${token}\n\nEl token debe empezar con 'reset_'`);
        return;
      }
      
      setStep('Paso 2: Verificando conectividad con el backend...');
      
      // Paso 2: Verificar que el backend esté funcionando
      const healthCheck = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });
      
      console.log('📥 [ResetPasswordDebugger] Health check:', healthCheck.status);
      
      if (!healthCheck.ok) {
        setStatus('error');
        const errorText = await healthCheck.text();
        setDetails(`❌ Backend responde con error\n\nStatus: ${healthCheck.status}\nRespuesta: ${errorText}\n\nPosibles causas:\n- Endpoint /api/auth/forgot-password no disponible\n- Error de configuración del backend\n- Problema de red`);
        return;
      }
      
      setStep('Paso 3: Probando endpoint de reset password...');
      
      // Paso 3: Probar el endpoint de reset password
      const resetResponse = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token, 
          newPassword: 'test123456' 
        })
      });
      
      const resetData = await resetResponse.json();
      console.log('📥 [ResetPasswordDebugger] Reset response:', resetResponse.status, resetData);
      
      if (resetResponse.ok && resetData.success) {
        setStatus('success');
        setDetails(`✅ Reset de contraseña funcionando correctamente\n\nStatus: ${resetResponse.status}\nRespuesta: ${JSON.stringify(resetData, null, 2)}\n\nEl sistema está funcionando correctamente.`);
      } else {
        setStatus('error');
        setDetails(`❌ Error en el reset de contraseña\n\nStatus: ${resetResponse.status}\nRespuesta: ${JSON.stringify(resetData, null, 2)}\n\nPosibles causas:\n- Error en el backend\n- Token inválido o expirado\n- Problema en la base de datos`);
      }
      
    } catch (error) {
      console.log('💥 [ResetPasswordDebugger] Error:', error);
      setStatus('error');
      setDetails(`💥 Error de conexión\n\nError: ${error}\n\nPosibles causas:\n- Backend no está corriendo\n- Problema de red\n- Error en la configuración`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return <Server className="h-5 w-5 text-gray-500" />;
      case 'testing':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'bg-gray-600 border-gray-500';
      case 'testing':
        return 'bg-yellow-600 border-yellow-500';
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <h3 className="text-white font-bold text-lg">
          🔧 RESET PASSWORD DEBUGGER
        </h3>
      </div>
      
      <p className="text-white text-sm mb-4">
        Diagnóstico específico del reset de contraseña:
      </p>
      
      <div className="mb-4 p-2 bg-black/20 rounded text-white text-xs">
        <strong>Token actual:</strong> {token}
      </div>
      
      {step && (
        <div className="mb-4 p-2 bg-black/20 rounded text-white text-xs">
          <strong>Progreso:</strong> {step}
        </div>
      )}
      
      <Button
        onClick={debugResetPassword}
        disabled={status === 'testing'}
        className="w-full bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        {status === 'testing' ? 'Diagnosticando...' : '🔧 DIAGNOSTICAR RESET'}
      </Button>
      
      {details && (
        <div className="mt-4 p-3 bg-black/20 rounded text-white text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
          {details}
        </div>
      )}
      
      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-500/30">
          <h4 className="text-green-300 font-bold mb-2">✅ SISTEMA FUNCIONANDO:</h4>
          <p className="text-green-200 text-sm">
            El sistema de reset de contraseña está funcionando correctamente. Puedes proceder con el reset.
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-500/30">
          <h4 className="text-red-300 font-bold mb-2">🚨 PROBLEMA DETECTADO:</h4>
          <p className="text-red-200 text-sm">
            Hay un problema con el sistema de reset. Revisa los detalles arriba para identificar la causa específica.
          </p>
        </div>
      )}
    </div>
  );
}

