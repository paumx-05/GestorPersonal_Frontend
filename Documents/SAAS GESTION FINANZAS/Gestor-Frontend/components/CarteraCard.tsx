'use client'

// Componente CarteraCard - Tarjeta para mostrar información de una cartera
// Muestra saldo, información básica y acciones rápidas

import { useState } from 'react'
import type { Cartera } from '@/models/carteras'

interface CarteraCardProps {
  cartera: Cartera
  onEdit?: (cartera: Cartera) => void
  onDelete?: (cartera: Cartera) => void
  onGestionar?: (cartera: Cartera) => void
  onVerDetalles?: (cartera: Cartera) => void
  onClick?: (cartera: Cartera) => void
}

export default function CarteraCard({
  cartera,
  onEdit,
  onDelete,
  onGestionar,
  onVerDetalles,
  onClick,
}: CarteraCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Formatear moneda
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Calcular el cambio desde el saldo inicial
  const cambio = cartera.saldo - cartera.saldoInicial
  const porcentajeCambio = cartera.saldoInicial !== 0 
    ? ((cambio / cartera.saldoInicial) * 100).toFixed(1)
    : '0.0'

  const handleCardClick = () => {
    if (onClick) {
      onClick(cartera)
    }
  }

  return (
    <div
      className={`cartera-card ${!cartera.activa ? 'inactiva' : ''}`}
      style={{ borderLeftColor: cartera.color || '#3b82f6' }}
      onClick={handleCardClick}
    >
      <div className="cartera-card-header">
        <div className="cartera-info">
          <span className="cartera-icon">{cartera.icono || '💳'}</span>
          <div className="cartera-title-container">
            <h3 className="cartera-nombre">{cartera.nombre}</h3>
            {cartera.descripcion && (
              <p className="cartera-descripcion">{cartera.descripcion}</p>
            )}
          </div>
        </div>
        
        <div className="cartera-menu-container">
          <button
            className="cartera-menu-btn"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            aria-label="Opciones de cartera"
          >
            ⋮
          </button>
          
          {showMenu && (
            <div className="cartera-menu-dropdown">
              {onVerDetalles && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onVerDetalles(cartera)
                  }}
                >
                  Ver Detalles
                </button>
              )}
              {onGestionar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onGestionar(cartera)
                  }}
                >
                  Gestionar Saldo
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onEdit(cartera)
                  }}
                >
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onDelete(cartera)
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="cartera-card-body">
        <div className="cartera-saldo-section">
          <span className="cartera-saldo-label">Saldo Actual</span>
          <h2 className="cartera-saldo">
            {formatCurrency(cartera.saldo, cartera.moneda)}
          </h2>
        </div>

        <div className="cartera-stats">
          <div className="cartera-stat">
            <span className="cartera-stat-label">Saldo Inicial</span>
            <span className="cartera-stat-value">
              {formatCurrency(cartera.saldoInicial, cartera.moneda)}
            </span>
          </div>
          <div className="cartera-stat">
            <span className="cartera-stat-label">Balance</span>
            <span className={`cartera-stat-value ${cambio >= 0 ? 'positivo' : 'negativo'}`}>
              {cambio >= 0 ? '+' : ''}{formatCurrency(cambio, cartera.moneda)}
              <span className="cartera-porcentaje">
                ({cambio >= 0 ? '+' : ''}{porcentajeCambio}%)
              </span>
            </span>
          </div>
        </div>
      </div>

      {!cartera.activa && (
        <div className="cartera-inactive-badge">
          Archivada
        </div>
      )}
    </div>
  )
}

