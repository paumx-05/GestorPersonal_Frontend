'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/api/auth';

/**
 * Componente para testing directo de la respuesta del backend
 * Permite ver exactamente qué está devolviendo el servidor
 */
export default function BackendResponseTester() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testBackendResponse = async () => {
    setIsTesting(true);
    clearResults();
    
    try {
      addResult('🧪 TESTING BACKEND RESPONSE');
      addResult('Enviando login a: http://localhost:5000/api/auth/login');
      
      const response = await authService.login('admin@demo1.com', 'demo1234');
      
      addResult('📥 RESPUESTA DEL BACKEND:');
      addResult(`  - success: ${response.success}`);
      addResult(`  - user: ${response.user ? JSON.stringify(response.user) : 'null'}`);
      addResult(`  - token: ${response.token ? response.token.substring(0, 20) + '...' : 'null'}`);
      addResult(`  - message: ${response.message || 'null'}`);
      
      addResult('🔍 ANÁLISIS DETALLADO:');
      addResult(`  - Tipo de success: ${typeof response.success}`);
      addResult(`  - Tipo de user: ${typeof response.user}`);
      addResult(`  - Tipo de token: ${typeof response.token}`);
      addResult(`  - user es null?: ${response.user === null}`);
      addResult(`  - token es null?: ${response.token === null}`);
      addResult(`  - token es undefined?: ${response.token === undefined}`);
      addResult(`  - token es string vacío?: ${response.token === ''}`);
      
      if (response.success && response.user && response.token) {
        addResult('✅ BACKEND RESPONSE: VÁLIDA');
        addResult('El backend está devolviendo todos los datos correctamente');
      } else {
        addResult('❌ BACKEND RESPONSE: INVÁLIDA');
        addResult('El backend NO está devolviendo todos los datos necesarios');
        
        if (!response.success) {
          addResult('  - ❌ success es false');
        }
        if (!response.user) {
          addResult('  - ❌ user es null/undefined');
        }
        if (!response.token) {
          addResult('  - ❌ token es null/undefined/vacío');
        }
      }
      
    } catch (error) {
      addResult(`💥 ERROR: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testRawFetch = async () => {
    setIsTesting(true);
    clearResults();
    
    try {
      addResult('🧪 TESTING RAW FETCH');
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@demo1.com',
          password: 'demo1234'
        })
      });
      
      addResult(`📡 Status: ${response.status}`);
      addResult(`📡 Status Text: ${response.statusText}`);
      
      const data = await response.json();
      addResult('📥 RAW RESPONSE:');
      addResult(JSON.stringify(data, null, 2));
      
    } catch (error) {
      addResult(`💥 ERROR: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 text-white max-w-2xl">
      <h3 className="font-bold text-sm mb-3 text-[#FF385C]">🧪 Backend Response Tester</h3>
      
      {/* Botones de test */}
      <div className="space-y-2 mb-4">
        <Button 
          onClick={testBackendResponse}
          disabled={isTesting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
        >
          {isTesting ? 'Testing...' : 'Test Backend Response'}
        </Button>
        
        <Button 
          onClick={testRawFetch}
          disabled={isTesting}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
        >
          {isTesting ? 'Testing...' : 'Test Raw Fetch'}
        </Button>
        
        <Button 
          onClick={clearResults}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white text-xs"
        >
          Clear Results
        </Button>
      </div>

      {/* Resultados */}
      <div className="max-h-60 overflow-y-auto">
        <div className="text-xs text-slate-400 mb-1">Test Results:</div>
        {testResults.length === 0 ? (
          <div className="text-slate-500 text-xs">No tests run yet</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="text-xs text-slate-300 mb-1">
              {result}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
