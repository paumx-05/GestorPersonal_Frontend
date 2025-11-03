'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface MonitoringMetrics {
  systemHealth: number;
  uptime: number;
  responseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeAlerts: number;
  resolvedAlerts: number;
  monitoringServices: Array<{
    service: string;
    status: 'healthy' | 'warning' | 'critical';
    lastCheck: string;
    responseTime: number;
  }>;
  performanceTrends: Array<{
    metric: string;
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

const MonitoringMetrics = () => {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de monitoreo
  useEffect(() => {
    const loadMonitoringMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de monitoreo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: MonitoringMetrics = {
          systemHealth: 95.5,
          uptime: 99.9,
          responseTime: 245,
          errorRate: 0.1,
          cpuUsage: 45.2,
          memoryUsage: 68.5,
          diskUsage: 78.3,
          networkLatency: 12.5,
          activeAlerts: 3,
          resolvedAlerts: 25,
          monitoringServices: [
            { service: 'API Gateway', status: 'healthy', lastCheck: '2024-01-15T10:30:00Z', responseTime: 120 },
            { service: 'Database', status: 'healthy', lastCheck: '2024-01-15T10:29:00Z', responseTime: 85 },
            { service: 'Cache Service', status: 'warning', lastCheck: '2024-01-15T10:28:00Z', responseTime: 250 },
            { service: 'File Storage', status: 'healthy', lastCheck: '2024-01-15T10:27:00Z', responseTime: 180 },
            { service: 'Email Service', status: 'critical', lastCheck: '2024-01-15T10:26:00Z', responseTime: 5000 }
          ],
          performanceTrends: [
            { metric: 'CPU Usage', current: 45.2, previous: 42.1, trend: 'up' },
            { metric: 'Memory Usage', current: 68.5, previous: 65.2, trend: 'up' },
            { metric: 'Disk Usage', current: 78.3, previous: 80.1, trend: 'down' },
            { metric: 'Network Latency', current: 12.5, previous: 15.2, trend: 'down' },
            { metric: 'Response Time', current: 245, previous: 280, trend: 'down' }
          ]
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de monitoreo:', error);
        setError('Error cargando métricas de monitoreo');
      } finally {
        setIsLoading(false);
      }
    };

    loadMonitoringMetrics();
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
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'blue';
    }
  };

  // Obtener color según la tendencia
  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'up': return 'red';
      case 'down': return 'green';
      case 'stable': return 'blue';
      default: return 'gray';
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Monitoreo</h2>
        <p className="text-gray-600">Monitoreo en tiempo real del sistema</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Salud del Sistema"
          value={formatPercentage(metrics.systemHealth)}
          icon="🏥"
          color="green"
        />
        
        <MetricCard
          title="Tiempo de Actividad"
          value={formatPercentage(metrics.uptime)}
          icon="🟢"
          color="blue"
        />
        
        <MetricCard
          title="Tiempo de Respuesta"
          value={formatTime(metrics.responseTime)}
          icon="⚡"
          color="purple"
        />
        
        <MetricCard
          title="Tasa de Errores"
          value={formatPercentage(metrics.errorRate)}
          icon="❌"
          color="red"
        />
      </div>

      {/* Métricas de recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Uso de CPU"
          value={formatPercentage(metrics.cpuUsage)}
          icon="🖥️"
          color="blue"
        />
        
        <MetricCard
          title="Uso de Memoria"
          value={formatPercentage(metrics.memoryUsage)}
          icon="💾"
          color="green"
        />
        
        <MetricCard
          title="Uso de Disco"
          value={formatPercentage(metrics.diskUsage)}
          icon="💿"
          color="orange"
        />
        
        <MetricCard
          title="Latencia de Red"
          value={formatTime(metrics.networkLatency)}
          icon="🌐"
          color="purple"
        />
      </div>

      {/* Métricas de alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Alertas Activas"
          value={formatNumber(metrics.activeAlerts)}
          icon="🚨"
          color="red"
        />
        
        <MetricCard
          title="Alertas Resueltas"
          value={formatNumber(metrics.resolvedAlerts)}
          icon="✅"
          color="green"
        />
        
        <MetricCard
          title="Tasa de Resolución"
          value={formatPercentage((metrics.resolvedAlerts / (metrics.activeAlerts + metrics.resolvedAlerts)) * 100)}
          icon="🎯"
          color="purple"
        />
        
        <MetricCard
          title="Servicios Monitoreados"
          value={formatNumber(metrics.monitoringServices.length)}
          icon="📊"
          color="blue"
        />
      </div>

      {/* Estado de servicios */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estado de Servicios
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Verificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo de Respuesta
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.monitoringServices.map((service, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      service.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      service.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {service.status === 'healthy' ? 'Saludable' :
                       service.status === 'warning' ? 'Advertencia' : 'Crítico'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(service.lastCheck)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(service.responseTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tendencias de rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencias de Rendimiento
          </h3>
          <div className="space-y-3">
            {metrics.performanceTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    trend.trend === 'up' ? 'bg-red-500' :
                    trend.trend === 'down' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {trend.metric}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {trend.current}
                  </span>
                  <span className={`text-xs ${
                    trend.trend === 'up' ? 'text-red-600' :
                    trend.trend === 'down' ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {trend.trend === 'up' ? '↗️' :
                     trend.trend === 'down' ? '↘️' : '➡️'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uso de Recursos
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span>{formatPercentage(metrics.cpuUsage)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.cpuUsage < 70 ? 'bg-green-500' :
                    metrics.cpuUsage < 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memoria</span>
                <span>{formatPercentage(metrics.memoryUsage)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.memoryUsage < 70 ? 'bg-green-500' :
                    metrics.memoryUsage < 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disco</span>
                <span>{formatPercentage(metrics.diskUsage)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.diskUsage < 70 ? 'bg-green-500' :
                    metrics.diskUsage < 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.diskUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
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
              {formatPercentage(metrics.systemHealth)}
            </div>
            <div className="text-sm text-gray-600">Salud del Sistema</div>
            <div className="text-xs text-gray-500">Estado general del sistema</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPercentage(metrics.uptime)}
            </div>
            <div className="text-sm text-gray-600">Tiempo de Actividad</div>
            <div className="text-xs text-gray-500">Disponibilidad del sistema</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatTime(metrics.responseTime)}
            </div>
            <div className="text-sm text-gray-600">Tiempo de Respuesta</div>
            <div className="text-xs text-gray-500">Latencia promedio</div>
          </div>
        </div>
      </div>

      {/* Alertas de monitoreo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Monitoreo
        </h3>
        <div className="space-y-3">
          {metrics.activeAlerts > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">🚨</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Alertas activas
                </p>
                <p className="text-xs text-red-600">
                  Hay {formatNumber(metrics.activeAlerts)} alertas activas que requieren atención
                </p>
              </div>
            </div>
          )}
          
          {metrics.cpuUsage > 80 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">🖥️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Uso de CPU alto
                </p>
                <p className="text-xs text-yellow-600">
                  El uso de CPU ({formatPercentage(metrics.cpuUsage)}) está por encima del umbral recomendado (80%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.memoryUsage > 85 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-orange-600">💾</span>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Uso de memoria alto
                </p>
                <p className="text-xs text-orange-600">
                  El uso de memoria ({formatPercentage(metrics.memoryUsage)}) está por encima del umbral recomendado (85%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.diskUsage > 90 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">💿</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Uso de disco crítico
                </p>
                <p className="text-xs text-red-600">
                  El uso de disco ({formatPercentage(metrics.diskUsage)}) está en un nivel crítico (>90%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.activeAlerts === 0 && 
           metrics.cpuUsage <= 80 && 
           metrics.memoryUsage <= 85 && 
           metrics.diskUsage <= 90 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Sistema funcionando correctamente
                </p>
                <p className="text-xs text-green-600">
                  Todas las métricas de monitoreo están dentro de los rangos normales
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringMetrics;
