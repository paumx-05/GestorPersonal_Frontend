'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/admin';
import { validateActivityMetrics, type ActivityMetrics } from '@/schemas/admin';
import MetricCard from './MetricCard';

const ActivityMetrics = () => {
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de actividad
  useEffect(() => {
    const loadActivityMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 [ActivityMetrics] Cargando métricas de actividad...');
        const response = await adminService.getActivityMetrics();
        
        if (response.success && response.data) {
          try {
            const validatedMetrics = validateActivityMetrics(response.data);
            setMetrics(validatedMetrics);
            console.log('✅ [ActivityMetrics] Métricas validadas y cargadas');
          } catch (validationError) {
            console.error('❌ [ActivityMetrics] Error validando datos:', validationError);
            setError('Error en formato de datos del servidor');
          }
        } else {
          console.log('⚠️ [ActivityMetrics] Sin datos del servidor');
          setError(response.message || 'Error cargando métricas de actividad');
        }
      } catch (error) {
        console.error('💥 [ActivityMetrics] Error cargando métricas:', error);
        setError('Error de conexión con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivityMetrics();
  }, []);


  // Formatear duración en minutos
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Actividad</h2>
        <p className="text-gray-600">Estadísticas de uso y actividad de usuarios</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Logins Totales"
          value={metrics.totalLogins}
          icon="🔐"
          color="blue"
        />
        
        <MetricCard
          title="Logins Hoy"
          value={metrics.loginsToday}
          icon="📅"
          color="green"
          subtitle={`${metrics.loginsThisWeek} esta semana`}
        />
        
        <MetricCard
          title="Logins Este Mes"
          value={metrics.loginsThisMonth}
          icon="📊"
          color="purple"
        />
        
        <MetricCard
          title="Duración Promedio"
          value={formatDuration(metrics.averageSessionDuration)}
          icon="⏱️"
          color="orange"
        />
      </div>

      {/* Hora más activa */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Patrón de Actividad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {metrics.mostActiveHour}:00
            </div>
            <div className="text-sm text-gray-600">Hora Más Activa</div>
            <div className="text-xs text-gray-500">
              {metrics.hourlyActivity[metrics.mostActiveHour]?.logins || 0} logins en esta hora
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {Math.round(metrics.totalLogins / 30)}
            </div>
            <div className="text-sm text-gray-600">Promedio Diario</div>
            <div className="text-xs text-gray-500">Logins por día</div>
          </div>
        </div>
      </div>

      {/* Actividad por hora */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actividad por Hora del Día
        </h3>
        <div className="space-y-2">
          {metrics.hourlyActivity.map((item) => {
            const maxLogins = Math.max(...metrics.hourlyActivity.map(h => h.logins));
            const height = (item.logins / maxLogins) * 100;
            const isMostActive = item.hour === metrics.mostActiveHour;
            
            return (
              <div key={item.hour} className="flex items-center space-x-3">
                <div className="w-12 text-xs text-gray-600 text-right">
                  {item.hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 flex items-center">
                  <div
                    className={`rounded-sm transition-all duration-300 ${
                      isMostActive 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    style={{ 
                      width: `${height}%`,
                      height: '20px'
                    }}
                    title={`${item.hour}:00 - ${item.logins} logins`}
                  />
                  <span className="ml-2 text-xs text-gray-600 font-medium">
                    {item.logins}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(metrics.totalLogins / 7)}
          </div>
          <div className="text-sm text-gray-600">Promedio Semanal</div>
          <div className="text-xs text-gray-500">Logins por semana</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.round(metrics.totalLogins / 30)}
          </div>
          <div className="text-sm text-gray-600">Promedio Diario</div>
          <div className="text-xs text-gray-500">Logins por día</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.round(metrics.totalLogins / 24)}
          </div>
          <div className="text-sm text-gray-600">Promedio por Hora</div>
          <div className="text-xs text-gray-500">Logins por hora</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMetrics;
