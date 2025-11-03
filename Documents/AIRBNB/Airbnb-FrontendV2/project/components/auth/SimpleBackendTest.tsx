'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SimpleBackendTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setResult('Probando backend...');
    
    try {
      // Test 1: Health check básico
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });
      
      const data = await response.text();
      
      setResult(`
✅ Backend responde
Status: ${response.status}
Response: ${data}
      `);
      
    } catch (error) {
      setResult(`
❌ Error de conexión
Error: ${error}
      `);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h3 className="text-white font-bold mb-4">🔧 Simple Backend Test</h3>
      <Button 
        onClick={testBackend} 
        disabled={loading}
        className="w-full mb-4"
      >
        {loading ? 'Probando...' : 'Test Backend'}
      </Button>
      <pre className="text-white text-xs bg-black p-2 rounded overflow-auto max-h-40">
        {result}
      </pre>
    </div>
  );
}
