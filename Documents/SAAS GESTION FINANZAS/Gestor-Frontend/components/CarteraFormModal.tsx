'use client'

// Componente CarteraFormModal - Modal para crear o editar carteras
// Formulario completo con validación

import { useState, useEffect } from 'react'
import type { Cartera, CreateCarteraRequest, UpdateCarteraRequest } from '@/models/carteras'

interface CarteraFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCarteraRequest | UpdateCarteraRequest) => Promise<void>
  cartera?: Cartera | null // Si se proporciona, es modo edición
  mode: 'create' | 'edit'
}

const ICONOS_DISPONIBLES = ['💳', '💰', '🏦', '💵', '💶', '💷', '💴', '🪙', '💸', '🏧', '💼', '👛', '🎒']
const COLORES_DISPONIBLES = [
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Amarillo
  '#ef4444', // Rojo
  '#8b5cf6', // Púrpura
  '#ec4899', // Rosa
  '#14b8a6', // Turquesa
  '#f97316', // Naranja
]

export default function CarteraFormModal({
  isOpen,
  onClose,
  onSubmit,
  cartera,
  mode,
}: CarteraFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [saldoInicial, setSaldoInicial] = useState('0')
  const [moneda, setMoneda] = useState('EUR')
  const [icono, setIcono] = useState('💳')
  const [color, setColor] = useState('#3b82f6')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de la cartera en modo edición
  useEffect(() => {
    if (mode === 'edit' && cartera) {
      setNombre(cartera.nombre)
      setDescripcion(cartera.descripcion || '')
      setIcono(cartera.icono || '💳')
      setColor(cartera.color || '#3b82f6')
      // En modo edición no permitimos cambiar saldo inicial ni moneda
    } else if (mode === 'create') {
      // Resetear formulario en modo crear
      setNombre('')
      setDescripcion('')
      setSaldoInicial('0')
      setMoneda('EUR')
      setIcono('💳')
      setColor('#3b82f6')
    }
  }, [mode, cartera, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!nombre.trim()) {
        setError('El nombre es requerido')
        setLoading(false)
        return
      }

      if (nombre.length > 100) {
        setError('El nombre no puede exceder 100 caracteres')
        setLoading(false)
        return
      }

      if (descripcion.length > 500) {
        setError('La descripción no puede exceder 500 caracteres')
        setLoading(false)
        return
      }

      if (mode === 'create') {
        const saldoNum = parseFloat(saldoInicial)
        if (isNaN(saldoNum) || saldoNum < 0) {
          setError('El saldo inicial debe ser un número válido')
          setLoading(false)
          return
        }

        const data: CreateCarteraRequest = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          saldoInicial: saldoNum,
          moneda,
          icono,
          color,
        }

        await onSubmit(data)
      } else {
        const data: UpdateCarteraRequest = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          icono,
          color,
        }

        await onSubmit(data)
      }

      // Resetear formulario
      setNombre('')
      setDescripcion('')
      setSaldoInicial('0')
      setMoneda('EUR')
      setIcono('💳')
      setColor('#3b82f6')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al guardar la cartera')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Crear Nueva Cartera' : 'Editar Cartera'}</h2>
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
          <form onSubmit={handleSubmit} className="cartera-form">
            {/* Nombre */}
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Personal, Trabajo, Ahorros"
                maxLength={100}
                required
                disabled={loading}
              />
              <span className="form-hint">{nombre.length}/100 caracteres</span>
            </div>

            {/* Descripción */}
            <div className="form-group">
              <label htmlFor="descripcion">Descripción (opcional)</label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Cartera para gastos personales del día a día"
                maxLength={500}
                rows={3}
                disabled={loading}
              />
              <span className="form-hint">{descripcion.length}/500 caracteres</span>
            </div>

            {/* Saldo Inicial (solo en crear) */}
            {mode === 'create' && (
              <div className="form-group">
                <label htmlFor="saldoInicial">Saldo Inicial</label>
                <input
                  type="number"
                  id="saldoInicial"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
                <span className="form-hint">
                  Capital inicial de la cartera (puedes modificarlo después)
                </span>
              </div>
            )}

            {/* Moneda (solo en crear) */}
            {mode === 'create' && (
              <div className="form-group">
                <label htmlFor="moneda">Moneda</label>
                <select
                  id="moneda"
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  disabled={loading}
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dólar Estadounidense</option>
                  <option value="GBP">GBP - Libra Esterlina</option>
                  <option value="JPY">JPY - Yen Japonés</option>
                  <option value="CHF">CHF - Franco Suizo</option>
                  <option value="CAD">CAD - Dólar Canadiense</option>
                  <option value="AUD">AUD - Dólar Australiano</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                </select>
              </div>
            )}

            {/* Icono */}
            <div className="form-group">
              <label>Icono</label>
              <div className="icono-selector">
                {ICONOS_DISPONIBLES.map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={`icono-option ${icono === i ? 'selected' : ''}`}
                    onClick={() => setIcono(i)}
                    disabled={loading}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="form-group">
              <label>Color</label>
              <div className="color-selector">
                {COLORES_DISPONIBLES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    disabled={loading}
                    aria-label={`Color ${c}`}
                  >
                    {color === c && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="form-group">
              <label>Vista Previa</label>
              <div className="cartera-preview" style={{ borderLeftColor: color }}>
                <span className="preview-icon">{icono}</span>
                <div className="preview-info">
                  <span className="preview-nombre">{nombre || 'Nombre de la cartera'}</span>
                  {descripcion && (
                    <span className="preview-descripcion">{descripcion}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && <div className="form-error-box">{error}</div>}

            {/* Botones */}
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? 'Guardando...'
                  : mode === 'create'
                  ? 'Crear Cartera'
                  : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

