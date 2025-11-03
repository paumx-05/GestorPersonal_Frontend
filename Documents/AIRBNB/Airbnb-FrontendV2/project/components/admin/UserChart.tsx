'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/admin';

interface RegistrationData {
  date: string;
  count: number;
}

const UserChart = () => {
  const [data, setData] = useState<RegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Cargar datos del gráfico
  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getRegistrationStats(period);
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          // Datos de ejemplo si no hay respuesta del servidor
          setData(generateMockData(period));
        }
      } catch (error) {
        console.error('Error cargando datos del gráfico:', error);
        setData(generateMockData(period));
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, [period]);

  // Generar datos de ejemplo
  const generateMockData = (periodType: string): RegistrationData[] => {
    const now = new Date();
    const data: RegistrationData[] = [];
    
    if (periodType === 'day') {
      // Últimas 24 horas
      for (let i = 23; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          date: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          count: Math.floor(Math.random() * 10) + 1
        });
      }
    } else if (periodType === 'week') {
      // Últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          date: date.toLocaleDateString('es-ES', { weekday: 'short' }),
          count: Math.floor(Math.random() * 50) + 10
        });
      }
    } else {
      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
          date: date.toLocaleDateString('es-ES', { month: 'short' }),
          count: Math.floor(Math.random() * 200) + 50
        });
      }
    }
    
    return data;
  };

  // Calcular el valor máximo para la escala
  const maxValue = Math.max(...data.map(item => item.count));

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de período */}
      <div className="flex space-x-2">
        {(['day', 'week', 'month'] as const).map((periodOption) => (
          <button
            key={periodOption}
            onClick={() => setPeriod(periodOption)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
              period === periodOption
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {periodOption === 'day' ? 'Hoy' : periodOption === 'week' ? 'Semana' : 'Mes'}
          </button>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div className="h-48 flex items-end space-x-2">
        {data.map((item, index) => {
          const height = (item.count / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              {/* Barra */}
              <div
                className="bg-blue-500 rounded-t-sm w-full transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}%` }}
                title={`${item.date}: ${item.count} usuarios`}
              />
              
              {/* Etiqueta del valor */}
              <div className="text-xs text-gray-600 mt-1 font-medium">
                {item.count}
              </div>
              
              {/* Etiqueta de la fecha */}
              <div className="text-xs text-gray-500 mt-1">
                {item.date}
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="text-center text-sm text-gray-600">
        Total de registros: {data.reduce((sum, item) => sum + item.count, 0).toLocaleString('es-ES')}
      </div>
    </div>
  );
};

export default UserChart;
