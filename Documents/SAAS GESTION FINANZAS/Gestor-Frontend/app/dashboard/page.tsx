'use client'

// Página de Dashboard
// Página principal después del login exitoso
// Muestra resumen financiero del mes actual y métricas clave

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuth, getUsuarioActual } from '@/lib/auth'
import { getGastos, getTotalGastos, getResumenPorCategorias, type Gasto } from '@/lib/gastos'
import { getIngresos, getTotalIngresos, type Ingreso } from '@/lib/ingresos'
import { getPresupuestos, getTotalPresupuestos, getPresupuestoPorCategoria } from '@/lib/presupuestos'
import { getResumenMensual } from '@/lib/distribucion'
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

// Función para obtener el mes anterior
function getMesAnterior(): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  const mesActual = new Date().getMonth()
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
  return meses[mesAnterior]
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

// Función para calcular porcentaje de cambio
function calcularPorcentajeCambio(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0
  return ((actual - anterior) / anterior) * 100
}

interface Alerta {
  tipo: 'warning' | 'error' | 'info'
  mensaje: string
  link?: string
  linkText?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const mesActual = getMesActual()
  const nombreMesActual = getNombreMesActual()
  const mesAnterior = getMesAnterior()
  const nombreMesAnterior = getNombreMesAnterior()

  // Estados
  const [resumenActual, setResumenActual] = useState<any>(null)
  const [resumenAnterior, setResumenAnterior] = useState<any>(null)
  const [gastosRecientes, setGastosRecientes] = useState<Gasto[]>([])
  const [gastosPorCategoria, setGastosPorCategoria] = useState<Array<{ categoria: string; monto: number; porcentaje: number }>>([])
  const [presupuestos, setPresupuestos] = useState<any[]>([])
  const [totalPresupuesto, setTotalPresupuesto] = useState(0)
  const [alertas, setAlertas] = useState<Alerta[]>([])

  // Verificar autenticación al cargar
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadDashboardData()
  }, [router])

  // Función para cargar todos los datos del dashboard
  const loadDashboardData = () => {
    const usuarioActual = getUsuarioActual()
    if (!usuarioActual) return
    
    // Resumen del mes actual
    const resumenActualData = getResumenMensual(mesActual, usuarioActual.id)
    setResumenActual(resumenActualData)

    // Resumen del mes anterior
    const resumenAnteriorData = getResumenMensual(mesAnterior, usuarioActual.id)
    setResumenAnterior(resumenAnteriorData)

    // Gastos recientes (últimos 5 ordenados por fecha descendente)
    const gastos = getGastos(mesActual, usuarioActual.id)
    const gastosOrdenados = [...gastos].sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime()
      const fechaB = new Date(b.fecha).getTime()
      return fechaB - fechaA // Más recientes primero
    })
    setGastosRecientes(gastosOrdenados.slice(0, 7))

    // Gastos por categorías para el pie chart (todas las categorías con gastos)
    const resumenCategorias = getResumenPorCategorias(mesActual, usuarioActual.id)
    const totalGastos = resumenActualData.totalGastos
    
    // Convertir el resumen en array, filtrar solo categorías con gastos > 0, y ordenar por monto descendente
    const categoriasArray = Object.entries(resumenCategorias)
      .map(([categoria, monto]) => ({
        categoria,
        monto: monto as number,
        porcentaje: totalGastos > 0 ? ((monto as number) / totalGastos) * 100 : 0
      }))
      .filter(item => item.monto > 0) // Solo categorías con gastos
      .sort((a, b) => b.monto - a.monto) // Ordenar por monto descendente
      // No limitar a top 3, mostrar todas las categorías con gastos
    
    setGastosPorCategoria(categoriasArray)

    // Presupuestos
    const presupuestosData = getPresupuestos(mesActual, usuarioActual.id)
    setPresupuestos(presupuestosData)
    const totalPresupuestoData = getTotalPresupuestos(mesActual, usuarioActual.id)
    setTotalPresupuesto(totalPresupuestoData)

    // Generar alertas
    generarAlertas(resumenActualData, presupuestosData, gastos)
  }

  // Función para generar alertas financieras
  const generarAlertas = (resumen: any, presupuestos: any[], gastos: Gasto[]) => {
    const nuevasAlertas: Alerta[] = []
    const categoriasProcesadas = new Set<string>()

    // Alerta: Sin ingresos registrados
    if (resumen.totalIngresos === 0) {
      nuevasAlertas.push({
        tipo: 'info',
        mensaje: 'No has registrado ingresos este mes',
        link: `/dashboard/ingresos/${mesActual}`,
        linkText: 'Registrar ingresos'
      })
    }

    // Alerta: Presupuesto no configurado
    if (presupuestos.length === 0 && resumen.totalIngresos > 0) {
      nuevasAlertas.push({
        tipo: 'info',
        mensaje: 'No has configurado presupuestos para este mes',
        link: '/dashboard/distribucion',
        linkText: 'Configurar presupuestos'
      })
    }

    // Alertas: Categorías con presupuesto excedido o cerca del límite
    presupuestos.forEach(presupuesto => {
      if (categoriasProcesadas.has(presupuesto.categoria)) return
      
      const gastosCategoria = gastos
        .filter(g => g.categoria === presupuesto.categoria)
        .reduce((sum, g) => sum + g.monto, 0)
      
      categoriasProcesadas.add(presupuesto.categoria)
      
      if (gastosCategoria > presupuesto.monto) {
        nuevasAlertas.push({
          tipo: 'error',
          mensaje: `Presupuesto excedido en ${presupuesto.categoria}`,
          link: `/dashboard/gastos/${mesActual}`,
          linkText: 'Ver gastos'
        })
      } else if (gastosCategoria >= presupuesto.monto * 0.8) {
        nuevasAlertas.push({
          tipo: 'warning',
          mensaje: `Cerca del límite en ${presupuesto.categoria} (${((gastosCategoria / presupuesto.monto) * 100).toFixed(0)}%)`,
          link: `/dashboard/gastos/${mesActual}`,
          linkText: 'Ver gastos'
        })
      }
    })

    // Alerta: Balance negativo
    if (resumen.balance < 0) {
      nuevasAlertas.push({
        tipo: 'error',
        mensaje: 'Tus gastos superan tus ingresos este mes',
        link: `/dashboard/gastos/${mesActual}`,
        linkText: 'Revisar gastos'
      })
    }

    setAlertas(nuevasAlertas)
  }

  // Calcular porcentajes de cambio
  const cambioIngresos = resumenAnterior 
    ? calcularPorcentajeCambio(resumenActual?.totalIngresos || 0, resumenAnterior.totalIngresos)
    : 0
  const cambioGastos = resumenAnterior
    ? calcularPorcentajeCambio(resumenActual?.totalGastos || 0, resumenAnterior.totalGastos)
    : 0
  const cambioBalance = resumenAnterior
    ? calcularPorcentajeCambio(resumenActual?.balance || 0, resumenAnterior.balance)
    : 0

  // Preparar datos para el pie chart
  const COLORS = [
    '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]
  
  const pieChartData = gastosPorCategoria.map((item, index) => ({
    categoria: item.categoria,
    monto: item.monto,
    porcentaje: item.porcentaje,
    color: COLORS[index % COLORS.length]
  }))

  const totalGastosChart = resumenActual?.totalGastos || 0

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
            {gastosPorCategoria.length > 0 ? (
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
                    key={gasto.id} 
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
                <h3 className="metric-value">{formatCurrency(resumenActual?.totalIngresos || 0)}</h3>
              </div>
            </div>

            <div className="dashboard-metric-card">
              <div className="metric-icon metric-icon-expense">💸</div>
              <div className="metric-content">
                <p className="metric-label">Gastos</p>
                <h3 className="metric-value">{formatCurrency(resumenActual?.totalGastos || 0)}</h3>
              </div>
            </div>

            <div className="dashboard-metric-card">
              <div className={`metric-icon ${(resumenActual?.balance || 0) >= 0 ? 'metric-icon-positive' : 'metric-icon-negative'}`}>
                {(resumenActual?.balance || 0) >= 0 ? '📈' : '📉'}
              </div>
              <div className="metric-content">
                <p className="metric-label">Balance</p>
                <h3 className={`metric-value ${(resumenActual?.balance || 0) >= 0 ? 'metric-positive' : 'metric-negative'}`}>
                  {formatCurrency(resumenActual?.balance || 0)}
                </h3>
              </div>
            </div>

            <div className="dashboard-metric-card">
              <div className="metric-icon metric-icon-percentage">📊</div>
              <div className="metric-content">
                <p className="metric-label">% Gastado</p>
                <h3 className="metric-value">
                  {resumenActual?.totalIngresos > 0 
                    ? `${resumenActual.porcentajeGastos.toFixed(1)}%`
                    : '0%'}
                </h3>
                {totalPresupuesto > 0 && (
                  <p className="metric-hint">
                    Presupuesto: {formatCurrency(totalPresupuesto)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comparativa Mes Anterior */}
        {resumenAnterior && (resumenAnterior.totalIngresos > 0 || resumenAnterior.totalGastos > 0) && (
          <div className="dashboard-comparison-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Comparativa: {nombreMesAnterior} vs {nombreMesActual}</h2>
            </div>
            <div className="comparison-grid">
              <div className="comparison-item">
                <p className="comparison-label">Ingresos</p>
                <div className="comparison-values">
                  <span className="comparison-value">
                    {formatCurrency(resumenActual?.totalIngresos || 0)}
                  </span>
                  <span className={`comparison-change ${cambioIngresos >= 0 ? 'positive' : 'negative'}`}>
                    {cambioIngresos >= 0 ? '↑' : '↓'} {Math.abs(cambioIngresos).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="comparison-item">
                <p className="comparison-label">Gastos</p>
                <div className="comparison-values">
                  <span className="comparison-value">
                    {formatCurrency(resumenActual?.totalGastos || 0)}
                  </span>
                  <span className={`comparison-change ${cambioGastos >= 0 ? 'negative' : 'positive'}`}>
                    {cambioGastos >= 0 ? '↑' : '↓'} {Math.abs(cambioGastos).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="comparison-item">
                <p className="comparison-label">Balance</p>
                <div className="comparison-values">
                  <span className="comparison-value">
                    {formatCurrency(resumenActual?.balance || 0)}
                  </span>
                  <span className={`comparison-change ${cambioBalance >= 0 ? 'positive' : 'negative'}`}>
                    {cambioBalance >= 0 ? '↑' : '↓'} {Math.abs(cambioBalance).toFixed(1)}%
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
                <div key={index} className={`alert-item alert-${alerta.tipo}`}>
                  <div className="alert-icon">
                    {alerta.tipo === 'error' && '🔴'}
                    {alerta.tipo === 'warning' && '⚠️'}
                    {alerta.tipo === 'info' && 'ℹ️'}
                  </div>
                  <div className="alert-content">
                    <p className="alert-message">{alerta.mensaje}</p>
                    {alerta.link && (
                      <Link href={alerta.link} className="alert-link">
                        {alerta.linkText || 'Ver más'}
                      </Link>
                    )}
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
