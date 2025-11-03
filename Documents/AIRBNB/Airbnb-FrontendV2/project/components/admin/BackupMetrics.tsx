'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface BackupMetrics {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  backupTypes: Array<{
    type: string;
    count: number;
    size: number;
    lastBackup: string;
  }>;
  storageUsage: {
    total: number;
    used: number;
    available: number;
  };
  backupSchedule: Array<{
    name: string;
    frequency: string;
    lastRun: string;
    nextRun: string;
    status: 'active' | 'inactive' | 'error';
  }>;
  recoveryMetrics: {
    totalRecoveries: number;
    successfulRecoveries: number;
    averageRecoveryTime: number;
    lastRecovery: string;
  };
}

const BackupMetrics = () => {
  const [metrics, setMetrics] = useState<BackupMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas de backup
  useEffect(() => {
    const loadBackupMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas de backup
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: BackupMetrics = {
          totalBackups: 1250,
          successfulBackups: 1180,
          failedBackups: 70,
          backupTypes: [
            { type: 'Base de Datos', count: 500, size: 2500000000, lastBackup: '2024-01-15T10:30:00Z' },
            { type: 'Archivos de Usuario', count: 400, size: 1500000000, lastBackup: '2024-01-15T09:15:00Z' },
            { type: 'Configuración del Sistema', count: 200, size: 500000000, lastBackup: '2024-01-15T08:45:00Z' },
            { type: 'Logs de Aplicación', count: 150, size: 300000000, lastBackup: '2024-01-15T07:30:00Z' }
          ],
          storageUsage: {
            total: 10000000000, // 10GB
            used: 4800000000,   // 4.8GB
            available: 5200000000 // 5.2GB
          },
          backupSchedule: [
            { name: 'Backup Diario', frequency: 'Diario', lastRun: '2024-01-15T02:00:00Z', nextRun: '2024-01-16T02:00:00Z', status: 'active' },
            { name: 'Backup Semanal', frequency: 'Semanal', lastRun: '2024-01-14T03:00:00Z', nextRun: '2024-01-21T03:00:00Z', status: 'active' },
            { name: 'Backup Mensual', frequency: 'Mensual', lastRun: '2024-01-01T04:00:00Z', nextRun: '2024-02-01T04:00:00Z', status: 'active' },
            { name: 'Backup de Configuración', frequency: 'Diario', lastRun: '2024-01-15T01:00:00Z', nextRun: '2024-01-16T01:00:00Z', status: 'inactive' }
          ],
          recoveryMetrics: {
            totalRecoveries: 25,
            successfulRecoveries: 23,
            averageRecoveryTime: 45.5,
            lastRecovery: '2024-01-10T14:30:00Z'
          }
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas de backup:', error);
        setError('Error cargando métricas de backup');
      } finally {
        setIsLoading(false);
      }
    };

    loadBackupMetrics();
  }, []);

  // Formatear números
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Formatear tamaño
  const formatSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Formatear tiempo
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes.toFixed(1)}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins.toFixed(1)}m`;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color según el estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'error': return 'red';
      default: return 'blue';
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas de Backup</h2>
        <p className="text-gray-600">Análisis del rendimiento de backups y recuperación</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Backups"
          value={formatNumber(metrics.totalBackups)}
          icon="💾"
          color="blue"
        />
        
        <MetricCard
          title="Backups Exitosos"
          value={formatNumber(metrics.successfulBackups)}
          icon="✅"
          color="green"
          subtitle={`${formatNumber(metrics.failedBackups)} fallidos`}
        />
        
        <MetricCard
          title="Tasa de Éxito"
          value={formatPercentage((metrics.successfulBackups / metrics.totalBackups) * 100)}
          icon="🎯"
          color="purple"
        />
        
        <MetricCard
          title="Almacenamiento Usado"
          value={formatSize(metrics.storageUsage.used)}
          icon="💿"
          color="orange"
          subtitle={`${formatSize(metrics.storageUsage.available)} disponible`}
        />
      </div>

      {/* Métricas de recuperación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Recuperaciones"
          value={formatNumber(metrics.recoveryMetrics.totalRecoveries)}
          icon="🔄"
          color="blue"
        />
        
        <MetricCard
          title="Recuperaciones Exitosas"
          value={formatNumber(metrics.recoveryMetrics.successfulRecoveries)}
          icon="✅"
          color="green"
        />
        
        <MetricCard
          title="Tiempo Promedio de Recuperación"
          value={formatTime(metrics.recoveryMetrics.averageRecoveryTime)}
          icon="⏱️"
          color="purple"
        />
        
        <MetricCard
          title="Última Recuperación"
          value={formatDate(metrics.recoveryMetrics.lastRecovery)}
          icon="📅"
          color="orange"
        />
      </div>

      {/* Tipos de backup */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tipos de Backup
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamaño Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Backup
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.backupTypes.map((backup, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {backup.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(backup.count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatSize(backup.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(backup.lastBackup)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Programación de backups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Programación de Backups
          </h3>
          <div className="space-y-3">
            {metrics.backupSchedule.map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    schedule.status === 'active' ? 'bg-green-500' :
                    schedule.status === 'inactive' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {schedule.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {schedule.frequency}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    Próximo: {formatDate(schedule.nextRun)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uso de Almacenamiento
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Almacenamiento Usado</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(metrics.storageUsage.used / metrics.storageUsage.total) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatSize(metrics.storageUsage.used)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Almacenamiento Disponible</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(metrics.storageUsage.available / metrics.storageUsage.total) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatSize(metrics.storageUsage.available)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Almacenamiento Total</span>
              <span className="text-sm font-medium text-gray-900">
                {formatSize(metrics.storageUsage.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Rendimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatPercentage((metrics.successfulBackups / metrics.totalBackups) * 100)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Éxito de Backup</div>
            <div className="text-xs text-gray-500">Backups exitosos vs total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPercentage((metrics.recoveryMetrics.successfulRecoveries / metrics.recoveryMetrics.totalRecoveries) * 100)}
            </div>
            <div className="text-sm text-gray-600">Tasa de Éxito de Recuperación</div>
            <div className="text-xs text-gray-500">Recuperaciones exitosas vs total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatPercentage((metrics.storageUsage.used / metrics.storageUsage.total) * 100)}
            </div>
            <div className="text-sm text-gray-600">Uso de Almacenamiento</div>
            <div className="text-xs text-gray-500">Almacenamiento usado vs total</div>
          </div>
        </div>
      </div>

      {/* Alertas de backup */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas de Backup
        </h3>
        <div className="space-y-3">
          {metrics.failedBackups > 50 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">❌</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Alto número de backups fallidos
                </p>
                <p className="text-xs text-red-600">
                  Se han detectado {formatNumber(metrics.failedBackups)} backups fallidos que requieren atención
                </p>
              </div>
            </div>
          )}
          
          {(metrics.storageUsage.used / metrics.storageUsage.total) > 0.8 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">💾</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Almacenamiento casi lleno
                </p>
                <p className="text-xs text-yellow-600">
                  El uso de almacenamiento ({formatPercentage((metrics.storageUsage.used / metrics.storageUsage.total) * 100)}) está por encima del 80%
                </p>
              </div>
            </div>
          )}
          
          {metrics.backupSchedule.some(s => s.status === 'inactive') && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-orange-600">⏸️</span>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Programaciones de backup inactivas
                </p>
                <p className="text-xs text-orange-600">
                  Hay programaciones de backup que están inactivas y requieren revisión
                </p>
              </div>
            </div>
          )}
          
          {metrics.failedBackups <= 50 && 
           (metrics.storageUsage.used / metrics.storageUsage.total) <= 0.8 && 
           metrics.backupSchedule.every(s => s.status === 'active') && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Sistema de backup funcionando correctamente
                </p>
                <p className="text-xs text-green-600">
                  Todas las métricas de backup están dentro de los rangos normales
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupMetrics;
