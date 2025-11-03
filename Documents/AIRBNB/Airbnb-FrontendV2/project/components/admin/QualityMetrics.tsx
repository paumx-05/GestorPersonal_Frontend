'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface QualityMetrics {
  averageRating: number;
  totalReviews: number;
  positiveReviews: number;
  negativeReviews: number;
  responseRate: number;
  averageResponseTime: number;
  qualityScore: number;
  cleanlinessScore: number;
  communicationScore: number;
  valueScore: number;
  recentImprovements: number;
  qualityTrends: Array<{
    month: string;
    rating: number;
    reviews: number;
  }>;
}

const QualityMetrics = () => {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de calidad
  useEffect(() => {
    const loadQualityMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de calidad
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: QualityMetrics = {
          averageRating: 4.3,
          totalReviews: 12500,
          positiveReviews: 10875,
          negativeReviews: 1625,
          responseRate: 92.5,
          averageResponseTime: 2.5,
          qualityScore: 4.2,
          cleanlinessScore: 4.4,
          communicationScore: 4.1,
          valueScore: 4.0,
          recentImprovements: 15.2,
          qualityTrends: [
            { month: 'Jul', rating: 4.1, reviews: 1200 },
            { month: 'Ago', rating: 4.2, reviews: 1350 },
            { month: 'Sep', rating: 4.3, reviews: 1400 },
            { month: 'Oct', rating: 4.2, reviews: 1300 },
            { month: 'Nov', rating: 4.4, reviews: 1450 },
            { month: 'Dic', rating: 4.3, reviews: 1200 }
          ]
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de calidad:', error);
        setError('Error cargando métricas de calidad');
      } finally {
        setIsLoading(false);
      }
    };

    loadQualityMetrics();
  }, []);

  // Formatear números
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Formatear calificación
  const formatRating = (rating: number): string => {
    return `${rating.toFixed(1)}/5.0`;
  };

  // Formatear tiempo
  const formatTime = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    } else {
      return `${hours.toFixed(1)}h`;
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Calidad</h2>
        <p className="text-gray-600">Análisis de la calidad del servicio y satisfacción del cliente</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Calificación Promedio"
          value={formatRating(metrics.averageRating)}
          icon="⭐"
          color="yellow"
        />
        
        <MetricCard
          title="Total de Reseñas"
          value={formatNumber(metrics.totalReviews)}
          icon="📝"
          color="blue"
        />
        
        <MetricCard
          title="Reseñas Positivas"
          value={formatNumber(metrics.positiveReviews)}
          icon="👍"
          color="green"
          subtitle={`${formatPercentage((metrics.positiveReviews / metrics.totalReviews) * 100)} del total`}
        />
        
        <MetricCard
          title="Tasa de Respuesta"
          value={formatPercentage(metrics.responseRate)}
          icon="💬"
          color="purple"
        />
      </div>

      {/* Métricas de calidad detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Calidad General"
          value={formatRating(metrics.qualityScore)}
          icon="🏆"
          color="blue"
        />
        
        <MetricCard
          title="Limpieza"
          value={formatRating(metrics.cleanlinessScore)}
          icon="🧹"
          color="green"
        />
        
        <MetricCard
          title="Comunicación"
          value={formatRating(metrics.communicationScore)}
          icon="💬"
          color="purple"
        />
        
        <MetricCard
          title="Relación Calidad-Precio"
          value={formatRating(metrics.valueScore)}
          icon="💰"
          color="orange"
        />
      </div>

      {/* Análisis de reseñas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de reseñas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Reseñas
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Positivas (4-5 estrellas)</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(metrics.positiveReviews / metrics.totalReviews) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.positiveReviews)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Negativas (1-2 estrellas)</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(metrics.negativeReviews / metrics.totalReviews) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.negativeReviews)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Neutras (3 estrellas)</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${((metrics.totalReviews - metrics.positiveReviews - metrics.negativeReviews) / metrics.totalReviews) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.totalReviews - metrics.positiveReviews - metrics.negativeReviews)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tiempos de respuesta */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tiempos de Respuesta
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiempo Promedio de Respuesta</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(metrics.averageResponseTime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa de Respuesta</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(metrics.responseRate)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mejoras Recientes</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(metrics.recentImprovements)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tendencias de calidad */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tendencias de Calidad (Últimos 6 meses)
        </h3>
        <div className="space-y-3">
          {metrics.qualityTrends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {trend.month}
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600">
                  {formatRating(trend.rating)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatNumber(trend.reviews)} reseñas
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de satisfacción */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Satisfacción por Categoría
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatRating(metrics.qualityScore)}
            </div>
            <div className="text-sm text-gray-600">Calidad General</div>
            <div className="text-xs text-gray-500">Evaluación general del servicio</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatRating(metrics.cleanlinessScore)}
            </div>
            <div className="text-sm text-gray-600">Limpieza</div>
            <div className="text-xs text-gray-500">Estado de limpieza de las propiedades</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatRating(metrics.communicationScore)}
            </div>
            <div className="text-sm text-gray-600">Comunicación</div>
            <div className="text-xs text-gray-500">Calidad de la comunicación con huéspedes</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {formatRating(metrics.valueScore)}
            </div>
            <div className="text-sm text-gray-600">Relación Calidad-Precio</div>
            <div className="text-xs text-gray-500">Valor percibido por el precio</div>
          </div>
        </div>
      </div>

      {/* Alertas de calidad */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Calidad
        </h3>
        <div className="space-y-3">
          {metrics.averageRating < 4.0 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">⭐</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Calificación promedio baja
                </p>
                <p className="text-xs text-red-600">
                  La calificación promedio ({formatRating(metrics.averageRating)}) está por debajo del objetivo (4.0)
                </p>
              </div>
            </div>
          )}
          
          {metrics.responseRate < 80 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">💬</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Tasa de respuesta baja
                </p>
                <p className="text-xs text-yellow-600">
                  La tasa de respuesta ({formatPercentage(metrics.responseRate)}) está por debajo del objetivo (80%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.averageResponseTime > 24 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-orange-600">⏱️</span>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Tiempo de respuesta alto
                </p>
                <p className="text-xs text-orange-600">
                  El tiempo promedio de respuesta ({formatTime(metrics.averageResponseTime)}) está por encima del objetivo (24h)
                </p>
              </div>
            </div>
          )}
          
          {metrics.averageRating >= 4.0 && metrics.responseRate >= 80 && metrics.averageResponseTime <= 24 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Métricas de calidad excelentes
                </p>
                <p className="text-xs text-green-600">
                  Todas las métricas de calidad están dentro de los rangos objetivos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityMetrics;
