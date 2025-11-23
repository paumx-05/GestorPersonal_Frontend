'use client'

// Componente TransaccionesTable - Tabla para mostrar historial de transacciones
// Muestra todas las transacciones de una cartera con filtros

import { useState, useMemo } from 'react'
import type { TransaccionCartera } from '@/models/carteras'

interface TransaccionesTableProps {
  transacciones: TransaccionCartera[]
  moneda?: string
}

export default function TransaccionesTable({
  transacciones,
  moneda = 'EUR',
}: TransaccionesTableProps) {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'deposito':
        return '💰'
      case 'retiro':
        return '💸'
      case 'transferencia':
        return '🔄'
      case 'gasto':
        return '🛒'
      case 'ingreso':
        return '💵'
      case 'ajuste':
        return '⚖️'
      default:
        return '📝'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'deposito':
        return 'Depósito'
      case 'retiro':
        return 'Retiro'
      case 'transferencia':
        return 'Transferencia'
      case 'gasto':
        return 'Gasto'
      case 'ingreso':
        return 'Ingreso'
      case 'ajuste':
        return 'Ajuste'
      default:
        return tipo
    }
  }

  const getTipoClass = (tipo: string) => {
    switch (tipo) {
      case 'deposito':
      case 'ingreso':
        return 'tipo-positivo'
      case 'retiro':
      case 'gasto':
        return 'tipo-negativo'
      case 'transferencia':
        return 'tipo-neutral'
      default:
        return ''
    }
  }

  // Filtrar y buscar transacciones
  const transaccionesFiltradas = useMemo(() => {
    let resultado = [...transacciones]

    // Filtrar por tipo
    if (filtroTipo !== 'todos') {
      resultado = resultado.filter((t) => t.tipo === filtroTipo)
    }

    // Buscar en concepto
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase()
      resultado = resultado.filter((t) =>
        t.concepto.toLowerCase().includes(busquedaLower)
      )
    }

    // Ordenar por fecha descendente (más recientes primero)
    resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    return resultado
  }, [transacciones, filtroTipo, busqueda])

  // Calcular totales
  const totales = useMemo(() => {
    const ingresos = transaccionesFiltradas
      .filter((t) => ['deposito', 'ingreso'].includes(t.tipo))
      .reduce((sum, t) => sum + t.monto, 0)

    const egresos = transaccionesFiltradas
      .filter((t) => ['retiro', 'gasto'].includes(t.tipo))
      .reduce((sum, t) => sum + t.monto, 0)

    return { ingresos, egresos, neto: ingresos - egresos }
  }, [transaccionesFiltradas])

  return (
    <div className="transacciones-table-container">
      {/* Controles de filtro */}
      <div className="transacciones-filters">
        <div className="filter-group">
          <label htmlFor="filtroTipo">Tipo:</label>
          <select
            id="filtroTipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="deposito">Depósitos</option>
            <option value="retiro">Retiros</option>
            <option value="transferencia">Transferencias</option>
            <option value="gasto">Gastos</option>
            <option value="ingreso">Ingresos</option>
            <option value="ajuste">Ajustes</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="busqueda">Buscar:</label>
          <input
            type="text"
            id="busqueda"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por concepto..."
          />
        </div>
      </div>

      {/* Resumen de totales */}
      {transaccionesFiltradas.length > 0 && (
        <div className="transacciones-summary">
          <div className="summary-item positivo">
            <span className="summary-label">Ingresos:</span>
            <span className="summary-value">+{formatCurrency(totales.ingresos, moneda)}</span>
          </div>
          <div className="summary-item negativo">
            <span className="summary-label">Egresos:</span>
            <span className="summary-value">-{formatCurrency(totales.egresos, moneda)}</span>
          </div>
          <div className={`summary-item ${totales.neto >= 0 ? 'positivo' : 'negativo'}`}>
            <span className="summary-label">Neto:</span>
            <span className="summary-value">
              {totales.neto >= 0 ? '+' : ''}{formatCurrency(totales.neto, moneda)}
            </span>
          </div>
        </div>
      )}

      {/* Tabla de transacciones */}
      {transaccionesFiltradas.length === 0 ? (
        <div className="transacciones-empty">
          <p>No hay transacciones {filtroTipo !== 'todos' ? `de tipo "${getTipoLabel(filtroTipo)}"` : ''} {busqueda ? `que coincidan con "${busqueda}"` : ''}</p>
        </div>
      ) : (
        <div className="transacciones-table-wrapper">
          <table className="transacciones-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Concepto</th>
                <th className="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transaccionesFiltradas.map((transaccion) => (
                <tr key={transaccion._id}>
                  <td>
                    <span className="transaccion-fecha">
                      {formatDate(transaccion.fecha)}
                    </span>
                  </td>
                  <td>
                    <span className={`transaccion-tipo ${getTipoClass(transaccion.tipo)}`}>
                      {getTipoIcon(transaccion.tipo)} {getTipoLabel(transaccion.tipo)}
                    </span>
                  </td>
                  <td>
                    <span className="transaccion-concepto">{transaccion.concepto}</span>
                  </td>
                  <td className="text-right">
                    <span
                      className={`transaccion-monto ${
                        ['deposito', 'ingreso'].includes(transaccion.tipo)
                          ? 'positivo'
                          : ['retiro', 'gasto'].includes(transaccion.tipo)
                          ? 'negativo'
                          : ''
                      }`}
                    >
                      {['deposito', 'ingreso'].includes(transaccion.tipo) ? '+' : ''}
                      {['retiro', 'gasto'].includes(transaccion.tipo) ? '-' : ''}
                      {formatCurrency(transaccion.monto, moneda)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Información adicional */}
      <div className="transacciones-info">
        <p>
          Mostrando {transaccionesFiltradas.length} de {transacciones.length} transacciones
        </p>
      </div>
    </div>
  )
}

