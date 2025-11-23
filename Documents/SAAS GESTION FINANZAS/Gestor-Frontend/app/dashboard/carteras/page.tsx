'use client'

// Página de Gestión de Carteras
// Vista principal para administrar todas las carteras del usuario

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCarteraContext } from '@/contexts/CarteraContext'
import { carterasController } from '@/controllers/carteras.controller'
import CarteraCard from '@/components/CarteraCard'
import CarterasOverview from '@/components/CarterasOverview'
import CarteraFormModal from '@/components/CarteraFormModal'
import GestionSaldoModal from '@/components/GestionSaldoModal'
import type { Cartera, CreateCarteraRequest, UpdateCarteraRequest } from '@/models/carteras'

export default function CarterasPage() {
  const router = useRouter()
  const { carteras, refreshCarteras, loading: loadingContext } = useCarteraContext()
  
  const [vistaActual, setVistaActual] = useState<'grid' | 'list'>('grid')
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'activas' | 'inactivas'>('activas')
  const [busqueda, setBusqueda] = useState('')
  
  const [showFormModal, setShowFormModal] = useState(false)
  const [showGestionModal, setShowGestionModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [carteraSeleccionada, setCarteraSeleccionada] = useState<Cartera | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filtrar carteras según los filtros activos
  const carterasFiltradas = carteras.filter((cartera) => {
    // Filtro por estado
    if (filtroEstado === 'activas' && !cartera.activa) return false
    if (filtroEstado === 'inactivas' && cartera.activa) return false

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase()
      return (
        cartera.nombre.toLowerCase().includes(busquedaLower) ||
        (cartera.descripcion && cartera.descripcion.toLowerCase().includes(busquedaLower))
      )
    }

    return true
  })

  // Handlers para crear cartera
  const handleCrearCartera = () => {
    setModalMode('create')
    setCarteraSeleccionada(null)
    setShowFormModal(true)
  }

  // Handlers para editar cartera
  const handleEditarCartera = (cartera: Cartera) => {
    setModalMode('edit')
    setCarteraSeleccionada(cartera)
    setShowFormModal(true)
  }

  // Handlers para eliminar cartera
  const handleEliminarCartera = async (cartera: Cartera) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar la cartera "${cartera.nombre}"?\n\n` +
      `Selecciona "Aceptar" para mantener los gastos/ingresos asociados.\n` +
      `(Los datos se desasociarán de la cartera pero no se eliminarán)`
    )

    if (!confirmacion) return

    setLoading(true)
    setError(null)

    try {
      const result = await carterasController.deleteCartera(cartera._id, false)
      if (result.success) {
        setSuccessMessage(`Cartera "${cartera.nombre}" eliminada exitosamente`)
        await refreshCarteras()
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(result.error || 'Error al eliminar cartera')
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cartera')
    } finally {
      setLoading(false)
    }
  }

  // Handlers para gestionar saldo
  const handleGestionarSaldo = (cartera: Cartera) => {
    setCarteraSeleccionada(cartera)
    setShowGestionModal(true)
  }

  // Handlers para ver detalles
  const handleVerDetalles = (cartera: Cartera) => {
    router.push(`/dashboard/carteras/${cartera._id}`)
  }

  // Submit del formulario de crear/editar
  const handleFormSubmit = async (data: CreateCarteraRequest | UpdateCarteraRequest) => {
    setLoading(true)
    setError(null)

    try {
      if (modalMode === 'create') {
        const result = await carterasController.createCartera(data as CreateCarteraRequest)
        if (result.success) {
          setSuccessMessage('Cartera creada exitosamente')
          await refreshCarteras()
          setTimeout(() => setSuccessMessage(null), 3000)
        } else {
          throw new Error(result.error || 'Error al crear cartera')
        }
      } else {
        if (!carteraSeleccionada) return
        const result = await carterasController.updateCartera(
          carteraSeleccionada._id,
          data as UpdateCarteraRequest
        )
        if (result.success) {
          setSuccessMessage('Cartera actualizada exitosamente')
          await refreshCarteras()
          setTimeout(() => setSuccessMessage(null), 3000)
        } else {
          throw new Error(result.error || 'Error al actualizar cartera')
        }
      }
    } catch (err: any) {
      throw err // El modal manejará el error
    } finally {
      setLoading(false)
    }
  }

  // Handlers de operaciones de saldo
  const handleDepositar = async (monto: number, concepto: string, fecha: string) => {
    if (!carteraSeleccionada) return

    const result = await carterasController.depositar(carteraSeleccionada._id, {
      monto,
      concepto,
      fecha,
    })

    if (result.success) {
      setSuccessMessage(`Depósito de ${monto} realizado exitosamente`)
      await refreshCarteras()
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      throw new Error(result.error || 'Error al depositar')
    }
  }

  const handleRetirar = async (monto: number, concepto: string, fecha: string) => {
    if (!carteraSeleccionada) return

    const result = await carterasController.retirar(carteraSeleccionada._id, {
      monto,
      concepto,
      fecha,
    })

    if (result.success) {
      setSuccessMessage(`Retiro de ${monto} realizado exitosamente`)
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
    if (!carteraSeleccionada) return

    const result = await carterasController.transferir({
      carteraOrigenId: carteraSeleccionada._id,
      carteraDestinoId,
      monto,
      concepto,
      fecha,
    })

    if (result.success) {
      setSuccessMessage(`Transferencia de ${monto} realizada exitosamente`)
      await refreshCarteras()
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      throw new Error(result.error || 'Error al transferir')
    }
  }

  return (
    <div className="page-container">
      <div className="page-header-carteras">
        <div className="page-header-top">
          <h1 className="page-title">💼 Gestión de Carteras</h1>
          <button className="btn btn-primary" onClick={handleCrearCartera}>
            ➕ Nueva Cartera
          </button>
        </div>
        <p className="page-subtitle">Administra tus carteras y controla tu capital</p>
      </div>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="alert alert-success">
          ✅ {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {/* Overview/Resumen General */}
      {carteras.length > 0 && (
        <div className="page-section">
          <CarterasOverview carteras={carteras} />
        </div>
      )}

      {/* Controles y filtros */}
      <div className="page-controls">
        <div className="controls-left">
          {/* Filtros */}
          <div className="filter-group">
            <label htmlFor="filtroEstado">Estado:</label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
            >
              <option value="todas">Todas</option>
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div className="search-group">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cartera..."
              className="search-input"
            />
          </div>
        </div>

        <div className="controls-right">
          {/* Toggle de vista */}
          <div className="view-toggle">
            <button
              className={`view-btn ${vistaActual === 'grid' ? 'active' : ''}`}
              onClick={() => setVistaActual('grid')}
              title="Vista de cuadrícula"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button
              className={`view-btn ${vistaActual === 'list' ? 'active' : ''}`}
              onClick={() => setVistaActual('list')}
              title="Vista de lista"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal - Lista de carteras */}
      <div className="page-content">
        {loadingContext ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando carteras...</p>
          </div>
        ) : carterasFiltradas.length === 0 ? (
          <div className="empty-state">
            {carteras.length === 0 ? (
              <>
                <div className="empty-icon">💼</div>
                <h3>No tienes carteras creadas</h3>
                <p>Crea tu primera cartera para empezar a gestionar tu capital</p>
                <button className="btn btn-primary" onClick={handleCrearCartera}>
                  ➕ Crear Primera Cartera
                </button>
              </>
            ) : (
              <>
                <div className="empty-icon">🔍</div>
                <h3>No se encontraron carteras</h3>
                <p>
                  No hay carteras que coincidan con los filtros aplicados
                  {busqueda && ` "${busqueda}"`}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className={`carteras-${vistaActual}`}>
            {carterasFiltradas.map((cartera) => (
              <CarteraCard
                key={cartera._id}
                cartera={cartera}
                onEdit={handleEditarCartera}
                onDelete={handleEliminarCartera}
                onGestionar={handleGestionarSaldo}
                onVerDetalles={handleVerDetalles}
                onClick={handleVerDetalles}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <CarteraFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        cartera={carteraSeleccionada}
        mode={modalMode}
      />

      {carteraSeleccionada && (
        <GestionSaldoModal
          isOpen={showGestionModal}
          onClose={() => setShowGestionModal(false)}
          cartera={carteraSeleccionada}
          carteras={carteras}
          onDepositar={handleDepositar}
          onRetirar={handleRetirar}
          onTransferir={handleTransferir}
        />
      )}
    </div>
  )
}

