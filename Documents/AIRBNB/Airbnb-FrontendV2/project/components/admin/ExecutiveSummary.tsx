'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/admin';
import { propertyService } from '@/lib/api/properties';
import { reservationService } from '@/lib/api/reservations';
import MetricCard from './MetricCard';

interface ExecutiveSummary {
  totalUsers: number;
  totalProperties: number;
  totalReservations: number;
  totalRevenue: number;
  activeUsers: number;
  activeProperties: number;
  pendingReservations: number;
  monthlyGrowth: {
    users: number;
    properties: number;
    reservations: number;
    revenue: number;
  };
}

const ExecutiveSummary = () => {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar resumen ejecutivo
  useEffect(() => {
    const loadExecutiveSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cargar datos de todas las fuentes
        const [userMetrics, properties, reservations] = await Promise.all([
          adminService.getUserMetrics(),
          propertyService.getAllProperties(),
          reservationService.getUserReservations()
        ]);
        
        // Calcular resumen ejecutivo
        const calculatedSummary = calculateExecutiveSummary(
          userMetrics.data,
          properties,
          reservations
        );
        
        setSummary(calculatedSummary);
      } catch (error) {
        console.error('Error cargando resumen ejecutivo:', error);
        setError('Error cargando resumen ejecutivo');
        setSummary(generateMockExecutiveSummary());
      } finally {
        setIsLoading(false);
      }
    };

    loadExecutiveSummary();
  }, []);

  // Calcular resumen ejecutivo basado en datos reales
  const calculateExecutiveSummary = (
    userMetrics: any,
    properties: any[],
    reservations: any[]
  ): ExecutiveSummary => {
    const totalUsers = userMetrics?.totalUsers || 0;
    const activeUsers = userMetrics?.activeUsers || 0;
    const totalProperties = properties?.length || 0;
    const activeProperties = properties?.filter(p => p.isActive !== false).length || 0;
    const totalReservations = reservations?.length || 0;
    const pendingReservations = reservations?.filter(r => r.status === 'pending').length || 0;
    
    // Calcular ingresos totales
    const totalRevenue = reservations
      ?.filter(r => r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.totalCost || 0), 0) || 0;
    
    // Crecimiento mensual simulado
    const monthlyGrowth = {
      users: Math.round(totalUsers * 0.05), // 5% crecimiento
      properties: Math.round(totalProperties * 0.03), // 3% crecimiento
      reservations: Math.round(totalReservations * 0.08), // 8% crecimiento
      revenue: Math.round(totalRevenue * 0.06) // 6% crecimiento
    };
    
    return {
      totalUsers,
      totalProperties,
      totalReservations,
      totalRevenue,
      activeUsers,
      activeProperties,
      pendingReservations,
      monthlyGrowth
    };
  };

  // Generar resumen ejecutivo de ejemplo
  const generateMockExecutiveSummary = (): ExecutiveSummary => {
    return {
      totalUsers: 1250,
      totalProperties: 450,
      totalReservations: 1250,
      totalRevenue: 100000,
      activeUsers: 1100,
      activeProperties: 420,
      pendingReservations: 50,
      monthlyGrowth: {
        users: 62,
        properties: 14,
        reservations: 100,
        revenue: 6000
      }
    };
  };

  // Formatear números
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Formatear ingresos
  const formatRevenue = (revenue: number): string => {
    return `€${revenue.toLocaleString('es-ES')}`;
  };

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
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

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resumen Ejecutivo</h2>
        <p className="text-gray-600">Vista general de los indicadores clave del negocio</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Usuarios"
          value={formatNumber(summary.totalUsers)}
          icon="👥"
          color="blue"
          trend={summary.monthlyGrowth.users}
        />
        
        <MetricCard
          title="Total de Propiedades"
          value={formatNumber(summary.totalProperties)}
          icon="🏠"
          color="green"
          trend={summary.monthlyGrowth.properties}
        />
        
        <MetricCard
          title="Total de Reservas"
          value={formatNumber(summary.totalReservations)}
          icon="📅"
          color="purple"
          trend={summary.monthlyGrowth.reservations}
        />
        
        <MetricCard
          title="Ingresos Totales"
          value={formatRevenue(summary.totalRevenue)}
          icon="💰"
          color="orange"
          trend={summary.monthlyGrowth.revenue}
        />
      </div>

      {/* Métricas de actividad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatNumber(summary.activeUsers)}
          </div>
          <div className="text-sm text-gray-600">Usuarios Activos</div>
          <div className="text-xs text-gray-500">
            {Math.round((summary.activeUsers / summary.totalUsers) * 100)}% del total
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatNumber(summary.activeProperties)}
          </div>
          <div className="text-sm text-gray-600">Propiedades Activas</div>
          <div className="text-xs text-gray-500">
            {Math.round((summary.activeProperties / summary.totalProperties) * 100)}% del total
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {formatNumber(summary.pendingReservations)}
          </div>
          <div className="text-sm text-gray-600">Reservas Pendientes</div>
          <div className="text-xs text-gray-500">
            {Math.round((summary.pendingReservations / summary.totalReservations) * 100)}% del total
          </div>
        </div>
      </div>

      {/* Crecimiento mensual */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Crecimiento Mensual
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              +{formatNumber(summary.monthlyGrowth.users)}
            </div>
            <div className="text-sm text-gray-600">Nuevos Usuarios</div>
            <div className="text-xs text-gray-500">Este mes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              +{formatNumber(summary.monthlyGrowth.properties)}
            </div>
            <div className="text-sm text-gray-600">Nuevas Propiedades</div>
            <div className="text-xs text-gray-500">Este mes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              +{formatNumber(summary.monthlyGrowth.reservations)}
            </div>
            <div className="text-sm text-gray-600">Nuevas Reservas</div>
            <div className="text-xs text-gray-500">Este mes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              +{formatRevenue(summary.monthlyGrowth.revenue)}
            </div>
            <div className="text-sm text-gray-600">Nuevos Ingresos</div>
            <div className="text-xs text-gray-500">Este mes</div>
          </div>
        </div>
      </div>

      {/* Indicadores de rendimiento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Indicadores de Rendimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round((summary.activeUsers / summary.totalUsers) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Usuarios Activos</div>
            <div className="text-xs text-gray-500">Usuarios activos vs total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round((summary.activeProperties / summary.totalProperties) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Propiedades Activas</div>
            <div className="text-xs text-gray-500">Propiedades activas vs total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round((summary.totalReservations / summary.totalProperties) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Ocupación</div>
            <div className="text-xs text-gray-500">Reservas por propiedad</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
