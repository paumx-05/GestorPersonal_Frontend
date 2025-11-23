'use client'

// Componente CarterasOverview - Vista general consolidada de todas las carteras
// Muestra saldo total, distribución y estadísticas generales

import { useMemo } from 'react'
import type { Cartera } from '@/models/carteras'

interface CarterasOverviewProps {
  carteras: Cartera[]
}

export default function CarterasOverview({ carteras }: CarterasOverviewProps) {
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Calcular estadísticas consolidadas
  const estadisticas = useMemo(() => {
    const activas = carteras.filter((c) => c.activa)
    
    // Agrupar por moneda para cálculos precisos
    const porMoneda = activas.reduce((acc, cartera) => {
      if (!acc[cartera.moneda]) {
        acc[cartera.moneda] = {
          saldoTotal: 0,
          saldoInicialTotal: 0,
          count: 0,
        }
      }
      acc[cartera.moneda].saldoTotal += cartera.saldo
      acc[cartera.moneda].saldoInicialTotal += cartera.saldoInicial
      acc[cartera.moneda].count += 1
      return acc
    }, {} as Record<string, { saldoTotal: number; saldoInicialTotal: number; count: number }>)

    // Cartera con mayor saldo
    const carteraMayor = activas.reduce(
      (max, cartera) => (cartera.saldo > max.saldo ? cartera : max),
      activas[0] || { saldo: 0, nombre: 'N/A', moneda: 'EUR' }
    )

    // Calcular cambio total (solo para moneda principal)
    const monedaPrincipal = Object.keys(porMoneda)[0] || 'EUR'
    const cambioTotal = porMoneda[monedaPrincipal]
      ? porMoneda[monedaPrincipal].saldoTotal - porMoneda[monedaPrincipal].saldoInicialTotal
      : 0
    const porcentajeCambio = porMoneda[monedaPrincipal]?.saldoInicialTotal
      ? ((cambioTotal / porMoneda[monedaPrincipal].saldoInicialTotal) * 100).toFixed(1)
      : '0.0'

    return {
      totalCarteras: carteras.length,
      carterasActivas: activas.length,
      porMoneda,
      carteraMayor,
      cambioTotal,
      porcentajeCambio,
      monedaPrincipal,
    }
  }, [carteras])

  // Calcular distribución para gráfico simple
  const distribucion = useMemo(() => {
    const activas = carteras.filter((c) => c.activa && c.saldo > 0)
    const total = activas.reduce((sum, c) => sum + c.saldo, 0)
    
    return activas.map((cartera) => ({
      nombre: cartera.nombre,
      saldo: cartera.saldo,
      porcentaje: total > 0 ? ((cartera.saldo / total) * 100).toFixed(1) : '0',
      color: cartera.color || '#3b82f6',
    }))
  }, [carteras])

  if (carteras.length === 0) {
    return (
      <div className="carteras-overview-empty">
        <p>No hay carteras disponibles</p>
      </div>
    )
  }

  return (
    <div className="carteras-overview">
      {/* Saldo Total por Moneda */}
      <div className="overview-section">
        <h3 className="overview-title">Saldo Total Consolidado</h3>
        <div className="overview-saldos">
          {Object.entries(estadisticas.porMoneda).map(([moneda, datos]) => (
            <div key={moneda} className="overview-saldo-item">
              <div className="saldo-principal">
                <span className="saldo-moneda">{moneda}</span>
                <h2 className="saldo-valor">{formatCurrency(datos.saldoTotal, moneda)}</h2>
              </div>
              <div className="saldo-detalles">
                <span className="saldo-detalle">
                  Inicial: {formatCurrency(datos.saldoInicialTotal, moneda)}
                </span>
                {moneda === estadisticas.monedaPrincipal && (
                  <span className={`saldo-cambio ${estadisticas.cambioTotal >= 0 ? 'positivo' : 'negativo'}`}>
                    {estadisticas.cambioTotal >= 0 ? '+' : ''}
                    {formatCurrency(estadisticas.cambioTotal, moneda)} ({estadisticas.cambioTotal >= 0 ? '+' : ''}
                    {estadisticas.porcentajeCambio}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="overview-section">
        <h3 className="overview-title">Resumen General</h3>
        <div className="overview-stats-grid">
          <div className="overview-stat-card">
            <span className="stat-icon">💼</span>
            <div className="stat-info">
              <span className="stat-label">Total Carteras</span>
              <span className="stat-value">{estadisticas.totalCarteras}</span>
            </div>
          </div>

          <div className="overview-stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-label">Carteras Activas</span>
              <span className="stat-value">{estadisticas.carterasActivas}</span>
            </div>
          </div>

          <div className="overview-stat-card">
            <span className="stat-icon">🏆</span>
            <div className="stat-info">
              <span className="stat-label">Mayor Saldo</span>
              <span className="stat-value stat-value-small">
                {estadisticas.carteraMayor.nombre}
              </span>
              <span className="stat-subvalue">
                {formatCurrency(estadisticas.carteraMayor.saldo, estadisticas.carteraMayor.moneda)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución Simple */}
      {distribucion.length > 0 && (
        <div className="overview-section">
          <h3 className="overview-title">Distribución de Saldo</h3>
          <div className="overview-distribucion">
            {/* Barra de distribución */}
            <div className="distribucion-bar">
              {distribucion.map((item, index) => (
                <div
                  key={index}
                  className="distribucion-segment"
                  style={{
                    width: `${item.porcentaje}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.nombre}: ${item.porcentaje}%`}
                />
              ))}
            </div>

            {/* Leyenda */}
            <div className="distribucion-leyenda">
              {distribucion.map((item, index) => (
                <div key={index} className="leyenda-item">
                  <span
                    className="leyenda-color"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="leyenda-nombre">{item.nombre}</span>
                  <span className="leyenda-porcentaje">{item.porcentaje}%</span>
                  <span className="leyenda-valor">
                    {formatCurrency(item.saldo, estadisticas.monedaPrincipal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

