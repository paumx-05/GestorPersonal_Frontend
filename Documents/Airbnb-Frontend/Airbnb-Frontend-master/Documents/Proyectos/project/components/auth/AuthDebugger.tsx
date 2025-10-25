'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState({
    localStorageToken: null as string | null,
    localStorageUser: null as string | null,
    apiClientToken: null as string | null,
  });

  const updateDebugInfo = () => {
    const token = localStorage.getItem('airbnb_auth_token');
    const user = localStorage.getItem('user');
    
    // Simular llamada a apiClient.getAuthToken() si es posible
    let apiClientToken = null;
    try {
      // Intentar acceder al token del apiClient
      const apiClient = (window as any).apiClient;
      if (apiClient && apiClient.getAuthToken) {
        apiClientToken = apiClient.getAuthToken();
      }
    } catch (error) {
      console.log('No se pudo acceder a apiClient:', error);
    }

    setDebugInfo({
      localStorageToken: token,
      localStorageUser: user,
      apiClientToken: apiClientToken,
    });
  };

  useEffect(() => {
    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const testApiCall = async () => {
    try {
      console.log('🧪 [AuthDebugger] Probando llamada a API...');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${debugInfo.localStorageToken}`
        }
      });
      
      const data = await response.json();
      console.log('🧪 [AuthDebugger] Respuesta de /api/auth/me:', data);
      alert(`Respuesta: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('🧪 [AuthDebugger] Error en llamada de prueba:', error);
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔍 Auth Debugger</h3>
      
      <div className="space-y-2">
        <div>
          <strong>AuthContext State:</strong>
          <ul className="ml-4">
            <li>isAuthenticated: {isAuthenticated ? '✅ SÍ' : '❌ NO'}</li>
            <li>isLoading: {isLoading ? '⏳ SÍ' : '✅ NO'}</li>
            <li>user: {user ? `✅ ${user.name} (${user.email})` : '❌ null'}</li>
          </ul>
        </div>

        <div>
          <strong>localStorage:</strong>
          <ul className="ml-4">
            <li>airbnb_auth_token: {debugInfo.localStorageToken ? `✅ ${debugInfo.localStorageToken.substring(0, 20)}...` : '❌ null'}</li>
            <li>user: {debugInfo.localStorageUser ? `✅ ${JSON.parse(debugInfo.localStorageUser).name}` : '❌ null'}</li>
          </ul>
        </div>

        <div>
          <strong>apiClient Token:</strong>
          <span className="ml-4">
            {debugInfo.apiClientToken ? `✅ ${debugInfo.apiClientToken.substring(0, 20)}...` : '❌ null'}
          </span>
        </div>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={updateDebugInfo}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          🔄 Actualizar Info
        </button>
        
        <button
          onClick={testApiCall}
          disabled={!debugInfo.localStorageToken}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-400"
        >
          🧪 Probar API Call
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger;
