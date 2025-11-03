'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface MarketingMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversionRate: number;
  emailSubscribers: number;
  socialMediaFollowers: number;
  campaignClicks: number;
  campaignConversions: number;
}

const MarketingMetrics = () => {
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de marketing
  useEffect(() => {
    const loadMarketingMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de marketing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: MarketingMetrics = {
          totalVisitors: 125000,
          uniqueVisitors: 89000,
          pageViews: 450000,
          bounceRate: 35.2,
          averageSessionDuration: 4.5,
          conversionRate: 3.8,
          emailSubscribers: 12500,
          socialMediaFollowers: 25000,
          campaignClicks: 8500,
          campaignConversions: 320
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de marketing:', error);
        setError('Error cargando métricas de marketing');
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketingMetrics();
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Marketing</h2>
        <p className="text-gray-600">Análisis de tráfico y conversiones</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Visitantes"
          value={formatNumber(metrics.totalVisitors)}
          icon="👥"
          color="blue"
        />
        
        <MetricCard
          title="Visitantes Únicos"
          value={formatNumber(metrics.uniqueVisitors)}
          icon="🆔"
          color="green"
          subtitle={`${formatPercentage((metrics.uniqueVisitors / metrics.totalVisitors) * 100)} del total`}
        />
        
        <MetricCard
          title="Páginas Vistas"
          value={formatNumber(metrics.pageViews)}
          icon="📄"
          color="purple"
        />
        
        <MetricCard
          title="Tasa de Rebote"
          value={formatPercentage(metrics.bounceRate)}
          icon="↩️"
          color="orange"
        />
      </div>

      {/* Métricas de engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Duración Promedio"
          value={formatDuration(metrics.averageSessionDuration)}
          icon="⏱️"
          color="blue"
        />
        
        <MetricCard
          title="Tasa de Conversión"
          value={formatPercentage(metrics.conversionRate)}
          icon="🎯"
          color="green"
        />
        
        <MetricCard
          title="Suscriptores Email"
          value={formatNumber(metrics.emailSubscribers)}
          icon="📧"
          color="purple"
        />
        
        <MetricCard
          title="Seguidores Sociales"
          value={formatNumber(metrics.socialMediaFollowers)}
          icon="📱"
          color="orange"
        />
      </div>

      {/* Métricas de campañas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Clicks en Campañas"
          value={formatNumber(metrics.campaignClicks)}
          icon="🖱️"
          color="blue"
        />
        
        <MetricCard
          title="Conversiones de Campañas"
          value={formatNumber(metrics.campaignConversions)}
          icon="🎯"
          color="green"
        />
        
        <MetricCard
          title="CTR de Campañas"
          value={formatPercentage((metrics.campaignConversions / metrics.campaignClicks) * 100)}
          icon="📊"
          color="purple"
        />
        
        <MetricCard
          title="ROI de Campañas"
          value="320%"
          icon="💰"
          color="orange"
        />
      </div>

      {/* Análisis de tráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuentes de tráfico */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fuentes de Tráfico
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Búsqueda Orgánica</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">45%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Redes Sociales</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">25%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tráfico Directo</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">20%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Referencias</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dispositivos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dispositivos
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Móvil</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">60%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Desktop</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">30%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tablet</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de engagement */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Engagement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPercentage(metrics.bounceRate)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Rebote</div>
            <div className="text-xs text-gray-500">Usuarios que abandonan rápidamente</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatDuration(metrics.averageSessionDuration)}
            </div>
            <div className="text-sm text-gray-600">Duración Promedio</div>
            <div className="text-xs text-gray-500">Tiempo en el sitio</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatPercentage(metrics.conversionRate)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Conversión</div>
            <div className="text-xs text-gray-500">Visitantes que se convierten</div>
          </div>
        </div>
      </div>

      {/* Alertas de marketing */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Marketing
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
          
          {metrics.conversionRate < 2 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">📉</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Tasa de conversión baja
                </p>
                <p className="text-xs text-red-600">
                  La tasa de conversión actual ({formatPercentage(metrics.conversionRate)}) está por debajo del objetivo (2%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.bounceRate <= 50 && metrics.conversionRate >= 2 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Métricas de marketing saludables
                </p>
                <p className="text-xs text-green-600">
                  Las métricas de marketing están dentro de los rangos objetivos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingMetrics;
