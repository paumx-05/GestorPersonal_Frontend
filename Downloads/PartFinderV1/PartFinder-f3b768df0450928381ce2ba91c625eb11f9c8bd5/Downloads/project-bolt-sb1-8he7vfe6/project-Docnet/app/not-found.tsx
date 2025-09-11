'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700 shadow-2xl">
        {/* 404 Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="text-6xl font-bold text-red-500 mb-2">404</div>
            <div className="absolute -top-2 -right-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
        
        {/* Error Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Página no encontrada
        </h1>
        
        {/* Error Description */}
        <p className="text-gray-300 mb-6 text-lg">
          La página que buscas no existe, ha sido movida o eliminada.
        </p>
        
        {/* Suggestions */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left border border-gray-600">
          <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Sugerencias:
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Verifica que la URL esté escrita correctamente</li>
            <li>• Usa el menú de navegación para encontrar lo que buscas</li>
            <li>• Regresa a la página anterior</li>
            <li>• Ve a la página de inicio</li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Ir al inicio</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver atrás</span>
          </button>
        </div>
        
        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            ¿Necesitas ayuda? Contacta con nuestro soporte técnico.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
