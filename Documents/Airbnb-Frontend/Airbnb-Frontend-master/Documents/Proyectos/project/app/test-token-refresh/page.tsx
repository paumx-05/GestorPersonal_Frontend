/**
 * Página de prueba para la renovación automática de tokens
 * Esta página permite probar todas las funcionalidades implementadas
 */

import TokenRefreshExample from '@/components/auth/TokenRefreshExample';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthDebugger from '@/components/auth/AuthDebugger';
import ApiClientTester from '@/components/auth/ApiClientTester';

export default function TestTokenRefreshPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔄 Prueba de Renovación Automática de Tokens
          </h1>
          <p className="text-gray-600">
            Esta página permite probar la renovación automática de tokens JWT implementada.
          </p>
        </div>

        <div className="space-y-6">
          <AuthDebugger />
          <ApiClientTester />
          
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔧 Herramientas de Debug
            </h3>
            <p className="text-blue-700 mb-4">
              Las herramientas de debug están disponibles sin autenticación para poder diagnosticar problemas.
            </p>
            <p className="text-blue-700">
              Haz login primero y luego usa las herramientas para verificar que todo funcione correctamente.
            </p>
          </div>
          
          <ProtectedRoute>
            <TokenRefreshExample />
            
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Implementación Completada
              </h3>
              <p className="text-green-700 mb-4">
                La renovación automática de tokens está completamente implementada y funcionando.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">Características Implementadas:</h4>
                <ul className="text-sm text-green-600 space-y-1 ml-4">
                  <li>• Interceptor automático en todas las peticiones HTTP</li>
                  <li>• Renovación automática cada 14 minutos</li>
                  <li>• Renovación 5 minutos antes de la expiración</li>
                  <li>• Reintento automático de peticiones fallidas</li>
                  <li>• Redirección automática al login si falla la renovación</li>
                  <li>• Protección de rutas con renovación automática</li>
                  <li>• Logging detallado para debugging</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🧪 Cómo Probar
              </h3>
              <div className="space-y-2 text-yellow-700">
                <p>1. <strong>Inicia sesión</strong> para obtener un token</p>
                <p>2. <strong>Espera</strong> hasta que el token esté próximo a expirar</p>
                <p>3. <strong>Haz peticiones</strong> a endpoints protegidos</p>
                <p>4. <strong>Verifica</strong> que el token se renueva automáticamente</p>
                <p>5. <strong>Usa el botón</strong> "Renovar Token Manualmente" para probar la renovación</p>
              </div>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📚 Documentación
              </h3>
              <div className="space-y-2 text-blue-700">
                <p>• <strong>Guía Original:</strong> <code>FRONTEND_TOKEN_REFRESH_GUIDE.md</code></p>
                <p>• <strong>Milestone:</strong> <code>MILESTONE-TOKEN-REFRESH.md</code></p>
                <p>• <strong>Componente de Ejemplo:</strong> <code>components/auth/TokenRefreshExample.tsx</code></p>
                <p>• <strong>Hook Personalizado:</strong> <code>hooks/useTokenRefresh.ts</code></p>
                <p>• <strong>Interceptor:</strong> <code>lib/api/authInterceptor.ts</code></p>
              </div>
            </div>
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
