'use client'

// Componente de gráfica circular (pie chart) para presupuestos
// Muestra la distribución de presupuestos por categorías

import { useState } from 'react'

interface PieChartProps {
  data: Array<{
    categoria: string
    monto: number
    porcentaje: number
    color: string
  }>
  total: number
  size?: number
}

export const COLORS = [
  '#3b82f6', // Azul
  '#22c55e', // Verde
  '#ef4444', // Rojo
  '#f59e0b', // Naranja
  '#8b5cf6', // Morado
  '#ec4899', // Rosa
  '#06b6d4', // Cyan
  '#84cc16', // Lima
  '#f97316', // Naranja oscuro
  '#6366f1', // Índigo
]

// Color especial para "Ahorro" (verde claro)
const COLOR_AHORRO = '#10b981'

export default function PieChart({ data, total, size = 300 }: PieChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2 - 20
  
  // Calcular los ángulos para cada segmento
  let currentAngle = -90 // Empezar desde arriba
  
  const segments = data.map((item, index) => {
    const percentage = item.porcentaje
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    
    // Convertir a radianes
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    
    // Calcular puntos para el arco
    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)
    
    // Determinar si el arco es grande (> 180 grados)
    const largeArcFlag = angle > 180 ? 1 : 0
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
    
    // Calcular posición del label (centro del segmento)
    const labelAngle = (startAngle + angle / 2) * Math.PI / 180
    const labelRadius = radius * 0.7
    const labelX = centerX + labelRadius * Math.cos(labelAngle)
    const labelY = centerY + labelRadius * Math.sin(labelAngle)
    
    currentAngle += angle
    
    // Usar color especial para "Ahorro", sino usar colores predefinidos
    const color = item.categoria === 'Ahorro' ? COLOR_AHORRO : COLORS[index % COLORS.length]
    
    return {
      ...item,
      pathData,
      labelX,
      labelY,
      color: color
    }
  })
  
  if (data.length === 0) {
    return (
      <div className="pie-chart-empty">
        <p>No hay presupuestos configurados</p>
        <p className="pie-chart-empty-subtitle">Agrega categorías para visualizar la distribución</p>
      </div>
    )
  }
  
  const handleMouseEnter = (index: number, event: React.MouseEvent<SVGPathElement>) => {
    setHoveredSegment(index)
    updateTooltipPosition(event)
  }

  const handleMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    if (hoveredSegment !== null) {
      updateTooltipPosition(event)
    }
  }

  const updateTooltipPosition = (event: React.MouseEvent<SVGPathElement>) => {
    const svg = event.currentTarget.closest('svg')
    if (svg) {
      const svgRect = svg.getBoundingClientRect()
      const x = event.clientX - svgRect.left
      const y = event.clientY - svgRect.top
      setTooltipPosition({ x, y })
    }
  }

  const handleMouseLeave = () => {
    setHoveredSegment(null)
  }

  return (
    <div className="pie-chart-container">
      <div className="pie-chart-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
        <svg width={size} height={size} className="pie-chart-svg">
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.pathData}
                fill={segment.color}
                stroke="#1e293b"
                strokeWidth="2"
                className="pie-segment"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              {segment.porcentaje > 5 && (
                <text
                  x={segment.labelX}
                  y={segment.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pie-label"
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="600"
                >
                  {segment.porcentaje.toFixed(0)}%
                </text>
              )}
            </g>
          ))}
        {/* Círculo central con total */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.4}
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="2"
        />
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pie-center-total"
          fill="#f8fafc"
          fontSize="18"
          fontWeight="700"
        >
          Total
        </text>
        <text
          x={centerX}
          y={centerY + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pie-center-amount"
          fill="#3b82f6"
          fontSize="14"
          fontWeight="600"
        >
          {new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
          }).format(total)}
        </text>
        </svg>
        
        {/* Tooltip */}
        {hoveredSegment !== null && (
          <div
            className="pie-chart-tooltip"
            style={{
              position: 'absolute',
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-10px',
              pointerEvents: 'none',
              zIndex: 1000
            }}
          >
            <div className="pie-tooltip-content">
              <div className="pie-tooltip-categoria">
                {segments[hoveredSegment].categoria}
              </div>
              <div className="pie-tooltip-monto">
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(segments[hoveredSegment].monto)}
              </div>
              <div className="pie-tooltip-porcentaje">
                {segments[hoveredSegment].porcentaje.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

