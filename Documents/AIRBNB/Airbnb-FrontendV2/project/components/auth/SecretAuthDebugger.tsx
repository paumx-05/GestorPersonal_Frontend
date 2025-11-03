'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tokenStorage } from '@/lib/api/auth';

/**
 * Componente de debugging secreto que solo aparece con Ctrl+Shift+D
 * No interfiere con la UI normal
 */
export default function SecretAuthDebugger() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + Shift + D para mostrar/ocultar debugger
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white max-w-sm z-50 text-xs shadow-2xl">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm text-[#FF385C]">🔍 Auth Debug (Secreto)</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white text-lg"
        >
          ×
        </button>
      </div>
      
      {/* Estado actual */}
      <div className="mb-3 p-2 bg-slate-800 rounded">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Auth:</span>
            <span className={`ml-1 px-1 rounded text-xs ${isAuthenticated ? 'bg-green-600' : 'bg-red-600'}`}>
              {isAuthenticated ? 'TRUE' : 'FALSE'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Loading:</span>
            <span className={`ml-1 px-1 rounded text-xs ${isLoading ? 'bg-yellow-600' : 'bg-gray-600'}`}>
              {isLoading ? 'TRUE' : 'FALSE'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">User:</span>
            <span className="ml-1 text-slate-300 text-xs">
              {user ? user.name : 'NULL'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Email:</span>
            <span className="ml-1 text-slate-300 text-xs">
              {user ? user.email : 'NULL'}
            </span>
          </div>
        </div>
        {error && (
          <div className="mt-2 text-red-400 text-xs">
            Error: {error}
          </div>
        )}
      </div>

      {/* Token info */}
      <div className="mb-3 p-2 bg-slate-800 rounded">
        <div className="text-slate-400 text-xs mb-1">Token Info:</div>
        <div className="text-slate-300 text-xs">
          {(() => {
            const token = tokenStorage.get();
            return token ? `EXISTS (${token.substring(0, 20)}...)` : 'NONE';
          })()}
        </div>
      </div>

      {/* Cookies info */}
      <div className="mb-3 p-2 bg-slate-800 rounded">
        <div className="text-slate-400 text-xs mb-1">Cookies:</div>
        <div className="text-slate-300 text-xs">
          {document.cookie.includes('airbnb_auth_token') ? 'EXISTS' : 'NONE'}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="text-slate-400 text-xs">
        <div>Ctrl+Shift+D para ocultar</div>
        <div>Revisa la consola para logs detallados</div>
      </div>
    </div>
  );
}
