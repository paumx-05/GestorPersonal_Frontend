'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  averageTransactionValue: number;
  totalTransactions: number;
  pendingPayments: number;
  refundedAmount: number;
  revenueGrowth: number;
  transactionGrowth: number;
}

const FinancialMetrics = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas financieras
  useEffect(() => {
    const loadFinancialMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simular carga de métricas financieras
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar métricas de ejemplo
        const mockMetrics: FinancialMetrics = {
          totalRevenue: 1250000,
          monthlyRevenue: 125000,
          weeklyRevenue: 31250,
          dailyRevenue: 4464,
          averageTransactionValue: 85.50,
          totalTransactions: 14620,
          pendingPayments: 2450,
          refundedAmount: 12500,
          revenueGrowth: 12.5,
          transactionGrowth: 8.3
        };
        
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error cargando métricas financieras:', error);
        setError('Error cargando métricas financieras');
      } finally {
        setIsLoading(false);
      }
    };

    loadFinancialMetrics();
  }, []);

  // Formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Formatear números
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
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
        <h2 className="text-2xl font-bold text-gray-900">Métricas Financieras</h2>
        <p className="text-gray-600">Análisis de ingresos y transacciones</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(metrics.totalRevenue)}
          icon="💰"
          color="green"
          trend={metrics.revenueGrowth}
        />
        
        <MetricCard
          title="Ingresos Mensuales"
          value={formatCurrency(metrics.monthlyRevenue)}
          icon="📅"
          color="blue"
          subtitle={`${formatCurrency(metrics.weeklyRevenue)} esta semana`}
        />
        
        <MetricCard
          title="Valor Promedio"
          value={formatCurrency(metrics.averageTransactionValue)}
          icon="📊"
          color="purple"
        />
        
        <MetricCard
          title="Total Transacciones"
          value={formatNumber(metrics.totalTransactions)}
          icon="🔄"
          color="orange"
          trend={metrics.transactionGrowth}
        />
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos Diarios"
          value={formatCurrency(metrics.dailyRevenue)}
          icon="📈"
          color="green"
        />
        
        <MetricCard
          title="Pagos Pendientes"
          value={formatCurrency(metrics.pendingPayments)}
          icon="⏳"
          color="yellow"
        />
        
        <MetricCard
          title="Reembolsos"
          value={formatCurrency(metrics.refundedAmount)}
          icon="↩️"
          color="red"
        />
        
        <MetricCard
          title="Tasa de Reembolso"
          value={formatPercentage((metrics.refundedAmount / metrics.totalRevenue) * 100)}
          icon="📉"
          color="red"
        />
      </div>

      {/* Análisis de ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos por período */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ingresos por Período
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Diario</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(metrics.dailyRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Semanal</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(metrics.weeklyRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mensual</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(metrics.monthlyRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
              <span className="text-sm font-medium text-gray-900">Total</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(metrics.totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Análisis de transacciones */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Análisis de Transacciones
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Transacciones</span>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(metrics.totalTransactions)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor Promedio</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(metrics.averageTransactionValue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pagos Pendientes</span>
              <span className="text-sm font-medium text-yellow-600">
                {formatCurrency(metrics.pendingPayments)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
              <span className="text-sm font-medium text-gray-900">Tasa de Éxito</span>
              <span className="text-lg font-bold text-green-600">
                {Math.round(((metrics.totalTransactions - metrics.pendingPayments) / metrics.totalTransactions) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Crecimiento y tendencias */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Crecimiento y Tendencias
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatPercentage(metrics.revenueGrowth)}
            </div>
            <div className="text-sm text-gray-600">Crecimiento de Ingresos</div>
            <div className="text-xs text-gray-500">vs mes anterior</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPercentage(metrics.transactionGrowth)}
            </div>
            <div className="text-sm text-gray-600">Crecimiento de Transacciones</div>
            <div className="text-xs text-gray-500">vs mes anterior</div>
          </div>
        </div>
      </div>

      {/* Alertas financieras */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas Financieras
        </h3>
        <div className="space-y-3">
          {metrics.pendingPayments > 10000 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Pagos pendientes altos
                </p>
                <p className="text-xs text-yellow-600">
                  Hay {formatCurrency(metrics.pendingPayments)} en pagos pendientes que requieren atención
                </p>
              </div>
            </div>
          )}
          
          {metrics.refundedAmount > 5000 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600">🔄</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Reembolsos elevados
                </p>
                <p className="text-xs text-red-600">
                  Se han procesado {formatCurrency(metrics.refundedAmount)} en reembolsos este mes
                </p>
              </div>
            </div>
          )}
          
          {metrics.pendingPayments <= 10000 && metrics.refundedAmount <= 5000 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Situación financiera estable
                </p>
                <p className="text-xs text-green-600">
                  No se han detectado alertas financieras significativas
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialMetrics;
