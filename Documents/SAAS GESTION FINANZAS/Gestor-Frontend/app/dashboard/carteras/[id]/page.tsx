'use client'

// Página de Detalle de Cartera
// Muestra información completa de una cartera y su historial de transacciones

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { carterasController } from '@/controllers/carteras.controller'
import { useCarteraContext } from '@/contexts/CarteraContext'
import TransaccionesTable from '@/components/TransaccionesTable'
import GestionSaldoModal from '@/components/GestionSaldoModal'
import type { Cartera, TransaccionCartera } from '@/models/carteras'

export default function CarteraDetallePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const { carteras, refreshCarteras } = useCarteraContext()

  const [cartera, setCartera] = useState<Cartera | null>(null)
  const [transacciones, setTransacciones] = useState<TransaccionCartera[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTransacciones, setLoadingTransacciones] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showGestionModal, setShowGestionModal] = useState(false)

  // Cargar cartera
  useEffect(() => {
    if (!id) return

    const loadCartera = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await carterasController.getCarteraById(id)
        if (result.success && result.cartera) {
          setCartera(result.cartera)
        } else {
          setError(result.error || 'Cartera no encontrada')
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar cartera')
      } finally {
        setLoading(false)
      }
    }

    loadCartera()
  }, [id])

  // Cargar transacciones
  useEffect(() => {
    if (!id) return

    const loadTransacciones = async () => {
      setLoadingTransacciones(true)

      try {
        const result = await carterasController.getTransacciones(id)
        if (result.success && result.transacciones) {
          setTransacciones(result.transacciones)
        }
      } catch (err: any) {
        console.error('Error al cargar transacciones:', err)
      } finally {
        setLoadingTransacciones(false)
      }
    }

    loadTransacciones()
  }, [id])

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
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  // Handlers de operaciones de saldo
  const handleDepositar = async (monto: number, concepto: string, fecha: string) => {
    if (!cartera) return

    const result = await carterasController.depositar(cartera._id, {
      monto,
      concepto,
      fecha,
    })

    if (result.success) {
      setSuccessMessage(`Depósito de ${monto} realizado exitosamente`)
      // Recargar cartera y transacciones
      const carteraResult = await carterasController.getCarteraById(cartera._id)
      if (carteraResult.success && carteraResult.cartera) {
        setCartera(carteraResult.cartera)
      }
      const transResult = await carterasController.getTransacciones(cartera._id)
      if (transResult.success && transResult.transacciones) {
        setTransacciones(transResult.transacciones)
      }
      await refreshCarteras()
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      throw new Error(result.error || 'Error al depositar')
    }
  }

  const handleRetirar = async (monto: number, concepto: string, fecha: string) => {
    if (!cartera) return

    const result = await carterasController.retirar(cartera._id, {
      monto,
      concepto,
      fecha,
    })

    if (result.success) {
      setSuccessMessage(`Retiro de ${monto} realizado exitosamente`)
      // Recargar cartera y transacciones
      const carteraResult = await carterasController.getCarteraById(cartera._id)
      if (carteraResult.success && carteraResult.cartera) {
        setCartera(carteraResult.cartera)
      }
      const transResult = await carterasController.getTransacciones(cartera._id)
      if (transResult.success && transResult.transacciones) {
        setTransacciones(transResult.transacciones)
      }
      await refreshCarteras()
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      throw new Error(result.error || 'Error al retirar')
    }
  }

  const handleTransferir = async (
    carteraDestinoId: string,
    monto: number,
    concepto: string,
    fecha: string
  ) => {
    if (!cartera) return

    const result = await carterasController.transferir({
      carteraOrigenId: cartera._id,
      carteraDestinoId,
      monto,
      concepto,
      fecha,
    })

    if (result.success) {
      setSuccessMessage(`Transferencia de ${monto} realizada exitosamente`)
      // Recargar cartera y transacciones
      const carteraResult = await carterasController.getCarteraById(cartera._id)
      if (carteraResult.success && carteraResult.cartera) {
        setCartera(carteraResult.cartera)
      }
      const transResult = await carterasController.getTransacciones(cartera._id)
      if (transResult.success && transResult.transacciones) {
        setTransacciones(transResult.transacciones)
      }
      await refreshCarteras()
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      throw new Error(result.error || 'Error al transferir')
    }
  }

  const handleSincronizar = async () => {
    if (!cartera) return

    setLoading(true)
    try {
      const result = await carterasController.sincronizar(cartera._id)
      if (result.success && result.cartera) {
        setCartera(result.cartera)
        setSuccessMessage('Saldo sincronizado exitosamente')
        await refreshCarteras()
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(result.error || 'Error al sincronizar')
      }
    } catch (err: any) {
      setError(err.message || 'Error al sincronizar')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando cartera...</p>
        </div>
      </div>
    )
  }

  if (error || !cartera) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>❌ Error</h2>
          <p>{error || 'Cartera no encontrada'}</p>
          <button className="btn btn-secondary" onClick={() => router.push('/dashboard/carteras')}>
            ← Volver a Carteras
          </button>
        </div>
      </div>
    )
  }

  // Calcular estadísticas
  const cambio = cartera.saldo - cartera.saldoInicial
  const porcentajeCambio =
    cartera.saldoInicial !== 0
      ? ((cambio / cartera.saldoInicial) * 100).toFixed(1)
      : '0.0'

  return (
    <div className="page-container cartera-detalle-container">
      {/* Header con breadcrumb */}
      <div className="page-breadcrumb">
        <button
          className="breadcrumb-link"
          onClick={() => router.push('/dashboard/carteras')}
        >
          ← Carteras
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{cartera.nombre}</span>
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="alert alert-success">
          ✅ {successMessage}
        </div>
      )}

      {/* Información de la cartera - DISEÑO MEJORADO */}
      <div className="cartera-detalle-header-v2">
        <div className="cartera-header-left">
          <div className="cartera-icono-wrapper" style={{ backgroundColor: cartera.color || '#3b82f6' }}>
            <span className="cartera-icono-hero">{cartera.icono || '💳'}</span>
          </div>
          <div className="cartera-info-wrapper">
            <div className="cartera-title-row">
              <h1 className="cartera-nombre-hero">{cartera.nombre}</h1>
              {!cartera.activa && (
                <span className="badge badge-inactive">Archivada</span>
              )}
            </div>
            {cartera.descripcion && (
              <p className="cartera-descripcion-hero">{cartera.descripcion}</p>
            )}
            <div className="cartera-meta-info">
              <span className="meta-item">
                <span className="meta-icon">💰</span>
                <span className="meta-text">Moneda: {cartera.moneda}</span>
              </span>
              <span className="meta-separator">•</span>
              <span className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-text">Creada: {formatDate(cartera.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="cartera-header-actions">
          <button
            className="btn-action btn-action-primary"
            onClick={() => setShowGestionModal(true)}
          >
            <span className="btn-icon">💰</span>
            <span className="btn-text">Gestionar Saldo</span>
          </button>
          <button
            className="btn-action btn-action-secondary"
            onClick={handleSincronizar}
            title="Sincronizar saldo con gastos e ingresos"
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Sincronizar</span>
          </button>
        </div>
      </div>

      {/* Estadísticas principales - DISEÑO MEJORADO */}
      <div className="cartera-stats-grid-v2">
        <div className="stat-card-v2 stat-card-principal-v2">
          <div className="stat-card-header">
            <span className="stat-icon-bg">
              <span className="stat-icon">💰</span>
            </span>
            <span className="stat-label-v2">Saldo Actual</span>
          </div>
          <div className="stat-card-body">
            <h2 className="stat-value-hero">
              {formatCurrency(cartera.saldo, cartera.moneda)}
            </h2>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="stat-card-header">
            <span className="stat-icon-bg stat-icon-neutral">
              <span className="stat-icon">🏦</span>
            </span>
            <span className="stat-label-v2">Saldo Inicial</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-value-v2">{formatCurrency(cartera.saldoInicial, cartera.moneda)}</span>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="stat-card-header">
            <span className={`stat-icon-bg ${cambio >= 0 ? 'stat-icon-positive' : 'stat-icon-negative'}`}>
              <span className="stat-icon">{cambio >= 0 ? '📈' : '📉'}</span>
            </span>
            <span className="stat-label-v2">Balance Total</span>
          </div>
          <div className="stat-card-body">
            <span className={`stat-value-v2 ${cambio >= 0 ? 'positivo' : 'negativo'}`}>
              {cambio >= 0 ? '+' : ''}
              {formatCurrency(cambio, cartera.moneda)}
            </span>
            <span className={`stat-badge ${cambio >= 0 ? 'badge-positive' : 'badge-negative'}`}>
              {cambio >= 0 ? '+' : ''}
              {porcentajeCambio}%
            </span>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="stat-card-header">
            <span className="stat-icon-bg stat-icon-info">
              <span className="stat-icon">📊</span>
            </span>
            <span className="stat-label-v2">Transacciones</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-value-v2">{transacciones.length}</span>
            <span className="stat-meta-v2">operaciones</span>
          </div>
        </div>
      </div>

      {/* Historial de transacciones - DISEÑO MEJORADO */}
      <div className="page-section-v2">
        <div className="section-header-v2">
          <div className="section-title-wrapper">
            <span className="section-icon">📝</span>
            <h2 className="section-title-v2">Historial de Transacciones</h2>
          </div>
          <span className="section-count">{transacciones.length} transacciones</span>
        </div>

        {loadingTransacciones ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando transacciones...</p>
          </div>
        ) : (
          <div className="transactions-wrapper">
            <TransaccionesTable transacciones={transacciones} moneda={cartera.moneda} />
          </div>
        )}
      </div>

      {/* Modal de gestión de saldo */}
      <GestionSaldoModal
        isOpen={showGestionModal}
        onClose={() => setShowGestionModal(false)}
        cartera={cartera}
        carteras={carteras}
        onDepositar={handleDepositar}
        onRetirar={handleRetirar}
        onTransferir={handleTransferir}
      />
    </div>
  )
}

