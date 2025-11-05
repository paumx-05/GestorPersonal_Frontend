'use client'

// Página de Distribución de Presupuestos Mensuales
// Permite definir presupuestos por categorías y visualizarlos en una gráfica circular

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, getUsuarioActual } from '@/lib/auth'
import { getResumenMensual } from '@/lib/distribucion'
import { getIngresos, getTotalIngresos } from '@/lib/ingresos'
import { getNombresCategoriasPorTipo } from '@/lib/categorias'
import {
  getPresupuestos,
  setPresupuesto,
  deletePresupuesto,
  getTotalPresupuestos,
  actualizarPorcentajes,
  type Presupuesto
} from '@/lib/presupuestos'
import PieChart from '@/components/PieChart'

// Lista de meses del año
const meses = [
  { nombre: 'Enero', valor: 'enero' },
  { nombre: 'Febrero', valor: 'febrero' },
  { nombre: 'Marzo', valor: 'marzo' },
  { nombre: 'Abril', valor: 'abril' },
  { nombre: 'Mayo', valor: 'mayo' },
  { nombre: 'Junio', valor: 'junio' },
  { nombre: 'Julio', valor: 'julio' },
  { nombre: 'Agosto', valor: 'agosto' },
  { nombre: 'Septiembre', valor: 'septiembre' },
  { nombre: 'Octubre', valor: 'octubre' },
  { nombre: 'Noviembre', valor: 'noviembre' },
  { nombre: 'Diciembre', valor: 'diciembre' },
]

// Función para obtener el mes actual en formato para URL
function getMesActual(): string {
  const mesesValores = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  const mesActual = new Date().getMonth()
  return mesesValores[mesActual]
}

export default function DistribucionPage() {
  const router = useRouter()
  // Inicializar con el mes actual (Noviembre)
  const [mesSeleccionado, setMesSeleccionado] = useState(getMesActual())
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [totalIngresos, setTotalIngresos] = useState(0)
  const [resumen, setResumen] = useState<any>(null)
  
  // Estados para el formulario
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [montoPresupuesto, setMontoPresupuesto] = useState('')
  const [modoPorcentaje, setModoPorcentaje] = useState(false)
  const [porcentajePresupuesto, setPorcentajePresupuesto] = useState('')
  const [editingCategoria, setEditingCategoria] = useState<string | null>(null)

  // Verificar autenticación al cargar
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [router])

  // Cargar datos cuando cambia el mes
  useEffect(() => {
    loadData()
  }, [mesSeleccionado])

  // Actualizar porcentajes cuando cambian los ingresos
  useEffect(() => {
    if (totalIngresos > 0) {
      actualizarPorcentajes(mesSeleccionado, totalIngresos)
      loadPresupuestos()
    }
  }, [totalIngresos, mesSeleccionado])

  // Función para cargar datos
  const loadData = () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const ingresos = getTotalIngresos(mesSeleccionado, usuarioActual.id)
      const resumenData = getResumenMensual(mesSeleccionado, usuarioActual.id)
      
      setTotalIngresos(ingresos)
      setResumen(resumenData)
      loadPresupuestos()
    }
  }

  // Función para cargar presupuestos
  const loadPresupuestos = () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const presupuestosData = getPresupuestos(mesSeleccionado, usuarioActual.id)
      setPresupuestos(presupuestosData)
    }
  }

  // Función para manejar el submit del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoriaSeleccionada) return
    
    let monto: number
    
    if (modoPorcentaje) {
      // Calcular monto basado en porcentaje
      const porcentaje = parseFloat(porcentajePresupuesto)
      if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
        alert('El porcentaje debe estar entre 0 y 100')
        return
      }
      monto = (totalIngresos * porcentaje) / 100
    } else {
      // Usar monto directo
      monto = parseFloat(montoPresupuesto)
      if (isNaN(monto) || monto < 0) {
        alert('El monto debe ser un número válido')
        return
      }
    }
    
    setPresupuesto(mesSeleccionado, categoriaSeleccionada, monto, totalIngresos)
    loadPresupuestos()
    
    // Limpiar formulario
    setCategoriaSeleccionada('')
    setMontoPresupuesto('')
    setPorcentajePresupuesto('')
    setEditingCategoria(null)
  }

  // Función para eliminar presupuesto
  const handleDelete = (categoria: string) => {
    if (confirm(`¿Estás seguro de eliminar el presupuesto de ${categoria}?`)) {
      const usuarioActual = getUsuarioActual()
      if (usuarioActual) {
        deletePresupuesto(mesSeleccionado, categoria, usuarioActual.id)
        loadPresupuestos()
      }
    }
  }

  // Función para editar presupuesto
  const handleEdit = (presupuesto: Presupuesto) => {
    setEditingCategoria(presupuesto.categoria)
    setCategoriaSeleccionada(presupuesto.categoria)
    setMontoPresupuesto(presupuesto.monto.toString())
    setPorcentajePresupuesto(presupuesto.porcentaje.toFixed(2))
    setModoPorcentaje(false)
  }

  // Preparar datos para la gráfica
  const usuarioActual = getUsuarioActual()
  const totalPresupuestos = usuarioActual ? getTotalPresupuestos(mesSeleccionado, usuarioActual.id) : 0
  const sobrante = totalIngresos - totalPresupuestos
  
  // Preparar datos para la gráfica (incluyendo sobrante como "Ahorro")
  const chartData = presupuestos.map(p => ({
    categoria: p.categoria,
    monto: p.monto,
    porcentaje: p.porcentaje,
    color: ''
  }))
  
  // Agregar sobrante como "Ahorro" si hay sobrante positivo
  if (sobrante > 0 && totalIngresos > 0) {
    const porcentajeAhorro = (sobrante / totalIngresos) * 100
    chartData.push({
      categoria: 'Ahorro',
      monto: sobrante,
      porcentaje: porcentajeAhorro,
      color: ''
    })
  }

  // Formatear monto como moneda
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(monto)
  }

  // Obtener el nombre del mes seleccionado
  const nombreMes = meses.find(m => m.valor === mesSeleccionado)?.nombre || mesSeleccionado

  // Estado para categorías disponibles
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([])

  // Cargar categorías disponibles
  useEffect(() => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const categorias = getNombresCategoriasPorTipo('gasto', usuarioActual.id)
      setCategoriasDisponibles(categorias)
    }
  }, [presupuestos, editingCategoria, mesSeleccionado])

  // Filtrar categorías (las que no tienen presupuesto o la que se está editando)
  const categoriasFiltradas = categoriasDisponibles.filter(
    (cat: string) => !presupuestos.find(p => p.categoria === cat) || cat === editingCategoria
  )

  return (
    <div className="distribucion-page">
      <div className="distribucion-container">
        <div className="distribucion-header">
          <h1 className="distribucion-title">Distribución de Presupuestos</h1>
          <p className="distribucion-subtitle">
            Define y visualiza cómo quieres distribuir tus ingresos por categorías cada mes
          </p>
        </div>

        {/* Selector de mes */}
        <div className="distribucion-controls">
          <div className="control-group">
            <label htmlFor="mes" className="control-label">Mes:</label>
            <select
              id="mes"
              className="control-select"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
            >
              {meses.map((mes) => (
                <option key={mes.valor} value={mes.valor}>
                  {mes.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen */}
        {totalIngresos > 0 && (
          <div className="distribucion-resumen">
            <div className="resumen-item">
              <span className="resumen-label">Total Ingresos {nombreMes}:</span>
              <span className="resumen-amount ingresos-color">{formatMonto(totalIngresos)}</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Total Presupuestado:</span>
              <span className="resumen-amount">{formatMonto(totalPresupuestos)}</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Disponible:</span>
              <span className={`resumen-amount ${totalIngresos - totalPresupuestos >= 0 ? 'balance-positivo' : 'balance-negativo'}`}>
                {formatMonto(totalIngresos - totalPresupuestos)}
              </span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">% Presupuestado:</span>
              <span className="resumen-value">
                {totalIngresos > 0 ? ((totalPresupuestos / totalIngresos) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        )}

        {/* Layout: Gráfica y Formulario */}
        <div className="distribucion-content-grid">
          {/* Gráfica circular */}
          <div className="distribucion-chart-card">
            <h2 className="distribucion-chart-title">Distribución Presupuestaria - {nombreMes}</h2>
            <PieChart data={chartData} total={totalIngresos} size={350} />
          </div>

          {/* Formulario para agregar/editar presupuestos */}
          <div className="distribucion-form-card">
            <h2 className="distribucion-form-title">
              {editingCategoria ? 'Editar Presupuesto' : 'Agregar Presupuesto'}
            </h2>
            <form onSubmit={handleSubmit} className="presupuesto-form">
              <div className="form-group">
                <label htmlFor="categoria" className="form-label">Categoría:</label>
                <select
                  id="categoria"
                  className="form-input"
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  required
                  disabled={!!editingCategoria}
                >
                  <option value="">Selecciona una categoría</option>
                  {categoriasFiltradas.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Modo de entrada:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="modo"
                      checked={!modoPorcentaje}
                      onChange={() => setModoPorcentaje(false)}
                    />
                    Monto en €
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="modo"
                      checked={modoPorcentaje}
                      onChange={() => setModoPorcentaje(true)}
                    />
                    Porcentaje (%)
                  </label>
                </div>
              </div>

              {!modoPorcentaje ? (
                <div className="form-group">
                  <label htmlFor="monto" className="form-label">Monto (€):</label>
                  <input
                    type="number"
                    id="monto"
                    className="form-input"
                    step="0.01"
                    min="0"
                    value={montoPresupuesto}
                    onChange={(e) => setMontoPresupuesto(e.target.value)}
                    required
                    placeholder="0.00"
                  />
                  {totalIngresos > 0 && montoPresupuesto && (
                    <span className="form-hint">
                      = {((parseFloat(montoPresupuesto) / totalIngresos) * 100).toFixed(1)}% de ingresos
                    </span>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="porcentaje" className="form-label">Porcentaje (%):</label>
                  <input
                    type="number"
                    id="porcentaje"
                    className="form-input"
                    step="0.1"
                    min="0"
                    max="100"
                    value={porcentajePresupuesto}
                    onChange={(e) => setPorcentajePresupuesto(e.target.value)}
                    required
                    placeholder="0.0"
                  />
                  {totalIngresos > 0 && porcentajePresupuesto && (
                    <span className="form-hint">
                      = {formatMonto((totalIngresos * parseFloat(porcentajePresupuesto)) / 100)}
                    </span>
                  )}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-full">
                  {editingCategoria ? 'Actualizar' : 'Agregar'} Presupuesto
                </button>
                {editingCategoria && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={() => {
                      setEditingCategoria(null)
                      setCategoriaSeleccionada('')
                      setMontoPresupuesto('')
                      setPorcentajePresupuesto('')
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* Lista de presupuestos */}
            {presupuestos.length > 0 && (
              <div className="presupuestos-list">
                <h3 className="presupuestos-list-title">Presupuestos Configurados</h3>
                {presupuestos.map((presupuesto, index) => (
                  <div key={index} className="presupuesto-item">
                    <div className="presupuesto-item-info">
                      <span className="presupuesto-categoria">{presupuesto.categoria}</span>
                      <span className="presupuesto-monto">{formatMonto(presupuesto.monto)}</span>
                      <span className="presupuesto-porcentaje">{presupuesto.porcentaje.toFixed(1)}%</span>
                    </div>
                    <div className="presupuesto-item-actions">
                      <button
                        onClick={() => handleEdit(presupuesto)}
                        className="btn-icon"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(presupuesto.categoria)}
                        className="btn-icon"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
