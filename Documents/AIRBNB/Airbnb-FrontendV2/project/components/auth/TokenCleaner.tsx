'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle } from 'lucide-react';

export default function TokenCleaner() {
  const [isCleaned, setIsCleaned] = useState(false);

  const cleanTokens = () => {
    try {
      console.log('🧹 [TokenCleaner] Limpiando tokens obsoletos...');
      
      // Limpiar localStorage
      localStorage.removeItem('airbnb_auth_token');
      localStorage.removeItem('airbnb_user');
      
      // Limpiar cookies
      document.cookie = 'airbnb_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'airbnb_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Limpiar sessionStorage también
      sessionStorage.clear();
      
      console.log('✅ [TokenCleaner] Tokens limpiados correctamente');
      setIsCleaned(true);
      
      // Recargar la página para aplicar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('💥 [TokenCleaner] Error limpiando tokens:', error);
    }
  };

  return (
    <div className="p-4 bg-red-600 rounded-lg border-2 border-red-500">
      <div className="flex items-center gap-2 mb-2">
        {isCleaned ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <Trash2 className="h-5 w-5 text-white" />
        )}
        <h3 className="text-white font-bold text-lg">
          🧹 TOKEN CLEANER
        </h3>
      </div>
      
      <p className="text-white text-sm mb-4">
        {isCleaned 
          ? '✅ Tokens limpiados. Recargando página...' 
          : 'Hay tokens obsoletos que causan redirecciones. Click para limpiar:'
        }
      </p>
      
      <Button
        onClick={cleanTokens}
        disabled={isCleaned}
        className="w-full bg-white text-red-600 font-bold py-2 px-4 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        {isCleaned ? '✅ LIMPIANDO...' : '🧹 LIMPIAR TOKENS'}
      </Button>
      
      {!isCleaned && (
        <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-500/30">
          <h4 className="text-red-300 font-bold mb-2">⚠️ PROBLEMA IDENTIFICADO:</h4>
          <p className="text-red-200 text-sm">
            El middleware detecta tokens obsoletos y redirige automáticamente.<br/>
            Esto impide que los botones de login/register funcionen.
          </p>
        </div>
      )}
    </div>
  );
}
