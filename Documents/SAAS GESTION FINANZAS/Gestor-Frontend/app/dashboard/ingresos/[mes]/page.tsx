'use client'

// Página de ingresos mensuales
// Página dinámica que muestra los ingresos de un mes específico
// Integración completa con backend MongoDB

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import { getAuth, getUsuarioActual } from '@/lib/auth'
import { ingresosService } from '@/services/ingresos.service'
import type { Ingreso, MesValido } from '@/models/ingresos'
import { getNombresCategoriasPorTipo } from '@/lib/categorias'

// Mapeo de valores de mes a nombres completos
const mesesNombres: { [key: string]: string } = {
  enero: 'Enero',
  febrero: 'Febrero',
  marzo: 'Marzo',
  abril: 'Abril',
  mayo: 'Mayo',
  junio: 'Junio',
  julio: 'Julio',
  agosto: 'Agosto',
  septiembre: 'Septiembre',
  octubre: 'Octubre',
  noviembre: 'Noviembre',
  diciembre: 'Diciembre',
}

export default function IngresosMesPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const mes = params?.mes as string

  // Estados del formulario
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(false)

  // Estado para la lista de ingresos
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [total, setTotal] = useState(0)
  const [loadingIngresos, setLoadingIngresos] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estado para categorías disponibles
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([])

  // Verificar autenticación al cargar
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [router])

  // Cargar ingresos y categorías al montar el componente o cambiar el mes
  useEffect(() => {
    if (mes) {
      loadIngresos()
      loadCategorias()
    }
  }, [mes, searchParams])

  // Función para cargar categorías desde el backend
  const loadCategorias = async () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      try {
        const categorias = await getNombresCategoriasPorTipo('ingreso', usuarioActual.id)
        setCategoriasDisponibles(categorias)
        
        // Si hay una categoría en la URL, preseleccionarla
        const categoriaUrl = searchParams?.get('categoria')
        if (categoriaUrl && categorias.includes(categoriaUrl)) {
          setCategoria(categoriaUrl)
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error)
        setCategoriasDisponibles([])
      }
    }
  }

  // Scroll automático al formulario al cargar la página
  useEffect(() => {
    const timer = setTimeout(() => {
      const formCard = document.querySelector('.ingresos-form-card')
      if (formCard) {
        // Obtener posición del elemento
        const elementPosition = formCard.getBoundingClientRect().top
        // Obtener posición actual del scroll
        const offsetPosition = elementPosition + window.pageYOffset - 120 // 120px de offset para mostrar el header
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [mes])

  // Función para cargar ingresos del mes
  const loadIngresos = async () => {
    if (!mes || !isMesValido(mes)) {
      setError('Mes inválido')
      setLoadingIngresos(false)
      return
    }

    try {
      setLoadingIngresos(true)
      setError(null)
      
      const [ingresosData, totalData] = await Promise.all([
        ingresosService.getIngresosByMes(mes as MesValido),
        ingresosService.getTotalByMes(mes as MesValido)
      ])
      
      setIngresos(ingresosData)
      setTotal(totalData)
    } catch (err: any) {
      console.error('Error al cargar ingresos:', err)
      setError(err.message || 'Error al cargar ingresos')
      setIngresos([])
      setTotal(0)
    } finally {
      setLoadingIngresos(false)
    }
  }

  // Función helper para validar mes
  const isMesValido = (mes: string): mes is MesValido => {
    const mesesValidos: MesValido[] = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    return mesesValidos.includes(mes as MesValido)
  }

  // Función para manejar el submit del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!mes || !isMesValido(mes)) {
      setError('Mes inválido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convertir fecha a Date object si es string
      const fechaDate = fecha ? new Date(fecha) : new Date()
      
      await ingresosService.createIngreso({
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        fecha: fechaDate,
        categoria: categoria || 'Otros',
        mes: mes as MesValido
      })

      // Limpiar formulario
      setDescripcion('')
      setMonto('')
      setFecha('')
      setCategoria('')

      // Recargar ingresos
      await loadIngresos()
    } catch (err: any) {
      console.error('Error al crear ingreso:', err)
      setError(err.message || 'Error al crear ingreso')
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar un ingreso
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      return
    }

    try {
      setError(null)
      await ingresosService.deleteIngreso(id)
      await loadIngresos()
    } catch (err: any) {
      console.error('Error al eliminar ingreso:', err)
      setError(err.message || 'Error al eliminar ingreso')
    }
  }

  // Obtener el nombre completo del mes
  const nombreMes = mesesNombres[mes] || mes

  // Formatear fecha para mostrar
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Formatear monto como moneda
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(monto)
  }

  return (
    <div className="ingresos-page">
      <div className="ingresos-container">
        <div className="ingresos-header">
          <h1 className="ingresos-title">Ingresos de {nombreMes}</h1>
          <p className="ingresos-subtitle">
            Gestiona tus ingresos del mes de {nombreMes.toLowerCase()}
          </p>
          {error && (
            <div style={{ 
              padding: '10px', 
              marginTop: '10px', 
              backgroundColor: '#fee', 
              color: '#c33', 
              borderRadius: '4px' 
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Layout horizontal: Formulario y Lista lado a lado */}
        <div className="ingresos-content-grid">
          {/* Formulario para agregar ingresos - lado izquierdo */}
          <div className="ingresos-form-card">
            <h2 className="ingresos-form-title">Agregar Nuevo Ingreso</h2>
            <form className="ingresos-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <input
                  type="text"
                  id="descripcion"
                  name="descripcion"
                  className="form-input"
                  placeholder="Ej: Salario, Freelance, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="monto" className="form-label">Monto</label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fecha" className="form-label">Fecha</label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  className="form-input"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria" className="form-label">Categoría</label>
                <select
                  id="categoria"
                  name="categoria"
                  className="form-input"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona una categoría</option>
                  {categoriasDisponibles.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Agregar Ingreso'}
              </button>
            </form>
          </div>

          {/* Lista de ingresos - lado derecho */}
          <div className="ingresos-list-card">
          <h2 className="ingresos-list-title">
            Ingresos Registrados ({ingresos.length})
          </h2>
          
          {loadingIngresos ? (
            <div className="ingresos-list">
              <p className="ingresos-empty">Cargando ingresos...</p>
            </div>
          ) : error ? (
            <div className="ingresos-list">
              <p className="ingresos-empty" style={{ color: 'red' }}>
                {error}
              </p>
            </div>
          ) : ingresos.length > 0 ? (
            <>
              <div className="ingresos-list">
                {ingresos.map((ingreso) => (
                  <div key={ingreso._id} className="ingreso-item">
                    <div className="ingreso-item-content">
                      <div className="ingreso-item-header">
                        <div className="ingreso-item-left">
                          <h3 className="ingreso-item-descripcion">{ingreso.descripcion}</h3>
                          <span className="ingreso-item-categoria">{ingreso.categoria}</span>
                        </div>
                        <span className="ingreso-item-monto">{formatMonto(ingreso.monto)}</span>
                      </div>
                      <p className="ingreso-item-fecha">{formatFecha(ingreso.fecha)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(ingreso._id)}
                      className="ingreso-item-delete"
                      title="Eliminar ingreso"
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              {total > 0 && (
                <div className="ingresos-total">
                  <span className="ingresos-total-label">Total del mes:</span>
                  <span className="ingresos-total-amount">{formatMonto(total)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="ingresos-list">
              <p className="ingresos-empty">
                No hay ingresos registrados para {nombreMes.toLowerCase()} aún.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

