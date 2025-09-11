'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console and potentially to an error reporting service
    console.error('Error boundary caught:', error);
    
    // You can also send to error reporting service here
    // Example: errorReportingService.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700 shadow-2xl">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <AlertTriangle className="w-20 h-20 text-red-500 animate-pulse" />
            <div className="absolute -top-2 -right-2">
              <Bug className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
        
        {/* Error Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          ¡Oops! Algo salió mal
        </h1>
        
        {/* Error Description */}
        <p className="text-gray-300 mb-6 text-lg">
          Ha ocurrido un error inesperado en el servidor. 
          Nuestro equipo ha sido notificado y está trabajando para solucionarlo.
        </p>
        
        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left border border-gray-600">
            <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center">
              <Bug className="w-4 h-4 mr-2" />
              Detalles del Error (Solo Desarrollo)
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-300 font-mono break-all">
                <span className="text-gray-500">Mensaje:</span> {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 font-mono">
                  <span className="text-gray-500">Digest:</span> {error.digest}
                </p>
              )}
              <p className="text-xs text-gray-400 font-mono">
                <span className="text-gray-500">Stack:</span> {error.stack?.split('\n')[0]}
              </p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="font-medium">Intentar de nuevo</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Ir al inicio</span>
          </button>
        </div>
        
        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Si el problema persiste, por favor contacta con el soporte técnico.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Error ID: {error.digest || 'N/A'} | {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
