'use client';

import { useState } from 'react';

/**
 * Componente de prueba para verificar el reset password
 * Permite probar el flujo completo con datos reales
 */
export default function ResetPasswordTester() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (step: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      step,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }]);
  };

  const testResetPassword = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Paso 1: Test de conectividad del backend
      addResult('Conectividad', true, 'Iniciando pruebas...');
      
      const testToken = 'reset_' + btoa(JSON.stringify({
        userId: 'test_user_id',
        email: 'ana1@gmail.com',
        type: 'password-reset',
        iat: Date.now(),
        exp: Date.now() + 3600000
      }));

      // Paso 2: Test del endpoint de reset password
      addResult('Reset Password', true, 'Probando endpoint de reset password...');
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: testToken,
          newPassword: 'nueva_password_test_123'
        })
      });

      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        addResult('Reset Password', true, '✅ Reset password exitoso', responseData);
      } else {
        addResult('Reset Password', false, `❌ Error: ${responseData.message}`, responseData);
      }

      // Paso 3: Test de login con nueva contraseña
      addResult('Login Test', true, 'Probando login con nueva contraseña...');
      
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'ana1@gmail.com',
          password: 'nueva_password_test_123'
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.success) {
        addResult('Login Test', true, '✅ Login con nueva contraseña exitoso', loginData);
      } else {
        addResult('Login Test', false, `❌ Error en login: ${loginData.message}`, loginData);
      }

    } catch (error) {
      addResult('Error General', false, `💥 Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testBackendEndpoints = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Verificar endpoint de búsqueda de usuarios
      addResult('Búsqueda Usuarios', true, 'Probando endpoint de búsqueda...');
      
      const searchResponse = await fetch('http://localhost:5000/api/users/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'ana1@gmail.com'
        })
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        addResult('Búsqueda Usuarios', true, '✅ Endpoint de búsqueda funciona', searchData);
        
        // Test 2: Verificar endpoint de actualización de usuario
        if (searchData.data && searchData.data[0]) {
          const userId = searchData.data[0].id;
          addResult('Actualización Usuario', true, `Probando actualización para usuario ${userId}...`);
          
          const updateResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              password: 'test_password_123'
            })
          });

          if (updateResponse.ok) {
            addResult('Actualización Usuario', true, '✅ Endpoint de actualización funciona');
          } else {
            const updateData = await updateResponse.json();
            addResult('Actualización Usuario', false, `❌ Error en actualización: ${updateData.message}`);
          }
        }
      } else {
        addResult('Búsqueda Usuarios', false, `❌ Error en búsqueda: ${searchResponse.status}`);
      }

    } catch (error) {
      addResult('Error Backend', false, `💥 Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        🔧 Reset Password Tester
      </h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testResetPassword}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Probando...' : 'Probar Reset Password Completo'}
        </button>
        
        <button
          onClick={testBackendEndpoints}
          disabled={isLoading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {isLoading ? 'Probando...' : 'Probar Endpoints Backend'}
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Resultados de Pruebas:</h2>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500">No hay resultados aún. Haz clic en un botón para comenzar las pruebas.</p>
        ) : (
          testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{result.step}</h3>
                  <p className="text-sm">{result.message}</p>
                  {result.data && (
                    <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Instrucciones:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Probar Reset Password Completo:</strong> Ejecuta el flujo completo de reset password</li>
          <li>• <strong>Probar Endpoints Backend:</strong> Verifica que los endpoints del backend funcionen</li>
          <li>• Los resultados se muestran en tiempo real</li>
          <li>• Revisa la consola del navegador para logs adicionales</li>
        </ul>
      </div>
    </div>
  );
}
