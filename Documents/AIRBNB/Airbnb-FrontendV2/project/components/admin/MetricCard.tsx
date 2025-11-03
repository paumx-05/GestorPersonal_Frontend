'use client';

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: number;
  subtitle?: string;
}

const MetricCard = ({ title, value, icon, color, trend, subtitle }: MetricCardProps) => {
  // Colores para cada tipo de métrica
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      iconBg: 'bg-red-100'
    }
  };

  const currentColor = colorClasses[color];

  // Formatear el valor con separadores de miles
  const formatValue = (val: number): string => {
    return val.toLocaleString('es-ES');
  };

  // Determinar el color de la tendencia
  const getTrendColor = (trendValue?: number): string => {
    if (!trendValue) return 'text-gray-500';
    return trendValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Determinar el ícono de la tendencia
  const getTrendIcon = (trendValue?: number): string => {
    if (!trendValue) return '';
    return trendValue >= 0 ? '↗️' : '↘️';
  };

  return (
    <div className={`${currentColor.bg} ${currentColor.border} border rounded-lg p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        {/* Contenido principal */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          
          <p className={`text-3xl font-bold ${currentColor.text} mb-2`}>
            {formatValue(value)}
          </p>
          
          {/* Subtítulo o tendencia */}
          {subtitle ? (
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          ) : trend !== undefined ? (
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
                {getTrendIcon(trend)} {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs mes anterior</span>
            </div>
          ) : null}
        </div>

        {/* Ícono */}
        <div className={`${currentColor.iconBg} rounded-full p-3`}>
          <span className="text-2xl">
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
