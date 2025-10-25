'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/api/auth';

export default function DebugRegister() {
  const [formData, setFormData] = useState({
    name: 'Usuario Test',
    email: 'test@example.com',
    password: 'password123',
  });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 [DebugRegister] Iniciando test de registro...');
      const response = await authService.register(formData.email, formData.password, formData.name);
      console.log('🧪 [DebugRegister] Respuesta completa:', response);
      setResult(response);
    } catch (error) {
      console.log('🧪 [DebugRegister] Error capturado:', error);
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-800 rounded-lg border border-slate-600">
      <h3 className="text-lg font-semibold text-white mb-4">🧪 Debug Register</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Name:</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-300">Email:</label>
          <Input
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-300">Password:</label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        <Button 
          onClick={handleTest} 
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Testing...' : 'Test Register'}
        </Button>
        
        {result && (
          <div className="mt-4 p-4 bg-slate-700 rounded border">
            <h4 className="text-white font-medium mb-2">Resultado:</h4>
            <pre className="text-xs text-slate-300 overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
