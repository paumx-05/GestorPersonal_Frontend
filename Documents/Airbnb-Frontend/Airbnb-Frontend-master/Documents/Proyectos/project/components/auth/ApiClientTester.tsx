'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/config';

export const ApiClientTester: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiClient = async () => {
    setIsLoading(true);
    setTestResult('Probando...');
    
    try {
      console.log('🧪 [ApiClientTester] Probando apiClient...');
      
      // Verificar si hay token
      const token = localStorage.getItem('airbnb_auth_token');
      console.log('🧪 [ApiClientTester] Token en localStorage:', token ? 'SÍ' : 'NO');
      
      if (!token) {
        setTestResult('❌ No hay token en localStorage');
        setIsLoading(false);
        return;
      }

      // Probar llamada con apiClient
      console.log('🧪 [ApiClientTester] Haciendo llamada con apiClient...');
      const response = await apiClient.get('/api/auth/me');
      
      console.log('🧪 [ApiClientTester] Respuesta:', response);
      setTestResult(`✅ Éxito: ${JSON.stringify(response, null, 2)}`);
      
    } catch (error) {
      console.error('🧪 [ApiClientTester] Error:', error);
      setTestResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    setTestResult('Probando fetch directo...');
    
    try {
      const token = localStorage.getItem('airbnb_auth_token');
      
      if (!token) {
        setTestResult('❌ No hay token en localStorage');
        setIsLoading(false);
        return;
      }

      console.log('🧪 [ApiClientTester] Haciendo llamada con fetch directo...');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('🧪 [ApiClientTester] Respuesta fetch directo:', data);
      setTestResult(`✅ Fetch directo: ${JSON.stringify(data, null, 2)}`);
      
    } catch (error) {
      console.error('🧪 [ApiClientTester] Error fetch directo:', error);
      setTestResult(`❌ Error fetch directo: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-100 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">🧪 ApiClient Tester</h3>
      
      <div className="space-y-2 mb-4">
        <div>
          <strong>Token en localStorage:</strong> 
          {localStorage.getItem('airbnb_auth_token') ? '✅ SÍ' : '❌ NO'}
        </div>
        <div>
          <strong>Token:</strong> 
          {localStorage.getItem('airbnb_auth_token')?.substring(0, 20)}...
        </div>
      </div>

      <div className="space-x-2 mb-4">
        <button
          onClick={testApiClient}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-400"
        >
          {isLoading ? '⏳ Probando...' : '🧪 Probar ApiClient'}
        </button>
        
        <button
          onClick={testDirectFetch}
          disabled={isLoading}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-400"
        >
          {isLoading ? '⏳ Probando...' : '🧪 Probar Fetch Directo'}
        </button>
      </div>

      {testResult && (
        <div className="p-2 bg-gray-100 rounded text-sm">
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiClientTester;
