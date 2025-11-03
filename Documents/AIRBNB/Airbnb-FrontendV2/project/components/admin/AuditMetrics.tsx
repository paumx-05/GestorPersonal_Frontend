'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface AuditMetrics {
  totalAuditLogs: number;
  auditLogsToday: number;
  auditLogsThisWeek: number;
  auditLogsThisMonth: number;
  auditTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  userActivity: Array<{
    user: string;
    actions: number;
    lastActivity: string;
  }>;
  systemEvents: Array<{
    event: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  complianceMetrics: {
    dataRetention: number;
    accessControl: number;
    dataEncryption: number;
    auditTrail: number;
  };
}

const AuditMetrics = () => {
  const [metrics, setMetrics] = useState<AuditMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de auditoría
  useEffect(() => {
    const loadAuditMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de auditoría
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: AuditMetrics = {
          totalAuditLogs: 125000,
          auditLogsToday: 1250,
          auditLogsThisWeek: 8750,
          auditLogsThisMonth: 37500,
          auditTypes: [
            { type: 'Login', count: 45000, percentage: 36.0 },
            { type: 'Data Access', count: 30000, percentage: 24.0 },
            { type: 'Data Modification', count: 25000, percentage: 20.0 },
            { type: 'System Configuration', count: 15000, percentage: 12.0 },
            { type: 'Security Events', count: 10000, percentage: 8.0 }
          ],
          userActivity: [
            { user: 'admin@airbnb.com', actions: 1250, lastActivity: '2024-01-15T10:30:00Z' },
            { user: 'manager@airbnb.com', actions: 980, lastActivity: '2024-01-15T09:15:00Z' },
            { user: 'analyst@airbnb.com', actions: 750, lastActivity: '2024-01-15T08:45:00Z' },
            { user: 'finance@airbnb.com', actions: 650, lastActivity: '2024-01-15T07:30:00Z' }
          ],
          systemEvents: [
            { event: 'Failed Login Attempts', count: 125, severity: 'high' },
            { event: 'Data Export', count: 85, severity: 'medium' },
            { event: 'Configuration Changes', count: 45, severity: 'medium' },
            { event: 'System Restarts', count: 12, severity: 'low' },
            { event: 'Backup Operations', count: 8, severity: 'low' }
          ],
          complianceMetrics: {
            dataRetention: 95.5,
            accessControl: 98.2,
            dataEncryption: 99.1,
            auditTrail: 97.8
          }
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de auditoría:', error);
        setError('Error cargando métricas de auditoría');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuditMetrics();
  }, []);

  // Formatear números
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color según la severidad
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'blue';
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Auditoría</h2>
        <p className="text-gray-600">Análisis de logs de auditoría y cumplimiento</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Logs de Auditoría"
          value={formatNumber(metrics.totalAuditLogs)}
          icon="📋"
          color="blue"
        />
        
        <MetricCard
          title="Logs Hoy"
          value={formatNumber(metrics.auditLogsToday)}
          icon="📅"
          color="green"
          subtitle={`${formatNumber(metrics.auditLogsThisWeek)} esta semana`}
        />
        
        <MetricCard
          title="Logs Este Mes"
          value={formatNumber(metrics.auditLogsThisMonth)}
          icon="📊"
          color="purple"
        />
        
        <MetricCard
          title="Usuarios Activos"
          value={formatNumber(metrics.userActivity.length)}
          icon="👥"
          color="orange"
        />
      </div>

      {/* Métricas de cumplimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Retención de Datos"
          value={formatPercentage(metrics.complianceMetrics.dataRetention)}
          icon="💾"
          color="blue"
        />
        
        <MetricCard
          title="Control de Acceso"
          value={formatPercentage(metrics.complianceMetrics.accessControl)}
          icon="🔒"
          color="green"
        />
        
        <MetricCard
          title="Encriptación de Datos"
          value={formatPercentage(metrics.complianceMetrics.dataEncryption)}
          icon="🔐"
          color="purple"
        />
        
        <MetricCard
          title="Rastro de Auditoría"
          value={formatPercentage(metrics.complianceMetrics.auditTrail)}
          icon="🕵️"
          color="orange"
        />
      </div>

      {/* Tipos de auditoría */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tipos de Auditoría
        </h3>
        <div className="space-y-3">
          {metrics.auditTypes.map((type, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {type.type}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${type.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {formatNumber(type.count)} ({formatPercentage(type.percentage)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad de usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad de Usuarios
          </h3>
          <div className="space-y-3">
            {metrics.userActivity.map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.user}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(user.actions / Math.max(...metrics.userActivity.map(u => u.actions))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {formatNumber(user.actions)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Eventos del Sistema
          </h3>
          <div className="space-y-3">
            {metrics.systemEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    event.severity === 'high' ? 'bg-red-500' :
                    event.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {event.event}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.severity === 'high' ? 'bg-red-100 text-red-800' :
                    event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {event.severity === 'high' ? 'Alto' :
                     event.severity === 'medium' ? 'Medio' : 'Bajo'}
                  </span>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {formatNumber(event.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas de cumplimiento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Cumplimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPercentage(metrics.complianceMetrics.dataRetention)}
            </div>
            <div className="text-sm text-gray-600">Retención de Datos</div>
            <div className="text-xs text-gray-500">Cumplimiento de políticas de retención</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatPercentage(metrics.complianceMetrics.accessControl)}
            </div>
            <div className="text-sm text-gray-600">Control de Acceso</div>
            <div className="text-xs text-gray-500">Implementación de controles de acceso</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatPercentage(metrics.complianceMetrics.dataEncryption)}
            </div>
            <div className="text-sm text-gray-600">Encriptación de Datos</div>
            <div className="text-xs text-gray-500">Cobertura de encriptación</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {formatPercentage(metrics.complianceMetrics.auditTrail)}
            </div>
            <div className="text-sm text-gray-600">Rastro de Auditoría</div>
            <div className="text-xs text-gray-500">Completitud del rastro de auditoría</div>
          </div>
        </div>
      </div>

      {/* Alertas de auditoría */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Auditoría
        </h3>
        <div className="space-y-3">
          {metrics.systemEvents.some(e => e.severity === 'high') && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">🚨</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Eventos de alta severidad detectados
                </p>
                <p className="text-xs text-red-600">
                  Se han detectado eventos de alta severidad que requieren atención inmediata
                </p>
              </div>
            </div>
          )}
          
          {metrics.complianceMetrics.dataRetention < 95 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Cumplimiento de retención de datos bajo
                </p>
                <p className="text-xs text-yellow-600">
                  La métrica de retención de datos ({formatPercentage(metrics.complianceMetrics.dataRetention)}) está por debajo del objetivo (95%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.complianceMetrics.accessControl < 98 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-orange-600">🔒</span>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Control de acceso requiere revisión
                </p>
                <p className="text-xs text-orange-600">
                  La métrica de control de acceso ({formatPercentage(metrics.complianceMetrics.accessControl)}) está por debajo del objetivo (98%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.systemEvents.every(e => e.severity !== 'high') && 
           metrics.complianceMetrics.dataRetention >= 95 && 
           metrics.complianceMetrics.accessControl >= 98 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Sistema de auditoría funcionando correctamente
                </p>
                <p className="text-xs text-green-600">
                  Todas las métricas de auditoría están dentro de los rangos objetivos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditMetrics;
