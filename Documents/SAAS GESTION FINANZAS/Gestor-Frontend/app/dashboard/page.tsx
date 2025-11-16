'use client'

// Página de Dashboard
// Página principal después del login exitoso
// Muestra resumen financiero del mes actual y métricas clave
// Integración completa con backend MongoDB - NO USAR MOCK

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuth } from '@/lib/auth'
import { dashboardService } from '@/services/dashboard.service'
import { gastosService } from '@/services/gastos.service'
import type {
  ResumenMesActual,
  GastoReciente,
  GastosPorCategoriaResponse,
  ComparativaMensual,
  AlertaFinanciera,
} from '@/models/dashboard'
import PieChart from '@/components/PieChart'

// Función para obtener el mes actual en formato para URL
function getMesActual(): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  const mesActual = new Date().getMonth()
  return meses[mesActual]
}

// Función para obtener el nombre del mes actual
function getNombreMesActual(): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const mesActual = new Date().getMonth()
  return meses[mesActual]
}

// Función para obtener el nombre del mes anterior
function getNombreMesAnterior(): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const mesActual = new Date().getMonth()
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
  return meses[mesAnterior]
}

// Función para formatear moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Función para obtener color según tipo de alerta
function getColorAlerta(tipo: AlertaFinanciera['tipo']): string {
  const colores = {
    info: '#3b82f6',      // Azul
    success: '#10b981',   // Verde
    warning: '#f59e0b',   // Amarillo/Naranja
    error: '#ef4444'      // Rojo
  }
  return colores[tipo]
}

// Función para obtener icono según tipo de alerta
function getIconoAlerta(tipo: AlertaFinanciera['tipo']): string {
  const iconos = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }
  return iconos[tipo]
}

export default function DashboardPage() {
  const router = useRouter()
  const mesActual = getMesActual()
  const nombreMesActual = getNombreMesActual()
  const nombreMesAnterior = getNombreMesAnterior()

  // Estados
  const [resumen, setResumen] = useState<ResumenMesActual | null>(null)
  const [gastosRecientes, setGastosRecientes] = useState<GastoReciente[]>([])
  const [gastosPorCategoria, setGastosPorCategoria] = useState<GastosPorCategoriaResponse | null>(null)
  const [comparativa, setComparativa] = useState<ComparativaMensual | null>(null)
  const [alertas, setAlertas] = useState<AlertaFinanciera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar autenticación al cargar
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadDashboardData()
  }, [router])

  // Función para calcular resumen por categorías desde todos los gastos
  const calcularGastosPorCategoria = async (mes: string): Promise<GastosPorCategoriaResponse> => {
    try {
      // Obtener todos los gastos del mes
      const { gastos, total } = await gastosService.getGastosByMes(mes)
      
      // Calcular resumen por categorías
      const resumenPorCategoria: { [categoria: string]: number } = {}
      
      gastos.forEach(gasto => {
        if (resumenPorCategoria[gasto.categoria]) {
          resumenPorCategoria[gasto.categoria] += gasto.monto
        } else {
          resumenPorCategoria[gasto.categoria] = gasto.monto
        }
      })
      
      // Convertir a array y calcular porcentajes
      const categoriasArray = Object.entries(resumenPorCategoria)
        .map(([categoria, monto]) => ({
          categoria,
          monto: monto as number,
          porcentaje: total > 0 ? ((monto as number) / total) * 100 : 0
        }))
        .filter(item => item.monto > 0) // Solo categorías con gastos
        .sort((a, b) => b.monto - a.monto) // Ordenar por monto descendente
      
      return {
        data: categoriasArray,
        total: total
      }
    } catch (error) {
      console.error('Error al calcular gastos por categoría:', error)
      return {
        data: [],
        total: 0
      }
    }
  }

  // Función para cargar todos los datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar todos los datos en paralelo para mejor rendimiento
      // Nota: Calculamos gastos por categoría desde todos los gastos para mostrar TODAS las categorías
      const [resumenData, gastosRecientesData, gastosPorCategoriaData, comparativaData, alertasData] = await Promise.all([
        dashboardService.getResumenMesActual(),
        dashboardService.getGastosRecientes(),
        calcularGastosPorCategoria(mesActual), // Usar función que calcula todas las categorías
        dashboardService.getComparativaMensual(),
        dashboardService.getAlertasFinancieras(),
      ])

      setResumen(resumenData)
      setGastosRecientes(gastosRecientesData)
      setGastosPorCategoria(gastosPorCategoriaData)
      setComparativa(comparativaData)
      setAlertas(alertasData)
    } catch (error: any) {
      console.error('Error al cargar datos del dashboard:', error)
      setError(error.error || error.message || 'Error al cargar el dashboard. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Preparar datos para el pie chart
  const COLORS = [
    '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]
  
  const pieChartData = gastosPorCategoria?.data.map((item, index) => ({
    categoria: item.categoria,
    monto: item.monto,
    porcentaje: item.porcentaje,
    color: COLORS[index % COLORS.length]
  })) || []

  const totalGastosChart = gastosPorCategoria?.total || 0

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-loading">
            <p>Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar estado de error
  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-error">
            <p>❌ {error}</p>
            <button onClick={loadDashboardData} className="btn btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard - {nombreMesActual}</h1>
            <p className="dashboard-subtitle">
              Resumen financiero del mes actual
            </p>
          </div>
        </div>

        {/* Grid principal con gráfico y métricas */}
        <div className="dashboard-main-grid">
          {/* Grid principal con gráfico y lista */}
          <div className="dashboard-content-grid">
            {/* Gráfico de Gastos por Categorías */}
            <div className="dashboard-chart-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Gastos por Categorías</h2>
                <Link href={`/dashboard/gastos/${mesActual}`} className="dashboard-card-link">
                  Ver todos →
                </Link>
              </div>
              {gastosPorCategoria && gastosPorCategoria.data.length > 0 ? (
                <div className="dashboard-chart-container">
                  <PieChart 
                    data={pieChartData} 
                    total={totalGastosChart}
                    size={280}
                  />
                </div>
              ) : (
                <div className="dashboard-empty-state">
                  <p>No hay gastos registrados este mes</p>
                  <Link href={`/dashboard/gastos/${mesActual}`} className="btn btn-primary">
                    Agregar primer gasto
                  </Link>
                </div>
              )}
            </div>

            {/* Lista de Gastos Recientes */}
            <div className="dashboard-recent-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Gastos Recientes</h2>
                <Link href={`/dashboard/gastos/${mesActual}`} className="dashboard-card-link">
                  Ver todos →
                </Link>
              </div>
              {gastosRecientes.length > 0 ? (
                <div className="dashboard-recent-list">
                  {gastosRecientes.map((gasto) => (
                    <Link 
                      key={gasto._id} 
                      href={`/dashboard/gastos/${mesActual}`}
                      className="recent-item"
                    >
                      <div className="recent-item-content">
                        <p className="recent-item-desc">{gasto.descripcion}</p>
                        <p className="recent-item-category">{gasto.categoria}</p>
                      </div>
                      <div className="recent-item-right">
                        <p className="recent-item-amount">{formatCurrency(gasto.monto)}</p>
                        <p className="recent-item-date">
                          {new Date(gasto.fecha).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty-state">
                  <p>No hay gastos recientes</p>
                  <Link href={`/dashboard/gastos/${mesActual}`} className="btn btn-primary">
                    Agregar gasto
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Tarjetas de Resumen del Mes Actual - Sidebar */}
          <div className="dashboard-metrics-sidebar">
            <div className="dashboard-metric-card">
              <div className="metric-icon metric-icon-income">💰</div>
              <div className="metric-content">
                <p className="metric-label">Ingresos</p>
                <h3 className="metric-value">{formatCurrency(resumen?.ingresos || 0)}</h3>
              </div>
            </div>

            <div className="dashboard-metric-card">
              <div className="metric-icon metric-icon-expense">💸</div>
              <div className="metric-content">
                <p className="metric-label">Gastos</p>
                <h3 className="metric-value">{formatCurrency(resumen?.gastos || 0)}</h3>
              </div>
            </div>

            <div className="dashboard-metric-card">
              <div className={`metric-icon ${(resumen?.balance || 0) >= 0 ? 'metric-icon-positive' : 'metric-icon-negative'}`}>
                {(resumen?.balance || 0) >= 0 ? '📈' : '📉'}
              </div>
              <div className="metric-content">
                <p className="metric-label">Balance</p>
                <h3 className={`metric-value ${(resumen?.balance || 0) >= 0 ? 'metric-positive' : 'metric-negative'}`}>
                  {formatCurrency(resumen?.balance || 0)}
                </h3>
              </div>
            </div>

            <div className="dashboard-metric-card">
              <div className="metric-icon metric-icon-percentage">📊</div>
              <div className="metric-content">
                <p className="metric-label">% Gastado</p>
                <h3 className="metric-value">
                  {resumen?.porcentajeGastado.toFixed(1) || '0.0'}%
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Comparativa Mes Anterior */}
        {comparativa && (comparativa.mesActual.ingresos > 0 || comparativa.mesActual.gastos > 0) && (
          <div className="dashboard-comparison-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Comparativa: {nombreMesAnterior} vs {nombreMesActual}</h2>
            </div>
            <div className="comparison-grid">
              <div className="comparison-item">
                <p className="comparison-label">Ingresos</p>
                <div className="comparison-values">
                  <span className="comparison-value">
                    {formatCurrency(comparativa.mesActual.ingresos)}
                  </span>
                  <span className={`comparison-change ${comparativa.cambios.ingresos.tipo === 'aumento' ? 'positive' : 'negative'}`}>
                    {comparativa.cambios.ingresos.tipo === 'aumento' ? '↑' : '↓'} {Math.abs(comparativa.cambios.ingresos.porcentaje).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="comparison-item">
                <p className="comparison-label">Gastos</p>
                <div className="comparison-values">
                  <span className="comparison-value">
                    {formatCurrency(comparativa.mesActual.gastos)}
                  </span>
                  <span className={`comparison-change ${comparativa.cambios.gastos.tipo === 'disminucion' ? 'positive' : 'negative'}`}>
                    {comparativa.cambios.gastos.tipo === 'aumento' ? '↑' : '↓'} {Math.abs(comparativa.cambios.gastos.porcentaje).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="comparison-item">
                <p className="comparison-label">Balance</p>
                <div className="comparison-values">
                  <span className="comparison-value">
                    {formatCurrency(comparativa.mesActual.balance)}
                  </span>
                  <span className={`comparison-change ${comparativa.cambios.balance.tipo === 'aumento' ? 'positive' : 'negative'}`}>
                    {comparativa.cambios.balance.tipo === 'aumento' ? '↑' : '↓'} {Math.abs(comparativa.cambios.balance.porcentaje).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panel de Alertas */}
        {alertas.length > 0 && (
          <div className="dashboard-alerts-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">⚠️ Alertas Financieras</h2>
            </div>
            <div className="alerts-list">
              {alertas.map((alerta, index) => (
                <div key={index} className={`alert-item alert-${alerta.tipo}`} style={{ borderLeftColor: getColorAlerta(alerta.tipo) }}>
                  <div className="alert-icon">
                    {getIconoAlerta(alerta.tipo)}
                  </div>
                  <div className="alert-content">
                    <p className="alert-title">{alerta.titulo}</p>
                    <p className="alert-message">{alerta.mensaje}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
