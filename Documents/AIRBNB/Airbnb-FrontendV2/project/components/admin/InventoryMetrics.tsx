'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface InventoryMetrics {
  totalProperties: number;
  availableProperties: number;
  occupiedProperties: number;
  maintenanceProperties: number;
  averageOccupancyRate: number;
  revenuePerProperty: number;
  maintenanceCosts: number;
  propertyUtilization: number;
  topPerformingProperties: Array<{
    name: string;
    location: string;
    occupancyRate: number;
    revenue: number;
  }>;
}

const InventoryMetrics = () => {
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de inventario
  useEffect(() => {
    const loadInventoryMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de inventario
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: InventoryMetrics = {
          totalProperties: 450,
          availableProperties: 320,
          occupiedProperties: 100,
          maintenanceProperties: 30,
          averageOccupancyRate: 78.5,
          revenuePerProperty: 2500,
          maintenanceCosts: 45000,
          propertyUtilization: 85.2,
          topPerformingProperties: [
            { name: 'Apartamento Centro Madrid', location: 'Madrid', occupancyRate: 95.5, revenue: 4500 },
            { name: 'Casa Playa Barcelona', location: 'Barcelona', occupancyRate: 92.3, revenue: 4200 },
            { name: 'Villa Montaña Valencia', location: 'Valencia', occupancyRate: 89.7, revenue: 3800 },
            { name: 'Estudio Moderno Sevilla', location: 'Sevilla', occupancyRate: 87.2, revenue: 3500 },
            { name: 'Loft Industrial Bilbao', location: 'Bilbao', occupancyRate: 85.8, revenue: 3200 }
          ]
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de inventario:', error);
        setError('Error cargando métricas de inventario');
      } finally {
        setIsLoading(false);
      }
    };

    loadInventoryMetrics();
  }, []);

  // Formatear números
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Inventario</h2>
        <p className="text-gray-600">Análisis del rendimiento de propiedades</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Propiedades"
          value={formatNumber(metrics.totalProperties)}
          icon="🏠"
          color="blue"
        />
        
        <MetricCard
          title="Propiedades Disponibles"
          value={formatNumber(metrics.availableProperties)}
          icon="✅"
          color="green"
          subtitle={`${formatNumber(metrics.occupiedProperties)} ocupadas`}
        />
        
        <MetricCard
          title="Tasa de Ocupación"
          value={formatPercentage(metrics.averageOccupancyRate)}
          icon="📊"
          color="purple"
        />
        
        <MetricCard
          title="Ingresos por Propiedad"
          value={formatCurrency(metrics.revenuePerProperty)}
          icon="💰"
          color="orange"
        />
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Propiedades en Mantenimiento"
          value={formatNumber(metrics.maintenanceProperties)}
          icon="🔧"
          color="yellow"
        />
        
        <MetricCard
          title="Utilización de Propiedades"
          value={formatPercentage(metrics.propertyUtilization)}
          icon="📈"
          color="green"
        />
        
        <MetricCard
          title="Costos de Mantenimiento"
          value={formatCurrency(metrics.maintenanceCosts)}
          icon="💸"
          color="red"
        />
        
        <MetricCard
          title="ROI Promedio"
          value="15.2%"
          icon="📊"
          color="blue"
        />
      </div>

      {/* Estado del inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por estado */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Estado
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Disponibles</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(metrics.availableProperties / metrics.totalProperties) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.availableProperties)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ocupadas</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(metrics.occupiedProperties / metrics.totalProperties) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.occupiedProperties)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En Mantenimiento</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(metrics.maintenanceProperties / metrics.totalProperties) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatNumber(metrics.maintenanceProperties)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rendimiento por ubicación */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rendimiento por Ubicación
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Madrid</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">85%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Barcelona</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">78%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Valencia</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">72%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sevilla</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Propiedades con mejor rendimiento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Propiedades con Mejor Rendimiento
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propiedad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa de Ocupación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.topPerformingProperties.map((property, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {property.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {formatPercentage(property.occupancyRate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(property.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Métricas de eficiencia */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Eficiencia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatPercentage(metrics.averageOccupancyRate)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Ocupación Promedio</div>
            <div className="text-xs text-gray-500">Propiedades ocupadas vs total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPercentage(metrics.propertyUtilization)}
            </div>
            <div className="text-sm text-gray-600">Utilización de Propiedades</div>
            <div className="text-xs text-gray-500">Eficiencia del inventario</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(metrics.revenuePerProperty)}
            </div>
            <div className="text-sm text-gray-600">Ingresos por Propiedad</div>
            <div className="text-xs text-gray-500">Promedio mensual</div>
          </div>
        </div>
      </div>

      {/* Alertas de inventario */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Inventario
        </h3>
        <div className="space-y-3">
          {metrics.averageOccupancyRate < 70 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Tasa de ocupación baja
                </p>
                <p className="text-xs text-yellow-600">
                  La tasa de ocupación actual ({formatPercentage(metrics.averageOccupancyRate)}) está por debajo del objetivo (70%)
                </p>
              </div>
            </div>
          )}
          
          {metrics.maintenanceProperties > 50 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">🔧</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Muchas propiedades en mantenimiento
                </p>
                <p className="text-xs text-red-600">
                  Hay {formatNumber(metrics.maintenanceProperties)} propiedades en mantenimiento, lo que afecta la disponibilidad
                </p>
              </div>
            </div>
          )}
          
          {metrics.averageOccupancyRate >= 70 && metrics.maintenanceProperties <= 50 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Inventario funcionando correctamente
                </p>
                <p className="text-xs text-green-600">
                  Las métricas de inventario están dentro de los rangos objetivos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryMetrics;
