'use client'

// Página de ingresos mensuales
// Página dinámica que muestra los ingresos de un mes específico
// Permite agregar, ver y eliminar ingresos guardados en localStorage

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import { getAuth, getUsuarioActual } from '@/lib/auth'
import { getIngresos, addIngreso, deleteIngreso, getTotalIngresos, type Ingreso } from '@/lib/ingresos'
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

  // Función para cargar categorías
  const loadCategorias = () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const categorias = getNombresCategoriasPorTipo('ingreso', usuarioActual.id)
      setCategoriasDisponibles(categorias)
      
      // Si hay una categoría en la URL, preseleccionarla
      const categoriaUrl = searchParams?.get('categoria')
      if (categoriaUrl && categorias.includes(categoriaUrl)) {
        setCategoria(categoriaUrl)
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
  const loadIngresos = () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      const ingresosMes = getIngresos(mes, usuarioActual.id)
      const totalMes = getTotalIngresos(mes, usuarioActual.id)
      setIngresos(ingresosMes)
      setTotal(totalMes)
    }
  }

  // Función para manejar el submit del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300))

    // Agregar el ingreso
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      addIngreso(mes, {
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        fecha: fecha,
        mes: mes,
        categoria: categoria || 'Otros'
      }, usuarioActual.id)
    }

    // Limpiar formulario
    setDescripcion('')
    setMonto('')
    setFecha('')
    setCategoria('')

    // Recargar ingresos
    loadIngresos()
    setLoading(false)
  }

  // Función para eliminar un ingreso
  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      const usuarioActual = getUsuarioActual()
      if (usuarioActual) {
        deleteIngreso(mes, id, usuarioActual.id)
        loadIngresos()
      }
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
          
          {ingresos.length > 0 ? (
            <>
              <div className="ingresos-list">
                {ingresos.map((ingreso) => (
                  <div key={ingreso.id} className="ingreso-item">
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
                      onClick={() => handleDelete(ingreso.id)}
                      className="ingreso-item-delete"
                      title="Eliminar ingreso"
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

