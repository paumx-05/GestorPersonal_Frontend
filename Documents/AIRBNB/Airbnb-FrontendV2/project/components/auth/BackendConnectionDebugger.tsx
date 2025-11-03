'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Wifi, Database, Server } from 'lucide-react';

export default function BackendConnectionDebugger() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [details, setDetails] = useState<string>('');
  const [step, setStep] = useState<string>('');

  const debugBackendConnection = async () => {
    setStatus('testing');
    setDetails('Iniciando diagnóstico completo de conexión...');
    setStep('Paso 1: Verificando conectividad básica...');
    
    try {
      console.log('🔍 [BackendConnectionDebugger] Iniciando diagnóstico...');
      
      // Paso 1: Verificar que el backend esté corriendo
      setStep('Paso 1: Verificando que el backend esté corriendo...');
      const healthCheck = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
      });
      
      console.log('📥 [BackendConnectionDebugger] Health check:', healthCheck.status);
      
      if (!healthCheck.ok) {
        setStatus('error');
        setDetails(`❌ Backend no está respondiendo correctamente\n\nStatus: ${healthCheck.status}\n\nPosibles causas:\n- Backend no está corriendo en puerto 5000\n- Endpoint /api/auth/login no existe\n- Error de configuración`);
        return;
      }
      
      // Paso 2: Verificar endpoint específico de reset password
      setStep('Paso 2: Verificando endpoint de reset password...');
      const resetCheck = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: 'reset_test_token_123', 
          newPassword: 'test123456' 
        })
      });
      
      const resetData = await resetCheck.json();
      console.log('📥 [BackendConnectionDebugger] Reset check:', resetCheck.status, resetData);
      
      if (resetCheck.ok) {
        setStatus('connected');
        setDetails(`✅ Backend funcionando correctamente\n\nStatus: ${resetCheck.status}\nRespuesta: ${JSON.stringify(resetData, null, 2)}\n\nEl backend está respondiendo y procesando las peticiones correctamente.`);
      } else {
        setStatus('error');
        setDetails(`⚠️ Backend responde pero con error\n\nStatus: ${resetCheck.status}\nRespuesta: ${JSON.stringify(resetData, null, 2)}\n\nEl backend está funcionando pero el endpoint de reset password tiene problemas.`);
      }
      
    } catch (error) {
      console.log('💥 [BackendConnectionDebugger] Error:', error);
      setStatus('error');
      setDetails(`💥 Error de conexión\n\nError: ${error}\n\nPosibles causas:\n- Backend no está corriendo en puerto 5000\n- Problema de red o firewall\n- Error en la configuración del servidor`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return <Server className="h-5 w-5 text-gray-500" />;
      case 'testing':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'connected':
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
      case 'connected':
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
          🔧 BACKEND CONNECTION DEBUGGER
        </h3>
      </div>
      
      <p className="text-white text-sm mb-4">
        Diagnóstico completo de la conexión con el backend:
      </p>
      
      {step && (
        <div className="mb-4 p-2 bg-black/20 rounded text-white text-xs">
          <strong>Progreso:</strong> {step}
        </div>
      )}
      
      <Button
        onClick={debugBackendConnection}
        disabled={status === 'testing'}
        className="w-full bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        {status === 'testing' ? 'Diagnosticando...' : '🔧 DIAGNOSTICAR BACKEND'}
      </Button>
      
      {details && (
        <div className="mt-4 p-3 bg-black/20 rounded text-white text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
          {details}
        </div>
      )}
      
      {status === 'connected' && (
        <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-500/30">
          <h4 className="text-green-300 font-bold mb-2">✅ BACKEND FUNCIONANDO:</h4>
          <p className="text-green-200 text-sm">
            El backend está funcionando correctamente. El problema puede estar en el frontend o en la configuración.
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-500/30">
          <h4 className="text-red-300 font-bold mb-2">🚨 PROBLEMA DETECTADO:</h4>
          <p className="text-red-200 text-sm">
            Hay un problema con la conexión al backend. Revisa los detalles arriba para identificar la causa específica.
          </p>
        </div>
      )}
    </div>
  );
}

