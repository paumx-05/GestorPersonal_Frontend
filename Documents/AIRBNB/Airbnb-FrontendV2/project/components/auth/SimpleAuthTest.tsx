'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SimpleAuthTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testBackend = async () => {
    setIsLoading(true);
    setResult('Probando...');
    
    try {
      console.log('🧪 [SimpleAuthTest] Probando backend...');
      
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
      
      const data = await response.json();
      console.log('📥 [SimpleAuthTest] Respuesta:', data);
      
      setResult(`Status: ${response.status}\n\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.log('💥 [SimpleAuthTest] Error:', error);
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-600 rounded-lg border-2 border-yellow-500">
      <h3 className="text-white font-bold text-lg mb-4">🧪 SIMPLE BACKEND TEST</h3>
      <p className="text-white text-sm mb-4">
        Click para probar si el backend responde:
      </p>
      
      <Button
        onClick={testBackend}
        disabled={isLoading}
        className="w-full bg-white text-yellow-600 font-bold py-2 px-4 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        {isLoading ? 'Probando...' : '🧪 TEST BACKEND'}
      </Button>
      
      {result && (
        <div className="mt-4 p-3 bg-black/20 rounded text-white text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
          {result}
        </div>
      )}
    </div>
  );
}
