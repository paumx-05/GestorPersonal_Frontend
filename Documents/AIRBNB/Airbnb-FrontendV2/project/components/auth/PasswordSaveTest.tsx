'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Database } from 'lucide-react';

export default function PasswordSaveTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [details, setDetails] = useState<string>('');
  const [testPassword, setTestPassword] = useState('test123456');

  const testPasswordSave = async () => {
    setStatus('testing');
    setDetails('Probando guardado de contraseña en base de datos...');
    
    try {
      console.log('🧪 [PasswordSaveTest] Probando guardado de contraseña...');
      
      // Test 1: Reset password con token de prueba
      const resetResponse = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'reset_test_token_123',
          newPassword: testPassword
        })
      });

      const resetData = await resetResponse.json();
      console.log('📥 [PasswordSaveTest] Respuesta del reset:', resetData);

      if (resetResponse.ok && resetData.success) {
        setStatus('success');
        setDetails(`✅ Contraseña guardada correctamente en la base de datos\n\nRespuesta del backend:\n${JSON.stringify(resetData, null, 2)}`);
      } else {
        setStatus('error');
        setDetails(`❌ Error al guardar la contraseña\n\nRespuesta: ${JSON.stringify(resetData, null, 2)}\n\nPosibles causas:\n- Backend no está funcionando\n- Token inválido\n- Error en la base de datos`);
      }
    } catch (error) {
      console.log('💥 [PasswordSaveTest] Error:', error);
      setStatus('error');
      setDetails(`💥 Error de conexión\n\nError: ${error}\n\nPosibles causas:\n- Backend no está corriendo en puerto 5000\n- Problema de red\n- Error en la configuración`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return <Database className="h-5 w-5 text-gray-500" />;
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
          💾 PASSWORD SAVE TEST
        </h3>
      </div>
      
      <p className="text-white text-sm mb-4">
        Test para verificar que la contraseña se guarde en la base de datos:
      </p>

      <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-2">
          Contraseña de prueba:
        </label>
        <input
          type="text"
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-800 rounded border border-gray-300"
          placeholder="Contraseña para probar"
        />
      </div>
      
      <Button
        onClick={testPasswordSave}
        disabled={status === 'testing'}
        className="w-full bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        {status === 'testing' ? 'Probando...' : '💾 TEST GUARDADO'}
      </Button>
      
      {details && (
        <div className="mt-4 p-3 bg-black/20 rounded text-white text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
          {details}
        </div>
      )}
      
      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-500/30">
          <h4 className="text-green-300 font-bold mb-2">✅ GUARDADO CONFIRMADO:</h4>
          <p className="text-green-200 text-sm">
            La contraseña se está guardando correctamente en la base de datos del backend.
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-500/30">
          <h4 className="text-red-300 font-bold mb-2">🚨 PROBLEMA DETECTADO:</h4>
          <p className="text-red-200 text-sm">
            La contraseña no se está guardando. Verifica que el backend esté funcionando y que el endpoint `/api/auth/reset-password` esté implementado correctamente.
          </p>
        </div>
      )}
    </div>
  );
}

