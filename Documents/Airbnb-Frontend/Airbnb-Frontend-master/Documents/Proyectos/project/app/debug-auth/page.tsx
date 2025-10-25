/**
 * Página de debug para autenticación
 * No requiere autenticación para poder diagnosticar problemas
 */

import AuthDebugger from '@/components/auth/AuthDebugger';
import ApiClientTester from '@/components/auth/ApiClientTester';

export default function DebugAuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Debug de Autenticación
          </h1>
          <p className="text-gray-600">
            Herramientas de debug para diagnosticar problemas de autenticación y JWT.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📋 Instrucciones de Debug
            </h3>
            <div className="space-y-2 text-yellow-700">
              <p>1. <strong>Observa AuthDebugger</strong> - muestra el estado actual de autenticación</p>
              <p>2. <strong>Haz login</strong> con credenciales válidas</p>
              <p>3. <strong>Verifica</strong> que AuthDebugger muestre tokens y usuario</p>
              <p>4. <strong>Usa ApiClientTester</strong> para probar llamadas API</p>
              <p>5. <strong>Revisa Network tab</strong> para ver headers de autenticación</p>
            </div>
          </div>

          <AuthDebugger />
          <ApiClientTester />

          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🎯 Qué Buscar
            </h3>
            <div className="space-y-2 text-blue-700">
              <p><strong>✅ Estado Correcto:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• AuthDebugger muestra: isAuthenticated: SÍ</li>
                <li>• AuthDebugger muestra: airbnb_auth_token: [token]...</li>
                <li>• AuthDebugger muestra: user: [nombre]</li>
                <li>• ApiClientTester funciona sin errores</li>
                <li>• Network tab muestra Authorization: Bearer ...</li>
              </ul>
              
              <p className="mt-4"><strong>❌ Problemas Comunes:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Token no se guarda → Problema en authService</li>
                <li>• Token se guarda pero no se envía → Problema en apiClient</li>
                <li>• ApiClient falla pero Fetch directo funciona → Problema en configuración</li>
                <li>• Ambos fallan → Problema en backend</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
