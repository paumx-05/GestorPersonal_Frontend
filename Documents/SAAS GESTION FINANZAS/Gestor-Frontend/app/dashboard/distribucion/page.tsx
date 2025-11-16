'use client'

// Página de Distribución de Presupuestos Mensuales
// Permite definir presupuestos por categorías y visualizarlos en una gráfica circular

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, getUsuarioActual } from '@/lib/auth'
import { getResumenMensual } from '@/lib/distribucion'
import { ingresosService } from '@/services/ingresos.service'
import { getNombresCategoriasPorTipo } from '@/lib/categorias'
import type { MesValido } from '@/models/presupuestos'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPresupuestos, setTotalPresupuestos] = useState(0)
  
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

  // Función para cargar datos
  const loadData = async () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      try {
        setLoading(true)
        setError(null)
        
        // Obtener total de ingresos del mes desde el API real
        const totalIngresosData = await ingresosService.getTotalByMes(mesSeleccionado as MesValido)
        const resumenData = await getResumenMensual(mesSeleccionado, usuarioActual.id)
        
        setTotalIngresos(totalIngresosData)
        setResumen(resumenData)
        await loadPresupuestos()
      } catch (error) {
        console.error('Error al cargar datos:', error)
        setError('Error al cargar los datos. Por favor, intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }
  }

  // Función para cargar presupuestos
  const loadPresupuestos = async (forceRefresh: boolean = false) => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      try {
        const [presupuestosData, total] = await Promise.all([
          getPresupuestos(mesSeleccionado, usuarioActual.id, forceRefresh),
          getTotalPresupuestos(mesSeleccionado, usuarioActual.id, forceRefresh)
        ])
        
        console.log('[DISTRIBUCION] Presupuestos cargados:', {
          cantidad: presupuestosData.length,
          presupuestos: presupuestosData,
          total: total
        })
        
        setPresupuestos(presupuestosData)
        setTotalPresupuestos(total)
      } catch (error) {
        console.error('Error al cargar presupuestos:', error)
        setError('Error al cargar los presupuestos. Por favor, intenta de nuevo.')
      }
    }
  }

  // Función para manejar el submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoriaSeleccionada) {
      alert('Por favor, selecciona una categoría')
      return
    }
    
    // Validar que haya ingresos registrados
    if (totalIngresos <= 0) {
      alert('No puedes crear presupuestos sin ingresos registrados. Por favor, registra ingresos primero para este mes.')
      setError('No hay ingresos registrados para este mes. Registra ingresos primero.')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      let monto: number
      
      if (modoPorcentaje) {
        // Calcular monto basado en porcentaje
        const porcentaje = parseFloat(porcentajePresupuesto)
        if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
          alert('El porcentaje debe estar entre 0 y 100')
          setLoading(false)
          return
        }
        monto = (totalIngresos * porcentaje) / 100
      } else {
        // Usar monto directo
        monto = parseFloat(montoPresupuesto)
        if (isNaN(monto) || monto < 0) {
          alert('El monto debe ser un número válido')
          setLoading(false)
          return
        }
      }
      
      await setPresupuesto(mesSeleccionado, categoriaSeleccionada, monto, totalIngresos)
      
      // Forzar recarga sin cache para ver los cambios inmediatamente
      await loadPresupuestos(true)
      
      // Limpiar formulario
      setCategoriaSeleccionada('')
      setMontoPresupuesto('')
      setPorcentajePresupuesto('')
      setEditingCategoria(null)
    } catch (error: any) {
      console.error('Error al guardar presupuesto:', error)
      setError(error.message || 'Error al guardar el presupuesto. Por favor, intenta de nuevo.')
      alert(error.message || 'Error al guardar el presupuesto')
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar presupuesto
  const handleDelete = async (categoria: string) => {
    if (!confirm(`¿Estás seguro de eliminar el presupuesto de ${categoria}?`)) {
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const usuarioActual = getUsuarioActual()
      if (usuarioActual) {
        await deletePresupuesto(mesSeleccionado, categoria, usuarioActual.id)
        // Forzar recarga sin cache para ver los cambios inmediatamente
        await loadPresupuestos(true)
      }
    } catch (error: any) {
      console.error('Error al eliminar presupuesto:', error)
      setError(error.message || 'Error al eliminar el presupuesto. Por favor, intenta de nuevo.')
      alert(error.message || 'Error al eliminar el presupuesto')
    } finally {
      setLoading(false)
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
  const sobrante = totalIngresos - totalPresupuestos
  
  // Preparar datos para la gráfica (incluyendo sobrante como "Ahorro")
  // Usar porcentajes del backend si están disponibles, sino calcularlos
  const chartData = presupuestos.map(p => {
    // Si el porcentaje viene del backend, usarlo; sino calcularlo
    const porcentaje = p.porcentaje > 0 
      ? p.porcentaje 
      : (totalIngresos > 0 ? (p.monto / totalIngresos) * 100 : 0)
    
    return {
      categoria: p.categoria,
      monto: p.monto,
      porcentaje: porcentaje,
      color: ''
    }
  })
  
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
  
  // Log para debug
  console.log('[DISTRIBUCION] Datos para gráfica:', {
    totalIngresos,
    totalPresupuestos,
    sobrante,
    chartData,
    presupuestosCount: presupuestos.length
  })

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

  // Cargar categorías disponibles desde el backend
  useEffect(() => {
    const loadCategorias = async () => {
      const usuarioActual = getUsuarioActual()
      if (usuarioActual) {
        try {
          const categorias = await getNombresCategoriasPorTipo('gasto', usuarioActual.id)
          setCategoriasDisponibles(categorias)
        } catch (error) {
          console.error('Error al cargar categorías:', error)
          setCategoriasDisponibles([])
        }
      }
    }
    loadCategorias()
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

        {/* Mensaje de error */}
        {error && (
          <div className="error-message" style={{ 
            padding: '1rem', 
            margin: '1rem 0', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '4px' 
          }}>
            {error}
          </div>
        )}

        {/* Indicador de carga */}
        {loading && (
          <div className="loading-message" style={{ 
            padding: '1rem', 
            margin: '1rem 0', 
            textAlign: 'center' 
          }}>
            Cargando...
          </div>
        )}

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

        {/* Mensaje si no hay ingresos */}
        {!loading && totalIngresos === 0 && (
          <div className="warning-message" style={{ 
            padding: '1.5rem', 
            margin: '1rem 0', 
            backgroundColor: '#fff3cd', 
            color: '#856404', 
            borderRadius: '4px',
            border: '1px solid #ffc107'
          }}>
            <strong>⚠️ No hay ingresos registrados para {nombreMes}</strong>
            <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              Para crear presupuestos, primero necesitas registrar ingresos para este mes. 
              <a href={`/dashboard/ingresos/${mesSeleccionado}`} style={{ marginLeft: '0.5rem', color: '#856404', textDecoration: 'underline' }}>
                Ir a ingresos →
              </a>
            </p>
          </div>
        )}

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
              {totalIngresos === 0 && (
                <div className="form-warning" style={{ 
                  padding: '1rem', 
                  marginBottom: '1rem', 
                  backgroundColor: '#fff3cd', 
                  color: '#856404', 
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  ⚠️ No puedes crear presupuestos sin ingresos registrados para este mes.
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="categoria" className="form-label">Categoría:</label>
                <select
                  id="categoria"
                  className="form-input"
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  required
                  disabled={!!editingCategoria || totalIngresos === 0}
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
                    disabled={totalIngresos === 0}
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
                    disabled={totalIngresos === 0}
                  />
                  {totalIngresos > 0 && porcentajePresupuesto && (
                    <span className="form-hint">
                      = {formatMonto((totalIngresos * parseFloat(porcentajePresupuesto)) / 100)}
                    </span>
                  )}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-full"
                  disabled={totalIngresos === 0}
                >
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
