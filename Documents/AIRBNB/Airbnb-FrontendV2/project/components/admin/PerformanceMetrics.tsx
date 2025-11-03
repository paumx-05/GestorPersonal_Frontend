'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface PerformanceMetrics {
  responseTime: number;
  uptime: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
}

const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de rendimiento
  useEffect(() => {
    const loadPerformanceMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de rendimiento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: PerformanceMetrics = {
          responseTime: 245, // ms
          uptime: 99.9, // %
          errorRate: 0.1, // %
          throughput: 1250, // requests/min
          memoryUsage: 68.5, // %
          cpuUsage: 45.2, // %
          diskUsage: 78.3, // %
          activeConnections: 342
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de rendimiento:', error);
        setError('Error cargando métricas de rendimiento');
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformanceMetrics();
  }, []);

  // Formatear tiempo de respuesta
  const formatResponseTime = (ms: number): string => {
    return `${ms}ms`;
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Formatear throughput
  const formatThroughput = (value: number): string => {
    return `${value.toLocaleString('es-ES')} req/min`;
  };

  // Obtener color según el valor
  const getPerformanceColor = (value: number, type: 'response' | 'uptime' | 'error' | 'usage'): string => {
    switch (type) {
      case 'response':
        if (value < 200) return 'green';
        if (value < 500) return 'orange';
        return 'red';
      case 'uptime':
        if (value >= 99.9) return 'green';
        if (value >= 99.0) return 'orange';
        return 'red';
      case 'error':
        if (value < 0.1) return 'green';
        if (value < 1.0) return 'orange';
        return 'red';
      case 'usage':
        if (value < 70) return 'green';
        if (value < 85) return 'orange';
        return 'red';
      default:
        return 'blue';
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Rendimiento</h2>
        <p className="text-gray-600">Monitoreo del rendimiento del sistema</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tiempo de Respuesta"
          value={formatResponseTime(metrics.responseTime)}
          icon="⚡"
          color={getPerformanceColor(metrics.responseTime, 'response') as any}
        />
        
        <MetricCard
          title="Tiempo de Actividad"
          value={formatPercentage(metrics.uptime)}
          icon="🟢"
          color={getPerformanceColor(metrics.uptime, 'uptime') as any}
        />
        
        <MetricCard
          title="Tasa de Errores"
          value={formatPercentage(metrics.errorRate)}
          icon="❌"
          color={getPerformanceColor(metrics.errorRate, 'error') as any}
        />
        
        <MetricCard
          title="Throughput"
          value={formatThroughput(metrics.throughput)}
          icon="📊"
          color="blue"
        />
      </div>

      {/* Métricas de recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Uso de Memoria"
          value={formatPercentage(metrics.memoryUsage)}
          icon="💾"
          color={getPerformanceColor(metrics.memoryUsage, 'usage') as any}
        />
        
        <MetricCard
          title="Uso de CPU"
          value={formatPercentage(metrics.cpuUsage)}
          icon="🖥️"
          color={getPerformanceColor(metrics.cpuUsage, 'usage') as any}
        />
        
        <MetricCard
          title="Uso de Disco"
          value={formatPercentage(metrics.diskUsage)}
          icon="💿"
          color={getPerformanceColor(metrics.diskUsage, 'usage') as any}
        />
        
        <MetricCard
          title="Conexiones Activas"
          value={metrics.activeConnections.toString()}
          icon="🔗"
          color="blue"
        />
      </div>

      {/* Gráficos de rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tiempo de respuesta */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tiempo de Respuesta (Últimas 24 horas)
          </h3>
          <div className="h-64 flex items-end space-x-1">
            {[...Array(24)].map((_, i) => {
              const height = Math.random() * 100 + 50; // Simular datos
              return (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 rounded-t-sm"
                  style={{ height: `${height}%` }}
                  title={`Hora ${i}: ${Math.round(height)}ms`}
                />
              );
            })}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Promedio: {metrics.responseTime}ms
          </div>
        </div>

        {/* Gráfico de uso de recursos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uso de Recursos
          </h3>
          <div className="space-y-4">
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

      {/* Alertas de rendimiento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Rendimiento
        </h3>
        <div className="space-y-3">
          {metrics.responseTime > 500 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Tiempo de respuesta alto
                </p>
                <p className="text-xs text-red-600">
                  El tiempo de respuesta actual ({metrics.responseTime}ms) está por encima del umbral recomendado (500ms)
                </p>
              </div>
            </div>
          )}
          
          {metrics.memoryUsage > 85 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Uso de memoria alto
                </p>
                <p className="text-xs text-yellow-600">
                  El uso de memoria actual ({formatPercentage(metrics.memoryUsage)}) está por encima del umbral recomendado (85%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.diskUsage > 90 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">🚨</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Uso de disco crítico
                </p>
                <p className="text-xs text-red-600">
                  El uso de disco actual ({formatPercentage(metrics.diskUsage)}) está en un nivel crítico (>90%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.responseTime <= 500 && metrics.memoryUsage <= 85 && metrics.diskUsage <= 90 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Sistema funcionando correctamente
                </p>
                <p className="text-xs text-green-600">
                  Todas las métricas de rendimiento están dentro de los rangos normales
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
