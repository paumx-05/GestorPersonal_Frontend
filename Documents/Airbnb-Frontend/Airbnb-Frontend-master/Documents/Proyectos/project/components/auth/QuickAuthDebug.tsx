'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tokenStorage } from '@/lib/api/auth';

/**
 * Componente de debugging rápido que se puede activar/desactivar
 * Solo aparece cuando se activa manualmente
 */
export default function QuickAuthDebug() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded z-50"
      >
        🔍 Debug
      </button>
    );
  }

  const token = tokenStorage.get();
  const hasCookie = document.cookie.includes('airbnb_auth_token');

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white max-w-xs z-50 text-xs shadow-2xl">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm text-[#FF385C]">Auth Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white text-lg"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div>
          <span className="text-slate-400">Auth:</span>
          <span className={`ml-1 px-1 rounded text-xs ${isAuthenticated ? 'bg-green-600' : 'bg-red-600'}`}>
            {isAuthenticated ? 'TRUE' : 'FALSE'}
          </span>
        </div>
        
        <div>
          <span className="text-slate-400">User:</span>
          <span className="ml-1 text-slate-300 text-xs">
            {user ? user.name : 'NULL'}
          </span>
        </div>
        
        <div>
          <span className="text-slate-400">Loading:</span>
          <span className={`ml-1 px-1 rounded text-xs ${isLoading ? 'bg-yellow-600' : 'bg-gray-600'}`}>
            {isLoading ? 'TRUE' : 'FALSE'}
          </span>
        </div>
        
        <div>
          <span className="text-slate-400">Token:</span>
          <span className={`ml-1 px-1 rounded text-xs ${token ? 'bg-green-600' : 'bg-red-600'}`}>
            {token ? 'EXISTS' : 'NONE'}
          </span>
        </div>
        
        <div>
          <span className="text-slate-400">Cookie:</span>
          <span className={`ml-1 px-1 rounded text-xs ${hasCookie ? 'bg-green-600' : 'bg-red-600'}`}>
            {hasCookie ? 'EXISTS' : 'NONE'}
          </span>
        </div>
        
        {error && (
          <div className="text-red-400 text-xs">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
