'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export default function BackendConnectivityTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [details, setDetails] = useState<string>('');
  const [responseTime, setResponseTime] = useState<number>(0);

  const testBackendConnection = async () => {
    setStatus('testing');
    setDetails('Probando conectividad con el backend...');
    
    const startTime = Date.now();
    
    try {
      console.log('🔍 [BackendConnectivityTest] Probando conexión...');
      
      // Test básico de conectividad
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        })
      });
      
      const endTime = Date.now();
      const responseTimeMs = endTime - startTime;
      setResponseTime(responseTimeMs);
      
      const data = await response.json();
      console.log('📥 [BackendConnectivityTest] Respuesta:', data);
      
      if (response.ok) {
        setStatus('connected');
        setDetails(`✅ Backend conectado correctamente\nTiempo de respuesta: ${responseTimeMs}ms\nStatus: ${response.status}\nRespuesta: ${JSON.stringify(data, null, 2)}`);
      } else {
        setStatus('error');
        setDetails(`⚠️ Backend responde pero con error\nTiempo: ${responseTimeMs}ms\nStatus: ${response.status}\nError: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      const endTime = Date.now();
      const responseTimeMs = endTime - startTime;
      setResponseTime(responseTimeMs);
      
      console.log('💥 [BackendConnectivityTest] Error:', error);
      setStatus('error');
      setDetails(`❌ Error de conexión\nTiempo: ${responseTimeMs}ms\nError: ${error}\n\nPosibles causas:\n- Backend no está corriendo en puerto 5000\n- Problema de CORS\n- Firewall bloqueando la conexión`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return <Wifi className="h-5 w-5 text-gray-500" />;
      case 'testing':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <WifiOff className="h-5 w-5 text-red-500" />;
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
          🌐 BACKEND CONNECTIVITY TEST
        </h3>
      </div>
      
      <p className="text-white text-sm mb-4">
        Test de conectividad real con el backend en puerto 5000:
      </p>
      
      <Button
        onClick={testBackendConnection}
        disabled={status === 'testing'}
        className="w-full bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        {status === 'testing' ? 'Probando...' : '🌐 TEST CONECTIVIDAD'}
      </Button>
      
      {responseTime > 0 && (
        <div className="mt-2 text-white text-sm text-center">
          Tiempo de respuesta: <strong>{responseTime}ms</strong>
        </div>
      )}
      
      {details && (
        <div className="mt-4 p-3 bg-black/20 rounded text-white text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
          {details}
        </div>
      )}
      
      {status === 'connected' && (
        <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-500/30">
          <h4 className="text-green-300 font-bold mb-2">✅ CONECTIVIDAD CONFIRMADA:</h4>
          <p className="text-green-200 text-sm">
            El backend está funcionando correctamente.<br/>
            Los botones de login/register deberían funcionar ahora.
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-500/30">
          <h4 className="text-red-300 font-bold mb-2">🚨 ACCIÓN REQUERIDA:</h4>
          <p className="text-red-200 text-sm">
            1. Verificar que el backend esté corriendo en puerto 5000<br/>
            2. Revisar configuración de CORS<br/>
            3. Verificar que no haya firewall bloqueando
          </p>
        </div>
      )}
    </div>
  );
}
