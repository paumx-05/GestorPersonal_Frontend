'use client';

import { useState, useEffect } from 'react';
import { propertyService } from '@/lib/api/properties';
import MetricCard from './MetricCard';

interface PropertyMetrics {
  totalProperties: number;
  activeProperties: number;
  inactiveProperties: number;
  propertiesByType: {
    apartment: number;
    house: number;
    villa: number;
    studio: number;
  };
  propertiesByLocation: {
    madrid: number;
    barcelona: number;
    valencia: number;
    sevilla: number;
    other: number;
  };
  averagePrice: number;
  totalRevenue: number;
}

const PropertyMetrics = () => {
  const [metrics, setMetrics] = useState<PropertyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de propiedades
  useEffect(() => {
    const loadPropertyMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener todas las propiedades
        const properties = await propertyService.getAllProperties();
        
        if (properties && properties.length > 0) {
          // Calcular métricas basadas en las propiedades
          const calculatedMetrics = calculateMetrics(properties);
          setMetrics(calculatedMetrics);
        } else {
          // Datos de ejemplo si no hay propiedades
          setMetrics(generateMockPropertyMetrics());
        }
      } catch (error) {
        console.error('Error cargando métricas de propiedades:', error);
        setError('Error cargando métricas de propiedades');
        setMetrics(generateMockPropertyMetrics());
      } finally {
        setIsLoading(false);
      }
    };

    loadPropertyMetrics();
  }, []);

  // Calcular métricas basadas en las propiedades reales
  const calculateMetrics = (properties: any[]): PropertyMetrics => {
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.isActive !== false).length;
    const inactiveProperties = totalProperties - activeProperties;
    
    // Agrupar por tipo
    const propertiesByType = {
      apartment: properties.filter(p => p.type === 'apartment').length,
      house: properties.filter(p => p.type === 'house').length,
      villa: properties.filter(p => p.type === 'villa').length,
      studio: properties.filter(p => p.type === 'studio').length,
    };
    
    // Agrupar por ubicación
    const propertiesByLocation = {
      madrid: properties.filter(p => p.location?.toLowerCase().includes('madrid')).length,
      barcelona: properties.filter(p => p.location?.toLowerCase().includes('barcelona')).length,
      valencia: properties.filter(p => p.location?.toLowerCase().includes('valencia')).length,
      sevilla: properties.filter(p => p.location?.toLowerCase().includes('sevilla')).length,
      other: 0,
    };
    
    propertiesByLocation.other = totalProperties - 
      propertiesByLocation.madrid - 
      propertiesByLocation.barcelona - 
      propertiesByLocation.valencia - 
      propertiesByLocation.sevilla;
    
    // Calcular precio promedio
    const prices = properties.map(p => p.price || 0).filter(p => p > 0);
    const averagePrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
    
    // Calcular ingresos totales (simulado)
    const totalRevenue = totalProperties * averagePrice * 0.8; // 80% de ocupación promedio
    
    return {
      totalProperties,
      activeProperties,
      inactiveProperties,
      propertiesByType,
      propertiesByLocation,
      averagePrice,
      totalRevenue
    };
  };

  // Generar métricas de ejemplo
  const generateMockPropertyMetrics = (): PropertyMetrics => {
    return {
      totalProperties: 450,
      activeProperties: 420,
      inactiveProperties: 30,
      propertiesByType: {
        apartment: 200,
        house: 150,
        villa: 80,
        studio: 20
      },
      propertiesByLocation: {
        madrid: 120,
        barcelona: 100,
        valencia: 80,
        sevilla: 60,
        other: 90
      },
      averagePrice: 85.50,
      totalRevenue: 153000
    };
  };

  // Formatear precio
  const formatPrice = (price: number): string => {
    return `€${price.toFixed(2)}`;
  };

  // Formatear ingresos
  const formatRevenue = (revenue: number): string => {
    return `€${revenue.toLocaleString('es-ES')}`;
  };

  // Calcular porcentaje
  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Propiedades</h2>
        <p className="text-gray-600">Estadísticas de propiedades y ingresos</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Propiedades"
          value={metrics.totalProperties}
          icon="🏠"
          color="blue"
        />
        
        <MetricCard
          title="Propiedades Activas"
          value={metrics.activeProperties}
          icon="✅"
          color="green"
          subtitle={`${metrics.inactiveProperties} inactivas`}
        />
        
        <MetricCard
          title="Precio Promedio"
          value={formatPrice(metrics.averagePrice)}
          icon="💰"
          color="purple"
        />
        
        <MetricCard
          title="Ingresos Totales"
          value={formatRevenue(metrics.totalRevenue)}
          icon="📈"
          color="orange"
        />
      </div>

      {/* Distribución por tipo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Tipo de Propiedad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics.propertiesByType).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {count}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {type === 'apartment' ? 'Apartamento' : 
                 type === 'house' ? 'Casa' :
                 type === 'villa' ? 'Villa' : 'Estudio'}
              </div>
              <div className="text-xs text-gray-500">
                {calculatePercentage(count, metrics.totalProperties)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribución por ubicación */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Ubicación
        </h3>
        <div className="space-y-3">
          {Object.entries(metrics.propertiesByLocation).map(([location, count]) => (
            <div key={location} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {location === 'other' ? 'Otras ciudades' : location}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${calculatePercentage(count, metrics.totalProperties)}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count} ({calculatePercentage(count, metrics.totalProperties)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {calculatePercentage(metrics.activeProperties, metrics.totalProperties)}%
          </div>
          <div className="text-sm text-gray-600">Tasa de Actividad</div>
          <div className="text-xs text-gray-500">Propiedades activas</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(metrics.totalRevenue / metrics.totalProperties)}
          </div>
          <div className="text-sm text-gray-600">Ingresos por Propiedad</div>
          <div className="text-xs text-gray-500">Promedio mensual</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.round(metrics.totalRevenue / 30)}
          </div>
          <div className="text-sm text-gray-600">Ingresos Diarios</div>
          <div className="text-xs text-gray-500">Promedio estimado</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMetrics;
