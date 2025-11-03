'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  blockedIPs: number;
  suspiciousActivities: number;
  passwordResets: number;
  emailVerifications: number;
  twoFactorEnabled: number;
  securityAlerts: number;
}

const SecurityMetrics = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de seguridad
  useEffect(() => {
    const loadSecurityMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de seguridad
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: SecurityMetrics = {
          totalLogins: 15420,
          failedLogins: 245,
          blockedIPs: 12,
          suspiciousActivities: 8,
          passwordResets: 156,
          emailVerifications: 892,
          twoFactorEnabled: 234,
          securityAlerts: 3
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de seguridad:', error);
        setError('Error cargando métricas de seguridad');
      } finally {
        setIsLoading(false);
      }
    };

    loadSecurityMetrics();
  }, []);

  // Formatear números
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Calcular porcentaje
  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Seguridad</h2>
        <p className="text-gray-600">Monitoreo de la seguridad del sistema</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Logins"
          value={formatNumber(metrics.totalLogins)}
          icon="🔐"
          color="blue"
        />
        
        <MetricCard
          title="Logins Fallidos"
          value={formatNumber(metrics.failedLogins)}
          icon="❌"
          color="red"
          subtitle={`${calculatePercentage(metrics.failedLogins, metrics.totalLogins)}% del total`}
        />
        
        <MetricCard
          title="IPs Bloqueadas"
          value={formatNumber(metrics.blockedIPs)}
          icon="🚫"
          color="orange"
        />
        
        <MetricCard
          title="Actividades Sospechosas"
          value={formatNumber(metrics.suspiciousActivities)}
          icon="⚠️"
          color="yellow"
        />
      </div>

      {/* Métricas de autenticación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Resets de Contraseña"
          value={formatNumber(metrics.passwordResets)}
          icon="🔄"
          color="purple"
        />
        
        <MetricCard
          title="Verificaciones de Email"
          value={formatNumber(metrics.emailVerifications)}
          icon="📧"
          color="green"
        />
        
        <MetricCard
          title="2FA Habilitado"
          value={formatNumber(metrics.twoFactorEnabled)}
          icon="🔒"
          color="blue"
        />
        
        <MetricCard
          title="Alertas de Seguridad"
          value={formatNumber(metrics.securityAlerts)}
          icon="🚨"
          color="red"
        />
      </div>

      {/* Análisis de seguridad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasa de éxito de login */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tasa de Éxito de Login
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {100 - calculatePercentage(metrics.failedLogins, metrics.totalLogins)}%
            </div>
            <div className="text-sm text-gray-600">Logins exitosos</div>
            <div className="text-xs text-gray-500 mt-2">
              {formatNumber(metrics.totalLogins - metrics.failedLogins)} de {formatNumber(metrics.totalLogins)} intentos
            </div>
          </div>
        </div>

        {/* Adopción de 2FA */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Adopción de Autenticación de Dos Factores
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {calculatePercentage(metrics.twoFactorEnabled, metrics.totalLogins)}%
            </div>
            <div className="text-sm text-gray-600">Usuarios con 2FA</div>
            <div className="text-xs text-gray-500 mt-2">
              {formatNumber(metrics.twoFactorEnabled)} de {formatNumber(metrics.totalLogins)} usuarios
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de seguridad */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Seguridad Recientes
        </h3>
        <div className="space-y-3">
          {metrics.failedLogins > 200 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">🚨</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Alto número de logins fallidos
                </p>
                <p className="text-xs text-red-600">
                  Se han detectado {formatNumber(metrics.failedLogins)} intentos de login fallidos en las últimas 24 horas
                </p>
              </div>
            </div>
          )}
          
          {metrics.suspiciousActivities > 5 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Actividades sospechosas detectadas
                </p>
                <p className="text-xs text-yellow-600">
                  Se han detectado {formatNumber(metrics.suspiciousActivities)} actividades sospechosas que requieren revisión
                </p>
              </div>
            </div>
          )}
          
          {metrics.blockedIPs > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-orange-600">🚫</span>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  IPs bloqueadas
                </p>
                <p className="text-xs text-orange-600">
                  Se han bloqueado {formatNumber(metrics.blockedIPs)} direcciones IP por actividades maliciosas
                </p>
              </div>
            </div>
          )}
          
          {metrics.failedLogins <= 200 && metrics.suspiciousActivities <= 5 && metrics.blockedIPs === 0 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Sistema de seguridad funcionando correctamente
                </p>
                <p className="text-xs text-green-600">
                  No se han detectado amenazas de seguridad significativas
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recomendaciones de seguridad */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recomendaciones de Seguridad
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600">💡</span>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Implementar autenticación de dos factores
              </p>
              <p className="text-xs text-gray-600">
                Solo el {calculatePercentage(metrics.twoFactorEnabled, metrics.totalLogins)}% de los usuarios tiene 2FA habilitado
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-green-600">💡</span>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Revisar políticas de contraseñas
              </p>
              <p className="text-xs text-gray-600">
                Considerar implementar requisitos más estrictos para contraseñas
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-purple-600">💡</span>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Monitorear intentos de login fallidos
              </p>
              <p className="text-xs text-gray-600">
                Implementar bloqueos automáticos después de múltiples intentos fallidos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityMetrics;
