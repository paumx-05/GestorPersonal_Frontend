'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/admin';
import { validateUserStats, type UserStats } from '@/schemas/admin';
import MetricCard from './MetricCard';

const UserMetrics = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas detalladas
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 [UserMetrics] Cargando estadísticas de usuarios...');
        const response = await adminService.getUserStats();
        
        if (response.success && response.data) {
          try {
            const validatedStats = validateUserStats(response.data);
            setStats(validatedStats);
            console.log('✅ [UserMetrics] Estadísticas validadas y cargadas');
          } catch (validationError) {
            console.error('❌ [UserMetrics] Error validando datos:', validationError);
            setError('Error en formato de datos del servidor');
          }
        } else {
          console.log('⚠️ [UserMetrics] Sin datos del servidor, usando fallback');
          setError(response.message || 'Error cargando estadísticas');
        }
      } catch (error) {
        console.error('💥 [UserMetrics] Error cargando estadísticas:', error);
        setError('Error de conexión con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserStats();
  }, []);


  // Calcular porcentajes
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

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Métricas Detalladas de Usuarios</h2>
        <p className="text-gray-600">Estadísticas completas del sistema de usuarios</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Usuarios"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
        />
        
        <MetricCard
          title="Usuarios Activos"
          value={stats.usersByStatus.active}
          icon="✅"
          color="green"
          subtitle={`${calculatePercentage(stats.usersByStatus.active, stats.totalUsers)}% del total`}
        />
        
        <MetricCard
          title="Usuarios Verificados"
          value={stats.usersByVerification.verified}
          icon="🔒"
          color="purple"
          subtitle={`${calculatePercentage(stats.usersByVerification.verified, stats.totalUsers)}% del total`}
        />
        
        <MetricCard
          title="Usuarios Inactivos"
          value={stats.usersByStatus.inactive}
          icon="⏸️"
          color="orange"
          subtitle={`${calculatePercentage(stats.usersByStatus.inactive, stats.totalUsers)}% del total`}
        />
      </div>

      {/* Distribución por género */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Género
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.usersByGender.male}
            </div>
            <div className="text-sm text-gray-600">Masculino</div>
            <div className="text-xs text-gray-500">
              {calculatePercentage(stats.usersByGender.male, stats.totalUsers)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">
              {stats.usersByGender.female}
            </div>
            <div className="text-sm text-gray-600">Femenino</div>
            <div className="text-xs text-gray-500">
              {calculatePercentage(stats.usersByGender.female, stats.totalUsers)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats.usersByGender.other}
            </div>
            <div className="text-sm text-gray-600">Otro</div>
            <div className="text-xs text-gray-500">
              {calculatePercentage(stats.usersByGender.other, stats.totalUsers)}%
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por edad */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Edad
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.usersByAgeGroup).map(([ageGroup, count]) => (
            <div key={ageGroup} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {ageGroup} años
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${calculatePercentage(count, stats.totalUsers)}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count} ({calculatePercentage(count, stats.totalUsers)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de verificación */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estado de Verificación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.usersByVerification.verified}
            </div>
            <div className="text-sm text-gray-600">Usuarios Verificados</div>
            <div className="text-xs text-gray-500">
              {calculatePercentage(stats.usersByVerification.verified, stats.totalUsers)}% del total
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {stats.usersByVerification.unverified}
            </div>
            <div className="text-sm text-gray-600">Usuarios Sin Verificar</div>
            <div className="text-xs text-gray-500">
              {calculatePercentage(stats.usersByVerification.unverified, stats.totalUsers)}% del total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMetrics;
