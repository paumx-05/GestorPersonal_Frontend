'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
  firstResponseTime: number;
  escalationRate: number;
  selfServiceUsage: number;
  commonIssues: Array<{
    issue: string;
    count: number;
    percentage: number;
  }>;
}

const SupportMetrics = () => {
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de soporte
  useEffect(() => {
    const loadSupportMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de soporte
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: SupportMetrics = {
          totalTickets: 1250,
          openTickets: 45,
          closedTickets: 1205,
          averageResolutionTime: 2.5,
          customerSatisfaction: 4.2,
          firstResponseTime: 0.5,
          escalationRate: 8.5,
          selfServiceUsage: 65.2,
          commonIssues: [
            { issue: 'Problemas de pago', count: 320, percentage: 25.6 },
            { issue: 'Cancelación de reserva', count: 280, percentage: 22.4 },
            { issue: 'Problemas técnicos', count: 200, percentage: 16.0 },
            { issue: 'Reembolsos', count: 150, percentage: 12.0 },
            { issue: 'Verificación de cuenta', count: 120, percentage: 9.6 },
            { issue: 'Otros', count: 180, percentage: 14.4 }
          ]
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de soporte:', error);
        setError('Error cargando métricas de soporte');
      } finally {
        setIsLoading(false);
      }
    };

    loadSupportMetrics();
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
  const formatTime = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours.toFixed(1)}h`;
    }
  };

  // Formatear calificación
  const formatRating = (rating: number): string => {
    return `${rating.toFixed(1)}/5.0`;
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Soporte</h2>
        <p className="text-gray-600">Análisis del rendimiento del servicio al cliente</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Tickets"
          value={formatNumber(metrics.totalTickets)}
          icon="🎫"
          color="blue"
        />
        
        <MetricCard
          title="Tickets Abiertos"
          value={formatNumber(metrics.openTickets)}
          icon="🔓"
          color="orange"
          subtitle={`${formatNumber(metrics.closedTickets)} cerrados`}
        />
        
        <MetricCard
          title="Tiempo de Resolución"
          value={formatTime(metrics.averageResolutionTime)}
          icon="⏱️"
          color="green"
        />
        
        <MetricCard
          title="Satisfacción del Cliente"
          value={formatRating(metrics.customerSatisfaction)}
          icon="😊"
          color="purple"
        />
      </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tiempo de Primera Respuesta"
          value={formatTime(metrics.firstResponseTime)}
          icon="⚡"
          color="blue"
        />
        
        <MetricCard
          title="Tasa de Escalación"
          value={formatPercentage(metrics.escalationRate)}
          icon="📈"
          color="orange"
        />
        
        <MetricCard
          title="Uso de Autoservicio"
          value={formatPercentage(metrics.selfServiceUsage)}
          icon="🤖"
          color="green"
        />
        
        <MetricCard
          title="Tasa de Resolución"
          value={formatPercentage((metrics.closedTickets / metrics.totalTickets) * 100)}
          icon="✅"
          color="purple"
        />
      </div>

      {/* Análisis de tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de tickets */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado de Tickets
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Abiertos</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(metrics.openTickets / metrics.totalTickets) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.openTickets)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cerrados</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(metrics.closedTickets / metrics.totalTickets) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.closedTickets)}</span>
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
              <span className="text-sm text-gray-600">Primera Respuesta</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(metrics.firstResponseTime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resolución Promedio</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(metrics.averageResolutionTime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa de Escalación</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(metrics.escalationRate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Problemas más comunes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Problemas Más Comunes
        </h3>
        <div className="space-y-3">
          {metrics.commonIssues.map((issue, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {issue.issue}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${issue.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {issue.count} ({formatPercentage(issue.percentage)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de satisfacción */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Satisfacción
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatRating(metrics.customerSatisfaction)}
            </div>
            <div className="text-sm text-gray-600">Satisfacción del Cliente</div>
            <div className="text-xs text-gray-500">Calificación promedio</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPercentage(metrics.selfServiceUsage)}
            </div>
            <div className="text-sm text-gray-600">Uso de Autoservicio</div>
            <div className="text-xs text-gray-500">Clientes que se ayudan solos</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatPercentage((metrics.closedTickets / metrics.totalTickets) * 100)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Resolución</div>
            <div className="text-xs text-gray-500">Tickets resueltos exitosamente</div>
          </div>
        </div>
      </div>

      {/* Alertas de soporte */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Soporte
        </h3>
        <div className="space-y-3">
          {metrics.averageResolutionTime > 24 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">🚨</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Tiempo de resolución alto
                </p>
                <p className="text-xs text-red-600">
                  El tiempo promedio de resolución ({formatTime(metrics.averageResolutionTime)}) está por encima del objetivo (24h)
                </p>
              </div>
            </div>
          )}
          
          {metrics.customerSatisfaction < 4.0 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Satisfacción del cliente baja
                </p>
                <p className="text-xs text-yellow-600">
                  La calificación promedio ({formatRating(metrics.customerSatisfaction)}) está por debajo del objetivo (4.0)
                </p>
              </div>
            </div>
          )}
          
          {metrics.escalationRate > 15 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-orange-600">📈</span>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Tasa de escalación alta
                </p>
                <p className="text-xs text-orange-600">
                  La tasa de escalación ({formatPercentage(metrics.escalationRate)}) está por encima del umbral recomendado (15%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.averageResolutionTime <= 24 && metrics.customerSatisfaction >= 4.0 && metrics.escalationRate <= 15 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Servicio de soporte funcionando correctamente
                </p>
                <p className="text-xs text-green-600">
                  Todas las métricas de soporte están dentro de los rangos objetivos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportMetrics;
