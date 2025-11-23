'use client'

// Componente GestionSaldoModal - Modal para gestionar saldo de carteras
// Permite depositar, retirar y transferir entre carteras

import { useState } from 'react'
import type { Cartera } from '@/models/carteras'

type TipoOperacion = 'deposito' | 'retiro' | 'transferencia'

interface GestionSaldoModalProps {
  isOpen: boolean
  onClose: () => void
  cartera: Cartera
  carteras: Cartera[] // Para transferencias
  onDepositar: (monto: number, concepto: string, fecha: string) => Promise<void>
  onRetirar: (monto: number, concepto: string, fecha: string) => Promise<void>
  onTransferir: (carteraDestinoId: string, monto: number, concepto: string, fecha: string) => Promise<void>
}

export default function GestionSaldoModal({
  isOpen,
  onClose,
  cartera,
  carteras,
  onDepositar,
  onRetirar,
  onTransferir,
}: GestionSaldoModalProps) {
  const [operacion, setOperacion] = useState<TipoOperacion>('deposito')
  const [monto, setMonto] = useState('')
  const [concepto, setConcepto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [carteraDestinoId, setCarteraDestinoId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtrar carteras disponibles para transferencia (excluir la actual y las inactivas)
  const carterasDisponibles = carteras.filter(
    (c) => c._id !== cartera._id && c.activa
  )

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const montoNum = parseFloat(monto)

      if (isNaN(montoNum) || montoNum <= 0) {
        setError('El monto debe ser un número positivo')
        setLoading(false)
        return
      }

      if (!concepto.trim()) {
        setError('El concepto es requerido')
        setLoading(false)
        return
      }

      if (operacion === 'retiro' && montoNum > cartera.saldo) {
        setError('Saldo insuficiente para esta operación')
        setLoading(false)
        return
      }

      if (operacion === 'transferencia' && !carteraDestinoId) {
        setError('Debes seleccionar una cartera de destino')
        setLoading(false)
        return
      }

      switch (operacion) {
        case 'deposito':
          await onDepositar(montoNum, concepto, fecha)
          break
        case 'retiro':
          await onRetirar(montoNum, concepto, fecha)
          break
        case 'transferencia':
          await onTransferir(carteraDestinoId, montoNum, concepto, fecha)
          break
      }

      // Resetear formulario
      setMonto('')
      setConcepto('')
      setFecha(new Date().toISOString().split('T')[0])
      setCarteraDestinoId('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al procesar la operación')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setMonto('')
      setConcepto('')
      setFecha(new Date().toISOString().split('T')[0])
      setCarteraDestinoId('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gestionar Saldo - {cartera.nombre}</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Información de saldo actual */}
          <div className="saldo-info-box">
            <div className="saldo-info-item">
              <span className="saldo-info-label">Saldo Actual:</span>
              <span className="saldo-info-value">
                {formatCurrency(cartera.saldo, cartera.moneda)}
              </span>
            </div>
          </div>

          {/* Tabs para seleccionar operación */}
          <div className="operacion-tabs">
            <button
              className={`operacion-tab ${operacion === 'deposito' ? 'active' : ''}`}
              onClick={() => {
                setOperacion('deposito')
                setError(null)
              }}
              disabled={loading}
            >
              💰 Depositar
            </button>
            <button
              className={`operacion-tab ${operacion === 'retiro' ? 'active' : ''}`}
              onClick={() => {
                setOperacion('retiro')
                setError(null)
              }}
              disabled={loading}
            >
              💸 Retirar
            </button>
            <button
              className={`operacion-tab ${operacion === 'transferencia' ? 'active' : ''}`}
              onClick={() => {
                setOperacion('transferencia')
                setError(null)
              }}
              disabled={loading || carterasDisponibles.length === 0}
            >
              🔄 Transferir
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="gestion-saldo-form">
            {/* Descripción de la operación */}
            <div className="operacion-descripcion">
              {operacion === 'deposito' && (
                <p>Añade capital a esta cartera. El saldo aumentará.</p>
              )}
              {operacion === 'retiro' && (
                <p>Retira capital de esta cartera. El saldo disminuirá.</p>
              )}
              {operacion === 'transferencia' && (
                <p>Transfiere capital a otra cartera. Se actualizarán ambas.</p>
              )}
            </div>

            {/* Campo de cartera destino (solo para transferencia) */}
            {operacion === 'transferencia' && (
              <div className="form-group">
                <label htmlFor="carteraDestino">Cartera Destino *</label>
                <select
                  id="carteraDestino"
                  value={carteraDestinoId}
                  onChange={(e) => setCarteraDestinoId(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona una cartera</option>
                  {carterasDisponibles.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.icono || '💳'} {c.nombre} ({formatCurrency(c.saldo, c.moneda)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campo de monto */}
            <div className="form-group">
              <label htmlFor="monto">Monto ({cartera.moneda}) *</label>
              <input
                type="number"
                id="monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                disabled={loading}
              />
              {operacion === 'retiro' && parseFloat(monto) > cartera.saldo && (
                <span className="form-error">
                  ⚠️ Saldo insuficiente (disponible: {formatCurrency(cartera.saldo, cartera.moneda)})
                </span>
              )}
            </div>

            {/* Campo de concepto */}
            <div className="form-group">
              <label htmlFor="concepto">Concepto *</label>
              <input
                type="text"
                id="concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder={
                  operacion === 'deposito'
                    ? 'Ej: Ingreso inicial, Ahorro mensual'
                    : operacion === 'retiro'
                    ? 'Ej: Retiro efectivo, Pago externo'
                    : 'Ej: Reorganización de fondos'
                }
                maxLength={200}
                required
                disabled={loading}
              />
            </div>

            {/* Campo de fecha */}
            <div className="form-group">
              <label htmlFor="fecha">Fecha</label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && <div className="form-error-box">{error}</div>}

            {/* Preview de la operación */}
            {monto && parseFloat(monto) > 0 && (
              <div className="operacion-preview">
                <h4>Vista Previa:</h4>
                {operacion === 'deposito' && (
                  <div className="preview-item">
                    <span>Nuevo saldo:</span>
                    <span className="preview-value positivo">
                      {formatCurrency(cartera.saldo + parseFloat(monto), cartera.moneda)}
                    </span>
                  </div>
                )}
                {operacion === 'retiro' && (
                  <div className="preview-item">
                    <span>Nuevo saldo:</span>
                    <span className="preview-value negativo">
                      {formatCurrency(cartera.saldo - parseFloat(monto), cartera.moneda)}
                    </span>
                  </div>
                )}
                {operacion === 'transferencia' && carteraDestinoId && (
                  <>
                    <div className="preview-item">
                      <span>{cartera.nombre}:</span>
                      <span className="preview-value negativo">
                        {formatCurrency(cartera.saldo - parseFloat(monto), cartera.moneda)}
                      </span>
                    </div>
                    <div className="preview-item">
                      <span>
                        {carterasDisponibles.find((c) => c._id === carteraDestinoId)?.nombre}:
                      </span>
                      <span className="preview-value positivo">
                        {formatCurrency(
                          (carterasDisponibles.find((c) => c._id === carteraDestinoId)?.saldo || 0) + parseFloat(monto),
                          cartera.moneda
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${operacion === 'retiro' ? 'btn-danger' : ''}`}
                disabled={loading}
              >
                {loading ? 'Procesando...' : `Confirmar ${operacion === 'deposito' ? 'Depósito' : operacion === 'retiro' ? 'Retiro' : 'Transferencia'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

