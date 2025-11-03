'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Server, Database, Wifi } from 'lucide-react';

export default function BackendEndpointTester() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [details, setDetails] = useState<string>('');
  const [step, setStep] = useState<string>('');

  const testBackendEndpoint = async () => {
    setStatus('testing');
    setDetails('Iniciando diagnóstico del endpoint de reset password en el backend...');
    setStep('Paso 1: Verificando que el backend esté funcionando...');
    
    try {
      console.log('🔍 [BackendEndpointTester] Iniciando diagnóstico...');
      
      // Paso 1: Verificar que el backend esté funcionando
      setStep('Paso 1: Verificando que el backend esté funcionando...');
      const healthCheck = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });
      
      console.log('📥 [BackendEndpointTester] Health check:', healthCheck.status);
      
      if (!healthCheck.ok) {
        setStatus('error');
        setDetails(`❌ Backend no está respondiendo\n\nStatus: ${healthCheck.status}\n\nPosibles causas:\n- Backend no está corriendo en puerto 5000\n- Endpoint /api/auth/login no existe\n- Error de configuración`);
        return;
      }
      
      setStep('Paso 2: Verificando endpoint de reset password en el backend...');
      
      // Paso 2: Probar el endpoint específico de reset password
      const resetResponse = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: 'reset_test_token_123', 
          newPassword: 'test123456' 
        })
      });
      
      const resetData = await resetResponse.json();
      console.log('📥 [BackendEndpointTester] Reset response:', resetResponse.status, resetData);
      
      if (resetResponse.status === 404) {
        setStatus('error');
        setDetails(`❌ Endpoint no implementado en el backend\n\nStatus: 404\n\nEl backend no tiene implementado el endpoint /api/auth/reset-password\n\nSolución: Implementar el endpoint en el backend`);
        return;
      }
      
      if (resetResponse.ok && resetData.success) {
        setStatus('success');
        setDetails(`✅ Endpoint funcionando correctamente\n\nStatus: ${resetResponse.status}\nRespuesta: ${JSON.stringify(resetData, null, 2)}\n\nEl backend está procesando correctamente el reset de contraseña.`);
      } else {
        setStatus('error');
        setDetails(`⚠️ Endpoint responde pero con error\n\nStatus: ${resetResponse.status}\nRespuesta: ${JSON.stringify(resetData, null, 2)}\n\nPosibles causas:\n- Token inválido o expirado\n- Error en la base de datos\n- Validación fallida`);
      }
      
    } catch (error) {
      console.log('💥 [BackendEndpointTester] Error:', error);
      setStatus('error');
      setDetails(`💥 Error de conexión\n\nError: ${error}\n\nPosibles causas:\n- Backend no está corriendo en puerto 5000\n- Problema de red\n- Error en la configuración`);
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
          🔧 BACKEND ENDPOINT TESTER
        </h3>
      </div>
      
      <p className="text-white text-sm mb-4">
        Diagnóstico específico del endpoint de reset password en el backend:
      </p>
      
      {step && (
        <div className="mb-4 p-2 bg-black/20 rounded text-white text-xs">
          <strong>Progreso:</strong> {step}
        </div>
      )}
      
      <Button
        onClick={testBackendEndpoint}
        disabled={status === 'testing'}
        className="w-full bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        {status === 'testing' ? 'Diagnosticando...' : '🔧 TEST ENDPOINT'}
      </Button>
      
      {details && (
        <div className="mt-4 p-3 bg-black/20 rounded text-white text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
          {details}
        </div>
      )}
      
      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-500/30">
          <h4 className="text-green-300 font-bold mb-2">✅ ENDPOINT FUNCIONANDO:</h4>
          <p className="text-green-200 text-sm">
            El endpoint de reset password está funcionando correctamente en el backend.
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-500/30">
          <h4 className="text-red-300 font-bold mb-2">🚨 PROBLEMA DETECTADO:</h4>
          <p className="text-red-200 text-sm">
            Hay un problema con el endpoint de reset password en el backend. Revisa los detalles arriba.
          </p>
        </div>
      )}
    </div>
  );
}

