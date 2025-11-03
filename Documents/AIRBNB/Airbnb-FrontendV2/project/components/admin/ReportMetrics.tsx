'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface ReportMetrics {
  totalReports: number;
  generatedReports: number;
  scheduledReports: number;
  reportTypes: Array<{
    type: string;
    count: number;
    lastGenerated: string;
  }>;
  reportUsage: Array<{
    user: string;
    reportsGenerated: number;
    lastAccess: string;
  }>;
  reportPerformance: {
    averageGenerationTime: number;
    successRate: number;
    errorRate: number;
  };
  popularReports: Array<{
    name: string;
    downloads: number;
    views: number;
  }>;
}

const ReportMetrics = () => {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de reportes
  useEffect(() => {
    const loadReportMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de reportes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: ReportMetrics = {
          totalReports: 1250,
          generatedReports: 1100,
          scheduledReports: 150,
          reportTypes: [
            { type: 'Reporte de Usuarios', count: 320, lastGenerated: '2024-01-15T10:30:00Z' },
            { type: 'Reporte de Propiedades', count: 280, lastGenerated: '2024-01-15T09:15:00Z' },
            { type: 'Reporte de Reservas', count: 250, lastGenerated: '2024-01-15T08:45:00Z' },
            { type: 'Reporte Financiero', count: 200, lastGenerated: '2024-01-15T07:30:00Z' },
            { type: 'Reporte de Calidad', count: 150, lastGenerated: '2024-01-14T16:20:00Z' },
            { type: 'Reporte de Marketing', count: 100, lastGenerated: '2024-01-14T14:10:00Z' }
          ],
          reportUsage: [
            { user: 'admin@airbnb.com', reportsGenerated: 450, lastAccess: '2024-01-15T10:30:00Z' },
            { user: 'manager@airbnb.com', reportsGenerated: 320, lastAccess: '2024-01-15T09:15:00Z' },
            { user: 'analyst@airbnb.com', reportsGenerated: 280, lastAccess: '2024-01-15T08:45:00Z' },
            { user: 'finance@airbnb.com', reportsGenerated: 200, lastAccess: '2024-01-15T07:30:00Z' }
          ],
          reportPerformance: {
            averageGenerationTime: 2.5,
            successRate: 95.2,
            errorRate: 4.8
          },
          popularReports: [
            { name: 'Reporte de Usuarios', downloads: 1250, views: 3200 },
            { name: 'Reporte de Propiedades', downloads: 1100, views: 2800 },
            { name: 'Reporte de Reservas', downloads: 950, views: 2400 },
            { name: 'Reporte Financiero', downloads: 800, views: 2000 },
            { name: 'Reporte de Calidad', downloads: 650, views: 1600 }
          ]
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de reportes:', error);
        setError('Error cargando métricas de reportes');
      } finally {
        setIsLoading(false);
      }
    };

    loadReportMetrics();
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
  const formatTime = (minutes: number): string => {
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds}s`;
    } else {
      return `${minutes.toFixed(1)}m`;
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Reportes</h2>
        <p className="text-gray-600">Análisis del uso y rendimiento de reportes</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Reportes"
          value={formatNumber(metrics.totalReports)}
          icon="📊"
          color="blue"
        />
        
        <MetricCard
          title="Reportes Generados"
          value={formatNumber(metrics.generatedReports)}
          icon="✅"
          color="green"
          subtitle={`${formatNumber(metrics.scheduledReports)} programados`}
        />
        
        <MetricCard
          title="Tiempo Promedio"
          value={formatTime(metrics.reportPerformance.averageGenerationTime)}
          icon="⏱️"
          color="purple"
        />
        
        <MetricCard
          title="Tasa de Éxito"
          value={formatPercentage(metrics.reportPerformance.successRate)}
          icon="🎯"
          color="orange"
        />
      </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tasa de Error"
          value={formatPercentage(metrics.reportPerformance.errorRate)}
          icon="❌"
          color="red"
        />
        
        <MetricCard
          title="Reportes Programados"
          value={formatNumber(metrics.scheduledReports)}
          icon="📅"
          color="blue"
        />
        
        <MetricCard
          title="Usuarios Activos"
          value={formatNumber(metrics.reportUsage.length)}
          icon="👥"
          color="green"
        />
        
        <MetricCard
          title="Tipos de Reporte"
          value={formatNumber(metrics.reportTypes.length)}
          icon="📋"
          color="purple"
        />
      </div>

      {/* Tipos de reportes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tipos de Reportes
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Reporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Generada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Generación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porcentaje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.reportTypes.map((report, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(report.count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(report.lastGenerated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage((report.count / metrics.totalReports) * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Uso por usuario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uso por Usuario
          </h3>
          <div className="space-y-3">
            {metrics.reportUsage.map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.user}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(user.reportsGenerated / Math.max(...metrics.reportUsage.map(u => u.reportsGenerated))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {formatNumber(user.reportsGenerated)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reportes Populares
          </h3>
          <div className="space-y-3">
            {metrics.popularReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {report.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(report.downloads / Math.max(...metrics.popularReports.map(r => r.downloads))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {formatNumber(report.downloads)}
                  </span>
                </div>
              </div>
            ))}
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
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatTime(metrics.reportPerformance.averageGenerationTime)}
            </div>
            <div className="text-sm text-gray-600">Tiempo Promedio de Generación</div>
            <div className="text-xs text-gray-500">Tiempo promedio para generar un reporte</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatPercentage(metrics.reportPerformance.successRate)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Éxito</div>
            <div className="text-xs text-gray-500">Reportes generados exitosamente</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {formatPercentage(metrics.reportPerformance.errorRate)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Error</div>
            <div className="text-xs text-gray-500">Reportes que fallaron al generar</div>
          </div>
        </div>
      </div>

      {/* Alertas de reportes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Reportes
        </h3>
        <div className="space-y-3">
          {metrics.reportPerformance.errorRate > 10 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">❌</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Tasa de error alta en reportes
                </p>
                <p className="text-xs text-red-600">
                  La tasa de error actual ({formatPercentage(metrics.reportPerformance.errorRate)}) está por encima del umbral recomendado (10%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.reportPerformance.averageGenerationTime > 5 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⏱️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Tiempo de generación alto
                </p>
                <p className="text-xs text-yellow-600">
                  El tiempo promedio de generación ({formatTime(metrics.reportPerformance.averageGenerationTime)}) está por encima del objetivo (5 minutos)
                </p>
              </div>
            </div>
          )}
          
          {metrics.reportPerformance.errorRate <= 10 && metrics.reportPerformance.averageGenerationTime <= 5 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Sistema de reportes funcionando correctamente
                </p>
                <p className="text-xs text-green-600">
                  Todas las métricas de reportes están dentro de los rangos objetivos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportMetrics;
