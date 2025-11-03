'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function BackendStatusChecker() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [details, setDetails] = useState<string>('');

  const checkBackend = async () => {
    setStatus('checking');
    setDetails('Verificando conectividad...');
    
    try {
      console.log('🔍 [BackendStatusChecker] Verificando backend...');
      
      // Intentar hacer una petición simple al backend
      // Usamos OPTIONS o un endpoint que no requiera autenticación
      // Si no existe /api/health, intentamos con login pero manejamos el 401 como "online"
      // Intentar verificar conectividad sin generar errores en consola
      // Usamos un método HEAD o OPTIONS si está disponible, o simplemente verificamos conectividad
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'test123'
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Si recibimos respuesta (aunque sea 401), el backend está funcionando
        // 401 significa que el backend está respondiendo pero las credenciales son inválidas
        // Esto es exactamente lo que esperamos en una verificación de conectividad
        if (response.status === 401 || response.status === 400) {
          setStatus('online');
          setDetails(`✅ Backend funcionando correctamente\n\nStatus: ${response.status}\nRespuesta: El backend está respondiendo`);
          // No loguear en consola para evitar ruido
          return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
          setStatus('online');
          setDetails(`✅ Backend funcionando\nStatus: ${response.status}`);
          return;
        }
        
        setStatus('error');
        setDetails(`⚠️ Backend responde pero con error inesperado\nStatus: ${response.status}`);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Si es un error de abort, significa timeout (backend no responde)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Timeout: Backend no responde');
        }
        throw fetchError;
      }
      
      if (response.ok) {
        setStatus('online');
        setDetails(`✅ Backend funcionando\nStatus: ${response.status}`);
        console.log('✅ [BackendStatusChecker] Backend funcionando');
      } else {
        setStatus('error');
        setDetails(`⚠️ Backend responde pero con error inesperado\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
        console.log('⚠️ [BackendStatusChecker] Backend con error:', response.status);
      }
    } catch (error) {
      console.log('💥 [BackendStatusChecker] Error de conexión:', error);
      setStatus('offline');
      setDetails(`❌ Backend no disponible\n\nError: ${error instanceof Error ? error.message : 'Error de conexión'}\n\nSolución:\n1. Iniciar el backend en puerto 5000\n2. Verificar que el backend esté funcionando\n3. Revisar la configuración de CORS`);
    }
  };

  // Solo verificar automáticamente en desarrollo
  useEffect(() => {
    // Solo hacer check automático en desarrollo o si hay una flag explícita
    if (process.env.NODE_ENV === 'development') {
      checkBackend();
    } else {
      // En producción, no verificar automáticamente para evitar ruido
      setStatus('checking');
      setDetails('Click en el botón para verificar el estado del backend');
    }
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-yellow-600 border-yellow-500';
      case 'online':
        return 'bg-green-600 border-green-500';
      case 'offline':
        return 'bg-red-600 border-red-500';
      case 'error':
        return 'bg-orange-600 border-orange-500';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <h3 className="text-white font-bold text-lg">
          🔍 BACKEND STATUS CHECKER
        </h3>
      </div>
      
      <p className="text-white text-sm mb-4">
        Estado de conectividad con el backend:
      </p>
      
      <Button
        onClick={checkBackend}
        disabled={status === 'checking'}
        className="w-full bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        {status === 'checking' ? 'Verificando...' : '🔄 VERIFICAR BACKEND'}
      </Button>
      
      {details && (
        <div className="mt-4 p-3 bg-black/20 rounded text-white text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
          {details}
        </div>
      )}
      
      {status === 'offline' && (
        <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-500/30">
          <h4 className="text-red-300 font-bold mb-2">🚨 ACCIÓN REQUERIDA:</h4>
          <p className="text-red-200 text-sm">
            1. Iniciar el backend en puerto 5000<br/>
            2. Verificar que el backend esté funcionando<br/>
            3. Revisar la configuración de CORS
          </p>
        </div>
      )}
    </div>
  );
}
