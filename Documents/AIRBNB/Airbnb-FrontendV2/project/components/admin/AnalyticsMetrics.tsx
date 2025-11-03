'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface AnalyticsMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  pageViewsPerSession: number;
  newVisitors: number;
  returningVisitors: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  deviceTypes: Array<{
    device: string;
    visitors: number;
    percentage: number;
  }>;
  geographicData: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
}

const AnalyticsMetrics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de análisis
  useEffect(() => {
    const loadAnalyticsMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de análisis
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: AnalyticsMetrics = {
          totalSessions: 125000,
          averageSessionDuration: 4.5,
          bounceRate: 35.2,
          pageViewsPerSession: 3.8,
          newVisitors: 75000,
          returningVisitors: 50000,
          topPages: [
            { page: '/', views: 45000, uniqueViews: 35000 },
            { page: '/search', views: 32000, uniqueViews: 28000 },
            { page: '/detail/madrid-1', views: 15000, uniqueViews: 12000 },
            { page: '/login', views: 12000, uniqueViews: 10000 },
            { page: '/register', views: 8000, uniqueViews: 7000 }
          ],
          trafficSources: [
            { source: 'Búsqueda Orgánica', visitors: 45000, percentage: 36.0 },
            { source: 'Redes Sociales', visitors: 30000, percentage: 24.0 },
            { source: 'Tráfico Directo', visitors: 25000, percentage: 20.0 },
            { source: 'Referencias', visitors: 15000, percentage: 12.0 },
            { source: 'Email', visitors: 10000, percentage: 8.0 }
          ],
          deviceTypes: [
            { device: 'Móvil', visitors: 75000, percentage: 60.0 },
            { device: 'Desktop', visitors: 37500, percentage: 30.0 },
            { device: 'Tablet', visitors: 12500, percentage: 10.0 }
          ],
          geographicData: [
            { country: 'España', visitors: 80000, percentage: 64.0 },
            { country: 'Francia', visitors: 15000, percentage: 12.0 },
            { country: 'Italia', visitors: 10000, percentage: 8.0 },
            { country: 'Alemania', visitors: 8000, percentage: 6.4 },
            { country: 'Reino Unido', visitors: 5000, percentage: 4.0 },
            { country: 'Otros', visitors: 12000, percentage: 9.6 }
          ]
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de análisis:', error);
        setError('Error cargando métricas de análisis');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsMetrics();
  }, []);

  // Formatear números
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Formatear duración
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Análisis</h2>
        <p className="text-gray-600">Análisis detallado del tráfico y comportamiento de usuarios</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Sesiones"
          value={formatNumber(metrics.totalSessions)}
          icon="📊"
          color="blue"
        />
        
        <MetricCard
          title="Duración Promedio"
          value={formatDuration(metrics.averageSessionDuration)}
          icon="⏱️"
          color="green"
        />
        
        <MetricCard
          title="Tasa de Rebote"
          value={formatPercentage(metrics.bounceRate)}
          icon="↩️"
          color="orange"
        />
        
        <MetricCard
          title="Páginas por Sesión"
          value={metrics.pageViewsPerSession.toFixed(1)}
          icon="📄"
          color="purple"
        />
      </div>

      {/* Métricas de visitantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Visitantes Nuevos"
          value={formatNumber(metrics.newVisitors)}
          icon="🆕"
          color="blue"
          subtitle={`${formatPercentage((metrics.newVisitors / (metrics.newVisitors + metrics.returningVisitors)) * 100)} del total`}
        />
        
        <MetricCard
          title="Visitantes Recurrentes"
          value={formatNumber(metrics.returningVisitors)}
          icon="🔄"
          color="green"
          subtitle={`${formatPercentage((metrics.returningVisitors / (metrics.newVisitors + metrics.returningVisitors)) * 100)} del total`}
        />
        
        <MetricCard
          title="Tasa de Retención"
          value={formatPercentage((metrics.returningVisitors / (metrics.newVisitors + metrics.returningVisitors)) * 100)}
          icon="🎯"
          color="purple"
        />
        
        <MetricCard
          title="Engagement Rate"
          value={formatPercentage(100 - metrics.bounceRate)}
          icon="💫"
          color="orange"
        />
      </div>

      {/* Páginas más visitadas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Páginas Más Visitadas
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Página
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vistas Totales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vistas Únicas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porcentaje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.topPages.map((page, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {page.page}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(page.views)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(page.uniqueViews)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage((page.views / metrics.totalSessions) * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fuentes de tráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fuentes de Tráfico
          </h3>
          <div className="space-y-3">
            {metrics.trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {source.source}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {formatNumber(source.visitors)} ({formatPercentage(source.percentage)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tipos de Dispositivos
          </h3>
          <div className="space-y-3">
            {metrics.deviceTypes.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {device.device}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {formatNumber(device.visitors)} ({formatPercentage(device.percentage)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Datos geográficos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución Geográfica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.geographicData.map((country, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {country.country}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatNumber(country.visitors)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPercentage(country.percentage)}
                </div>
              </div>
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
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatDuration(metrics.averageSessionDuration)}
            </div>
            <div className="text-sm text-gray-600">Duración Promedio de Sesión</div>
            <div className="text-xs text-gray-500">Tiempo promedio en el sitio</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.pageViewsPerSession.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Páginas por Sesión</div>
            <div className="text-xs text-gray-500">Promedio de páginas visitadas</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatPercentage(100 - metrics.bounceRate)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Engagement</div>
            <div className="text-xs text-gray-500">Usuarios que interactúan</div>
          </div>
        </div>
      </div>

      {/* Alertas de análisis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Análisis
        </h3>
        <div className="space-y-3">
          {metrics.bounceRate > 50 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Tasa de rebote alta
                </p>
                <p className="text-xs text-yellow-600">
                  La tasa de rebote actual ({formatPercentage(metrics.bounceRate)}) está por encima del umbral recomendado (50%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.averageSessionDuration < 2 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">⏱️</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Duración de sesión baja
                </p>
                <p className="text-xs text-red-600">
                  La duración promedio de sesión ({formatDuration(metrics.averageSessionDuration)}) está por debajo del objetivo (2 minutos)
                </p>
              </div>
            </div>
          )}
          
          {metrics.bounceRate <= 50 && metrics.averageSessionDuration >= 2 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Métricas de análisis saludables
                </p>
                <p className="text-xs text-green-600">
                  Las métricas de análisis están dentro de los rangos objetivos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMetrics;
