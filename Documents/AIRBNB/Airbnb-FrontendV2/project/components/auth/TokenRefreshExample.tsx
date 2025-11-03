/**
 * Componente de ejemplo para demostrar el uso de la renovación automática de tokens
 * Este componente muestra cómo usar las nuevas funcionalidades implementadas
 */

'use client';

import { useAuth } from '@/context/AuthContext';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { useState, useEffect } from 'react';

export const TokenRefreshExample: React.FC = () => {
  const { user, isAuthenticated, refreshToken } = useAuth();
  const { refreshToken: manualRefresh } = useTokenRefresh();
  const [tokenInfo, setTokenInfo] = useState<{
    token: string | null;
    expiresAt: string | null;
    timeUntilExpiry: number | null;
  }>({
    token: null,
    expiresAt: null,
    timeUntilExpiry: null
  });

  // Función para obtener información del token
  const getTokenInfo = () => {
    const token = localStorage.getItem('airbnb_auth_token');
    if (!token) {
      setTokenInfo({ token: null, expiresAt: null, timeUntilExpiry: null });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = exp - now;

      setTokenInfo({
        token: token.substring(0, 20) + '...',
        expiresAt: new Date(exp).toLocaleString(),
        timeUntilExpiry: Math.round(timeUntilExpiry / 1000 / 60) // minutos
      });
    } catch (error) {
      console.error('Error decodificando token:', error);
      setTokenInfo({ token: null, expiresAt: null, timeUntilExpiry: null });
    }
  };

  // Actualizar información del token cada minuto
  useEffect(() => {
    getTokenInfo();
    const interval = setInterval(getTokenInfo, 60000); // cada minuto
    return () => clearInterval(interval);
  }, []);

  // Renovación manual del token
  const handleManualRefresh = async () => {
    try {
      await manualRefresh();
      getTokenInfo(); // Actualizar información
      alert('Token renovado exitosamente');
    } catch (error) {
      alert('Error renovando token');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          🔒 No Autenticado
        </h3>
        <p className="text-yellow-700">
          Inicia sesión para ver la información del token y probar la renovación automática.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">
        🔄 Renovación Automática de Tokens
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-700 mb-2">Información del Usuario</h4>
          <p className="text-sm text-blue-600">
            <strong>Nombre:</strong> {user?.name}
          </p>
          <p className="text-sm text-blue-600">
            <strong>Email:</strong> {user?.email}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-blue-700 mb-2">Estado del Token</h4>
          {tokenInfo.token ? (
            <div className="space-y-2">
              <p className="text-sm text-blue-600">
                <strong>Token:</strong> {tokenInfo.token}
              </p>
              <p className="text-sm text-blue-600">
                <strong>Expira:</strong> {tokenInfo.expiresAt}
              </p>
              <p className="text-sm text-blue-600">
                <strong>Tiempo restante:</strong> {tokenInfo.timeUntilExpiry} minutos
              </p>
              {tokenInfo.timeUntilExpiry && tokenInfo.timeUntilExpiry < 5 && (
                <p className="text-sm text-orange-600 font-medium">
                  ⚠️ Token próximo a expirar - se renovará automáticamente
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-600">No hay token disponible</p>
          )}
        </div>

        <div>
          <h4 className="font-medium text-blue-700 mb-2">Acciones</h4>
          <div className="space-x-2">
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Renovar Token Manualmente
            </button>
            <button
              onClick={getTokenInfo}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              🔍 Actualizar Información
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-700 mb-2">Funcionalidades Implementadas</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>✅ Renovación automática cada 14 minutos</li>
            <li>✅ Renovación 5 minutos antes de expirar</li>
            <li>✅ Interceptor automático en peticiones HTTP</li>
            <li>✅ Reintento automático de peticiones fallidas</li>
            <li>✅ Redirección automática al login si falla la renovación</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenRefreshExample;
