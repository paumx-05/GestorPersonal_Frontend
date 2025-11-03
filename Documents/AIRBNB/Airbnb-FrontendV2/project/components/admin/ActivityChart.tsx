'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/admin';

interface ActivityData {
  hour: number;
  logins: number;
}

const ActivityChart = () => {
  const [data, setData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de actividad
  useEffect(() => {
    const loadActivityData = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getActivityMetrics();
        
        if (response.success && response.data) {
          setData(response.data.hourlyActivity || []);
        } else {
          // Datos de ejemplo si no hay respuesta del servidor
          setData(generateMockActivityData());
        }
      } catch (error) {
        console.error('Error cargando datos de actividad:', error);
        setData(generateMockActivityData());
      } finally {
        setIsLoading(false);
      }
    };

    loadActivityData();
  }, []);

  // Generar datos de ejemplo de actividad por hora
  const generateMockActivityData = (): ActivityData[] => {
    const data: ActivityData[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      // Simular patrones de actividad típicos
      let logins = 0;
      
      if (hour >= 6 && hour <= 9) {
        // Mañana: actividad moderada
        logins = Math.floor(Math.random() * 30) + 10;
      } else if (hour >= 10 && hour <= 17) {
        // Día: actividad alta
        logins = Math.floor(Math.random() * 50) + 20;
      } else if (hour >= 18 && hour <= 22) {
        // Tarde/noche: actividad muy alta
        logins = Math.floor(Math.random() * 60) + 30;
      } else {
        // Noche/madrugada: actividad baja
        logins = Math.floor(Math.random() * 10) + 1;
      }
      
      data.push({ hour, logins });
    }
    
    return data;
  };

  // Calcular el valor máximo para la escala
  const maxValue = Math.max(...data.map(item => item.logins));

  // Encontrar la hora más activa
  const mostActiveHour = data.reduce((max, item) => 
    item.logins > data[max].logins ? item.hour : max, 0
  );

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Información de la hora más activa */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-green-600">🕐</span>
          <div>
            <p className="text-sm font-medium text-green-800">
              Hora más activa: {mostActiveHour}:00
            </p>
            <p className="text-xs text-green-600">
              {data[mostActiveHour]?.logins || 0} logins en esta hora
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de actividad por hora */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">
          Actividad por Hora del Día
        </h3>
        
        <div className="space-y-1">
          {data.map((item) => {
            const height = (item.logins / maxValue) * 100;
            const isMostActive = item.hour === mostActiveHour;
            
            return (
              <div key={item.hour} className="flex items-center space-x-3">
                {/* Etiqueta de hora */}
                <div className="w-12 text-xs text-gray-600 text-right">
                  {item.hour.toString().padStart(2, '0')}:00
                </div>
                
                {/* Barra de actividad */}
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
                  
                  {/* Valor */}
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
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {data.reduce((sum, item) => sum + item.logins, 0).toLocaleString('es-ES')}
          </p>
          <p className="text-xs text-gray-600">Total de logins</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(data.reduce((sum, item) => sum + item.logins, 0) / 24).toLocaleString('es-ES')}
          </p>
          <p className="text-xs text-gray-600">Promedio por hora</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
