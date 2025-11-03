'use client';

import { useState, useEffect } from 'react';
import { reservationService } from '@/lib/api/reservations';
import MetricCard from './MetricCard';

interface ReservationMetrics {
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  reservationsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  reservationsByMonth: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  averageReservationValue: number;
  totalRevenue: number;
  occupancyRate: number;
}

const ReservationMetrics = () => {
  const [metrics, setMetrics] = useState<ReservationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de reservas
  useEffect(() => {
    const loadReservationMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener todas las reservas (simulado)
        const reservations = await reservationService.getUserReservations();
        
        if (reservations && reservations.length > 0) {
          // Calcular métricas basadas en las reservas
          const calculatedMetrics = calculateMetrics(reservations);
          setMetrics(calculatedMetrics);
        } else {
          // Datos de ejemplo si no hay reservas
          setMetrics(generateMockReservationMetrics());
        }
      } catch (error) {
        console.error('Error cargando métricas de reservas:', error);
        setError('Error cargando métricas de reservas');
        setMetrics(generateMockReservationMetrics());
      } finally {
        setIsLoading(false);
      }
    };

    loadReservationMetrics();
  }, []);

  // Calcular métricas basadas en las reservas reales
  const calculateMetrics = (reservations: any[]): ReservationMetrics => {
    const totalReservations = reservations.length;
    const activeReservations = reservations.filter(r => r.status === 'confirmed').length;
    const completedReservations = reservations.filter(r => r.status === 'completed').length;
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;
    
    // Agrupar por estado
    const reservationsByStatus = {
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: activeReservations,
      completed: completedReservations,
      cancelled: cancelledReservations
    };
    
    // Calcular ingresos
    const totalRevenue = reservations
      .filter(r => r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.totalCost || 0), 0);
    
    const averageReservationValue = totalReservations > 0 ? totalRevenue / totalReservations : 0;
    
    // Calcular tasa de ocupación (simulado)
    const occupancyRate = totalReservations > 0 ? (activeReservations / totalReservations) * 100 : 0;
    
    // Generar datos por mes (últimos 6 meses)
    const reservationsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const monthReservations = reservations.filter(r => {
        const resDate = new Date(r.createdAt || r.checkIn);
        return resDate.getMonth() === date.getMonth() && resDate.getFullYear() === date.getFullYear();
      });
      
      reservationsByMonth.push({
        month: monthName,
        count: monthReservations.length,
        revenue: monthReservations.reduce((sum, r) => sum + (r.totalCost || 0), 0)
      });
    }
    
    return {
      totalReservations,
      activeReservations,
      completedReservations,
      cancelledReservations,
      reservationsByStatus,
      reservationsByMonth,
      averageReservationValue,
      totalRevenue,
      occupancyRate
    };
  };

  // Generar métricas de ejemplo
  const generateMockReservationMetrics = (): ReservationMetrics => {
    return {
      totalReservations: 1250,
      activeReservations: 180,
      completedReservations: 950,
      cancelledReservations: 120,
      reservationsByStatus: {
        pending: 50,
        confirmed: 180,
        completed: 950,
        cancelled: 120
      },
      reservationsByMonth: [
        { month: 'Jul', count: 180, revenue: 14400 },
        { month: 'Ago', count: 220, revenue: 17600 },
        { month: 'Sep', count: 190, revenue: 15200 },
        { month: 'Oct', count: 210, revenue: 16800 },
        { month: 'Nov', count: 200, revenue: 16000 },
        { month: 'Dic', count: 250, revenue: 20000 }
      ],
      averageReservationValue: 85.50,
      totalRevenue: 100000,
      occupancyRate: 85.5
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Reservas</h2>
        <p className="text-gray-600">Estadísticas de reservas y ingresos</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reservas"
          value={metrics.totalReservations}
          icon="📅"
          color="blue"
        />
        
        <MetricCard
          title="Reservas Activas"
          value={metrics.activeReservations}
          icon="✅"
          color="green"
          subtitle={`${metrics.completedReservations} completadas`}
        />
        
        <MetricCard
          title="Valor Promedio"
          value={formatPrice(metrics.averageReservationValue)}
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

      {/* Distribución por estado */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Estado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics.reservationsByStatus).map(([status, count]) => {
            const statusLabels = {
              pending: 'Pendientes',
              confirmed: 'Confirmadas',
              completed: 'Completadas',
              cancelled: 'Canceladas'
            };
            
            const statusColors = {
              pending: 'text-yellow-600',
              confirmed: 'text-green-600',
              completed: 'text-blue-600',
              cancelled: 'text-red-600'
            };
            
            return (
              <div key={status} className="text-center">
                <div className={`text-3xl font-bold ${statusColors[status as keyof typeof statusColors]} mb-2`}>
                  {count}
                </div>
                <div className="text-sm text-gray-600">
                  {statusLabels[status as keyof typeof statusLabels]}
                </div>
                <div className="text-xs text-gray-500">
                  {calculatePercentage(count, metrics.totalReservations)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reservas por mes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reservas por Mes (Últimos 6 meses)
        </h3>
        <div className="space-y-3">
          {metrics.reservationsByMonth.map((month, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {month.month}
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600">
                  {month.count} reservas
                </div>
                <div className="text-sm text-gray-600">
                  {formatRevenue(month.revenue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {metrics.occupancyRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Tasa de Ocupación</div>
          <div className="text-xs text-gray-500">Promedio mensual</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(metrics.totalRevenue / 6)}
          </div>
          <div className="text-sm text-gray-600">Ingresos Promedio</div>
          <div className="text-xs text-gray-500">Por mes</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.round(metrics.totalReservations / 6)}
          </div>
          <div className="text-sm text-gray-600">Reservas Promedio</div>
          <div className="text-xs text-gray-500">Por mes</div>
        </div>
      </div>
    </div>
  );
};

export default ReservationMetrics;
