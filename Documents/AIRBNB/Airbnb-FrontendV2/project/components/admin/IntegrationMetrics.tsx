'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  inactiveIntegrations: number;
  integrationTypes: Array<{
    type: string;
    count: number;
    status: 'active' | 'inactive' | 'error';
  }>;
  apiCalls: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  dataSync: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    lastSyncTime: string;
  };
  errorLogs: Array<{
    integration: string;
    error: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

const IntegrationMetrics = () => {
  const [metrics, setMetrics] = useState<IntegrationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de integración
  useEffect(() => {
    const loadIntegrationMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de integración
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: IntegrationMetrics = {
          totalIntegrations: 25,
          activeIntegrations: 20,
          inactiveIntegrations: 5,
          integrationTypes: [
            { type: 'API REST', count: 12, status: 'active' },
            { type: 'Webhook', count: 8, status: 'active' },
            { type: 'Database', count: 3, status: 'active' },
            { type: 'Email Service', count: 2, status: 'inactive' },
            { type: 'Payment Gateway', count: 1, status: 'error' }
          ],
          apiCalls: {
            total: 125000,
            successful: 118750,
            failed: 6250,
            averageResponseTime: 245
          },
          dataSync: {
            totalSyncs: 5000,
            successfulSyncs: 4750,
            failedSyncs: 250,
            lastSyncTime: '2024-01-15T10:30:00Z'
          },
          errorLogs: [
            { integration: 'Payment Gateway', error: 'Connection timeout', timestamp: '2024-01-15T10:25:00Z', severity: 'high' },
            { integration: 'Email Service', error: 'Invalid API key', timestamp: '2024-01-15T09:45:00Z', severity: 'medium' },
            { integration: 'Database', error: 'Query timeout', timestamp: '2024-01-15T09:15:00Z', severity: 'low' },
            { integration: 'API REST', error: 'Rate limit exceeded', timestamp: '2024-01-15T08:30:00Z', severity: 'medium' }
          ]
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de integración:', error);
        setError('Error cargando métricas de integración');
      } finally {
        setIsLoading(false);
      }
    };

    loadIntegrationMetrics();
  }, []);

  // Formatear números
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Formatear tiempo
  const formatTime = (ms: number): string => {
    if (ms < 1000) {
      return `${ms}ms`;
    } else {
      return `${(ms / 1000).toFixed(1)}s`;
    }
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

  // Obtener color según el estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'error': return 'red';
      default: return 'blue';
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Integración</h2>
        <p className="text-gray-600">Análisis del rendimiento de integraciones y APIs</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Integraciones"
          value={formatNumber(metrics.totalIntegrations)}
          icon="🔗"
          color="blue"
        />
        
        <MetricCard
          title="Integraciones Activas"
          value={formatNumber(metrics.activeIntegrations)}
          icon="✅"
          color="green"
          subtitle={`${formatNumber(metrics.inactiveIntegrations)} inactivas`}
        />
        
        <MetricCard
          title="Llamadas API Totales"
          value={formatNumber(metrics.apiCalls.total)}
          icon="📡"
          color="purple"
        />
        
        <MetricCard
          title="Tiempo Promedio de Respuesta"
          value={formatTime(metrics.apiCalls.averageResponseTime)}
          icon="⏱️"
          color="orange"
        />
      </div>

      {/* Métricas de API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Llamadas Exitosas"
          value={formatNumber(metrics.apiCalls.successful)}
          icon="✅"
          color="green"
          subtitle={`${formatPercentage((metrics.apiCalls.successful / metrics.apiCalls.total) * 100)} del total`}
        />
        
        <MetricCard
          title="Llamadas Fallidas"
          value={formatNumber(metrics.apiCalls.failed)}
          icon="❌"
          color="red"
          subtitle={`${formatPercentage((metrics.apiCalls.failed / metrics.apiCalls.total) * 100)} del total`}
        />
        
        <MetricCard
          title="Sincronizaciones Totales"
          value={formatNumber(metrics.dataSync.totalSyncs)}
          icon="🔄"
          color="blue"
        />
        
        <MetricCard
          title="Sincronizaciones Exitosas"
          value={formatNumber(metrics.dataSync.successfulSyncs)}
          icon="✅"
          color="green"
          subtitle={`${formatPercentage((metrics.dataSync.successfulSyncs / metrics.dataSync.totalSyncs) * 100)} del total`}
        />
      </div>

      {/* Tipos de integración */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tipos de Integración
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porcentaje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.integrationTypes.map((integration, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {integration.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(integration.count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      integration.status === 'active' ? 'bg-green-100 text-green-800' :
                      integration.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {integration.status === 'active' ? 'Activo' :
                       integration.status === 'inactive' ? 'Inactivo' : 'Error'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage((integration.count / metrics.totalIntegrations) * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado de sincronización */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado de Sincronización
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sincronizaciones Exitosas</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(metrics.dataSync.successfulSyncs / metrics.dataSync.totalSyncs) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.dataSync.successfulSyncs)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sincronizaciones Fallidas</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(metrics.dataSync.failedSyncs / metrics.dataSync.totalSyncs) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.dataSync.failedSyncs)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última Sincronización</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(metrics.dataSync.lastSyncTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rendimiento de API
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Llamadas Exitosas</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(metrics.apiCalls.successful / metrics.apiCalls.total) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.apiCalls.successful)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Llamadas Fallidas</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(metrics.apiCalls.failed / metrics.apiCalls.total) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.apiCalls.failed)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiempo Promedio de Respuesta</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(metrics.apiCalls.averageResponseTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logs de errores */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Logs de Errores Recientes
        </h3>
        <div className="space-y-3">
          {metrics.errorLogs.map((log, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              log.severity === 'high' ? 'bg-red-50 border-red-200' :
              log.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${
                    log.severity === 'high' ? 'text-red-800' :
                    log.severity === 'medium' ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>
                    {log.integration}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    log.severity === 'high' ? 'bg-red-100 text-red-800' :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {log.severity === 'high' ? 'Alto' :
                     log.severity === 'medium' ? 'Medio' : 'Bajo'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(log.timestamp)}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                log.severity === 'high' ? 'text-red-700' :
                log.severity === 'medium' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {log.error}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Rendimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatPercentage((metrics.apiCalls.successful / metrics.apiCalls.total) * 100)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Éxito de API</div>
            <div className="text-xs text-gray-500">Llamadas exitosas vs total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPercentage((metrics.dataSync.successfulSyncs / metrics.dataSync.totalSyncs) * 100)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Éxito de Sincronización</div>
            <div className="text-xs text-gray-500">Sincronizaciones exitosas vs total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatPercentage((metrics.activeIntegrations / metrics.totalIntegrations) * 100)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Integraciones Activas</div>
            <div className="text-xs text-gray-500">Integraciones activas vs total</div>
          </div>
        </div>
      </div>

      {/* Alertas de integración */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Integración
        </h3>
        <div className="space-y-3">
          {metrics.apiCalls.failed > 1000 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">❌</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Alto número de llamadas API fallidas
                </p>
                <p className="text-xs text-red-600">
                  Se han detectado {formatNumber(metrics.apiCalls.failed)} llamadas API fallidas en las últimas 24 horas
                </p>
              </div>
            </div>
          )}
          
          {metrics.dataSync.failedSyncs > 50 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">🔄</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Sincronizaciones fallidas
                </p>
                <p className="text-xs text-yellow-600">
                  Se han detectado {formatNumber(metrics.dataSync.failedSyncs)} sincronizaciones fallidas que requieren atención
                </p>
              </div>
            </div>
          )}
          
          {metrics.apiCalls.failed <= 1000 && metrics.dataSync.failedSyncs <= 50 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Sistema de integración funcionando correctamente
                </p>
                <p className="text-xs text-green-600">
                  Todas las métricas de integración están dentro de los rangos normales
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationMetrics;
