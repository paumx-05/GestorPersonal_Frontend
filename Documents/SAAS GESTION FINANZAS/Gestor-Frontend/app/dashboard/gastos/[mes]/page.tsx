'use client'

// Página de gastos mensuales
// Página dinámica que muestra los gastos de un mes específico
// Permite agregar, ver y eliminar gastos guardados en localStorage

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import { getAuth, getUsuarioActual } from '@/lib/auth'
import { getGastos, addGasto, deleteGasto, getTotalGastos, updateGasto, type Gasto } from '@/lib/gastos'
import { getNombresCategoriasPorTipo } from '@/lib/categorias'
import { getPresupuestos } from '@/lib/presupuestos'
import { getAmigos } from '@/lib/amigos'

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

export default function GastosMesPage() {
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
  
  // Estados para dividir gasto con amigos
  const [dividirGasto, setDividirGasto] = useState(false)
  const [modoDivision, setModoDivision] = useState<'iguales' | 'personalizado'>('iguales')
  const [amigosSeleccionados, setAmigosSeleccionados] = useState<string[]>([])
  const [amigosPagados, setAmigosPagados] = useState<Record<string, boolean>>({})
  const [montosPersonalizados, setMontosPersonalizados] = useState<Record<string, string>>({})
  const [amigos, setAmigos] = useState<Array<{ id: string; amigoUserId: string; nombre: string; email: string; estado: string }>>([])

  // Estado para la lista de gastos
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [total, setTotal] = useState(0)
  const [loadingGastos, setLoadingGastos] = useState(false)
  const [errorGastos, setErrorGastos] = useState<string | null>(null)
  
  // Estado para edición de gasto
  const [gastoEditando, setGastoEditando] = useState<string | null>(null)
  
  // Estado para presupuestos (para calcular saldo disponible)
  const [presupuestos, setPresupuestos] = useState<Array<{ categoria: string; monto: number }>>([])

  // Verificar autenticación al cargar
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [router])

  // Estado para categorías disponibles
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([])

  // Función para cargar presupuestos del mes
  const loadPresupuestos = async () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual && mes) {
      try {
        const presupuestosData = await getPresupuestos(mes, usuarioActual.id)
        // Convertir a formato simple para búsqueda rápida
        const presupuestosMap = presupuestosData.map(p => ({
          categoria: p.categoria,
          monto: p.monto
        }))
        setPresupuestos(presupuestosMap)
      } catch (error) {
        console.error('Error al cargar presupuestos:', error)
        setPresupuestos([])
      }
    }
  }

  // Cargar gastos y categorías al montar el componente o cambiar el mes
  useEffect(() => {
    if (mes) {
      loadGastos()
      loadCategorias()
      loadPresupuestos()
      // loadAmigos es async, se ejecuta en paralelo
      loadAmigos().catch(err => console.error('Error al cargar amigos:', err))
    }
  }, [mes, searchParams])
  
  // Función para cargar amigos desde el backend
  // Solo se cargan amigos activos (amistad mutua) para dividir gastos
  const loadAmigos = async () => {
    try {
      const amigosList = await getAmigos()
      // getAmigos() ya devuelve solo amigos activos, pero verificamos por seguridad
      const amigosActivos = amigosList
        .filter(amigo => amigo.estado === 'activo')
        .map(amigo => ({ 
          id: amigo.id, // ID del registro Amigo (para selección en UI)
          amigoUserId: amigo.amigoUserId, // ID del usuario amigo (para enviar al backend)
          nombre: amigo.nombre, 
          email: amigo.email,
          estado: amigo.estado
        }))
      setAmigos(amigosActivos)
      console.log(`✅ Cargados ${amigosActivos.length} amigos activos para división de gastos`)
    } catch (error) {
      console.error('Error al cargar amigos:', error)
      setAmigos([])
    }
  }
  
  // NOTA: Los mensajes automáticos ahora los crea el backend automáticamente
  // cuando se crea/actualiza un gasto con división y pagado === false
  // No es necesario crear mensajes manualmente desde el frontend

  // Función para cargar categorías desde el backend
  const loadCategorias = async () => {
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      try {
        const categorias = await getNombresCategoriasPorTipo('gasto', usuarioActual.id)
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
      const formCard = document.querySelector('.gastos-form-card')
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

  // Función para cargar gastos del mes desde el backend
  const loadGastos = async () => {
    const usuarioActual = getUsuarioActual()
    if (!usuarioActual) {
      console.log('[PAGE GASTOS] No hay usuario actual, no se pueden cargar gastos')
      return
    }
    
    console.log('[PAGE GASTOS] Cargando gastos para mes:', mes)
    setLoadingGastos(true)
    setErrorGastos(null)
    
    try {
      const gastosMes = await getGastos(mes, usuarioActual.id)
      console.log('[PAGE GASTOS] Gastos recibidos:', gastosMes.length, gastosMes)
      
      // Ordenar gastos por fecha ascendente (más antiguos primero, más recientes abajo)
      const gastosOrdenados = [...gastosMes].sort((a, b) => {
        const fechaA = new Date(a.fecha).getTime()
        const fechaB = new Date(b.fecha).getTime()
        // Orden ascendente: fechas más antiguas primero
        return fechaA - fechaB
      })
      console.log('[PAGE GASTOS] Gastos ordenados:', gastosOrdenados.length, gastosOrdenados)
      
      const totalMes = await getTotalGastos(mes, usuarioActual.id)
      console.log('[PAGE GASTOS] Total del mes:', totalMes)
      
      setGastos(gastosOrdenados)
      setTotal(totalMes)
      console.log('[PAGE GASTOS] Estado actualizado - gastos:', gastosOrdenados.length, 'total:', totalMes)
    } catch (error: any) {
      console.error('[PAGE GASTOS] Error al cargar gastos:', error)
      setErrorGastos(error.message || 'Error al cargar los gastos')
      setGastos([])
      setTotal(0)
    } finally {
      setLoadingGastos(false)
    }
  }

  // Función para manejar el submit del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300))

    const montoTotal = parseFloat(monto)
    
    // Calcular monto del usuario según la división
    let montoUsuario = montoTotal
    let informacionDividida = undefined
    
    if (dividirGasto && amigosSeleccionados.length > 0) {
      if (modoDivision === 'iguales') {
        // Modo partes iguales: dividir entre todas las personas
        const totalPersonas = 1 + amigosSeleccionados.length
        montoUsuario = montoTotal / totalPersonas
        
        // Crear información de división para cada amigo
        // ⚠️ IMPORTANTE: Usar amigoUserId (ID del usuario amigo), NO id (ID del registro Amigo)
        const amigosDivididos = amigosSeleccionados
          .map(amigoId => {
            const amigoData = amigos.find(a => a.id === amigoId)
            if (!amigoData) return null
            
            // Validar que el amigo esté activo (solo amigos activos pueden recibir mensajes)
            if (amigoData.estado !== 'activo') {
              console.warn(`⚠️ Amigo ${amigoData.nombre} no está activo (estado: ${amigoData.estado}). Se omitirá de la división.`)
              return null
            }
            
            const montoAmigo = montoTotal / totalPersonas
            const pagado = amigosPagados[amigoId] || false
            
            // El backend crea automáticamente los mensajes cuando pagado === false
            // No es necesario crear mensajes manualmente
            
            return {
              amigoId: amigoData.amigoUserId, // ✅ Usar amigoUserId, NO id
              amigoNombre: amigoData.nombre,
              montoDividido: montoAmigo,
              pagado: pagado
            }
          })
          .filter((item): item is { amigoId: string; amigoNombre: string; montoDividido: number; pagado: boolean } => item !== null)
        
        if (amigosDivididos.length > 0) {
          informacionDividida = amigosDivididos
        }
      } else {
        // Modo personalizado: usar los montos manuales
        // ⚠️ IMPORTANTE: Usar amigoUserId (ID del usuario amigo), NO id (ID del registro Amigo)
        let sumaMontosAmigos = 0
        const amigosDivididos = amigosSeleccionados
          .map(amigoId => {
            const amigoData = amigos.find(a => a.id === amigoId)
            if (!amigoData) return null
            
            // Validar que el amigo esté activo (solo amigos activos pueden recibir mensajes)
            if (amigoData.estado !== 'activo') {
              console.warn(`⚠️ Amigo ${amigoData.nombre} no está activo (estado: ${amigoData.estado}). Se omitirá de la división.`)
              return null
            }
            
            const montoAmigoStr = montosPersonalizados[amigoId] || '0'
            const montoAmigo = parseFloat(montoAmigoStr) || 0
            sumaMontosAmigos += montoAmigo
            const pagado = amigosPagados[amigoId] || false
            
            // El backend crea automáticamente los mensajes cuando pagado === false
            // No es necesario crear mensajes manualmente
            
            return {
              amigoId: amigoData.amigoUserId, // ✅ Usar amigoUserId, NO id
              amigoNombre: amigoData.nombre,
              montoDividido: montoAmigo,
              pagado: pagado
            }
          })
          .filter((item): item is { amigoId: string; amigoNombre: string; montoDividido: number; pagado: boolean } => item !== null)
        
        // El usuario paga el resto (monto total - suma de montos de amigos)
        montoUsuario = montoTotal - sumaMontosAmigos
        
        // Validar que no exceda el monto total
        if (sumaMontosAmigos > montoTotal) {
          alert('La suma de los montos de los amigos no puede exceder el monto total del gasto.')
          setLoading(false)
          return
        }
        
        if (amigosDivididos.length > 0) {
          informacionDividida = amigosDivididos
        }
      }
    }
    
    const usuarioActual = getUsuarioActual()
    if (usuarioActual) {
      try {
        if (gastoEditando) {
          // Modo edición: actualizar gasto existente
          await updateGasto(gastoEditando, {
            descripcion: descripcion.trim(),
            monto: montoUsuario,
            fecha: fecha,
            categoria: categoria || 'Otros',
            dividido: informacionDividida
          })
        } else {
          // Modo creación: crear nuevo gasto
          await addGasto(mes, {
            descripcion: descripcion.trim(),
            monto: montoUsuario, // Solo la parte del usuario
            fecha: fecha,
            mes: mes,
            categoria: categoria || 'Otros',
            dividido: informacionDividida
          }, usuarioActual.id)
        }

        // Limpiar formulario
        handleCancelEdit()

        // Esperar un momento para que el backend procese
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Recargar gastos y presupuestos
        await Promise.all([
          loadGastos(),
          loadPresupuestos()
        ])
      } catch (error: any) {
        console.error(`Error al ${gastoEditando ? 'actualizar' : 'crear'} gasto:`, error)
        alert(error.message || `Error al ${gastoEditando ? 'actualizar' : 'crear'} el gasto. Por favor, intenta nuevamente.`)
      }
    }

    setLoading(false)
  }

  // Función para iniciar edición de un gasto
  const handleEdit = (gasto: Gasto) => {
    setGastoEditando(gasto.id)
    setDescripcion(gasto.descripcion)
    setMonto(gasto.monto.toString())
    // Convertir fecha ISO a formato YYYY-MM-DD para el input date
    const fechaDate = new Date(gasto.fecha)
    const fechaFormateada = fechaDate.toISOString().split('T')[0]
    setFecha(fechaFormateada)
    setCategoria(gasto.categoria)
    
    // Si el gasto tiene división, cargar esa información
    // ⚠️ IMPORTANTE: El backend devuelve amigoId como amigoUserId
    // Necesitamos mapearlo de vuelta al id del registro Amigo para la UI
    if (gasto.dividido && gasto.dividido.length > 0) {
      setDividirGasto(true)
      const amigosIds: string[] = []
      const pagados: Record<string, boolean> = {}
      const montos: Record<string, string> = {}
      
      gasto.dividido.forEach(item => {
        // Buscar el amigo por amigoUserId para obtener su id (del registro Amigo)
        const amigo = amigos.find(a => a.amigoUserId === item.amigoId)
        if (amigo) {
          amigosIds.push(amigo.id) // Usar id del registro Amigo para la UI
          pagados[amigo.id] = item.pagado
          montos[amigo.id] = item.montoDividido.toString()
        } else {
          console.warn(`⚠️ No se encontró amigo con amigoUserId: ${item.amigoId} al editar gasto`)
        }
      })
      
      setAmigosSeleccionados(amigosIds)
      setAmigosPagados(pagados)
      setMontosPersonalizados(montos)
      setModoDivision('personalizado') // Por defecto personalizado si ya tiene división
    } else {
      setDividirGasto(false)
      setAmigosSeleccionados([])
      setAmigosPagados({})
      setMontosPersonalizados({})
      setModoDivision('iguales')
    }
    
    // Scroll al formulario
    setTimeout(() => {
      const formCard = document.querySelector('.gastos-form-card')
      if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setGastoEditando(null)
    setDescripcion('')
    setMonto('')
    setFecha('')
    setCategoria('')
    setDividirGasto(false)
    setModoDivision('iguales')
    setAmigosSeleccionados([])
    setAmigosPagados({})
    setMontosPersonalizados({})
  }

  // Función para eliminar un gasto
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      const usuarioActual = getUsuarioActual()
      if (usuarioActual) {
        try {
          await deleteGasto(mes, id, usuarioActual.id)
          // Recargar gastos y presupuestos
          await Promise.all([
            loadGastos(),
            loadPresupuestos()
          ])
        } catch (error: any) {
          console.error('Error al eliminar gasto:', error)
          alert(error.message || 'Error al eliminar el gasto. Por favor, intenta nuevamente.')
        }
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
  
  // Función para obtener el saldo disponible acumulativo hasta un gasto específico
  const getSaldoDisponibleHasta = (gastoActual: Gasto, index: number) => {
    if (!gastoActual.categoria) return null
    
    // Buscar presupuesto en el estado local (ya cargado)
    const presupuesto = presupuestos.find(p => p.categoria === gastoActual.categoria)
    if (!presupuesto) return null
    
    // Obtener todos los gastos de esta categoría ordenados por fecha ascendente (más antiguos primero)
    // para calcular el saldo acumulativo correctamente
    const gastosCategoria = gastos
      .filter(g => g.categoria === gastoActual.categoria)
      .sort((a, b) => {
        // Orden ascendente por fecha (más antiguos primero)
        const fechaDiff = new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        if (fechaDiff !== 0) return fechaDiff
        // Si tienen la misma fecha, usar el ID para mantener consistencia
        return a.id.localeCompare(b.id)
      })
    
    // Encontrar el índice del gasto actual en la lista ordenada
    const indexActual = gastosCategoria.findIndex(g => g.id === gastoActual.id)
    
    if (indexActual === -1) {
      // Si no se encuentra (no debería pasar), calcular solo con el gasto actual
      const gastadoHastaEste = gastoActual.monto
      const disponible = presupuesto.monto - gastadoHastaEste
      const excedido = gastadoHastaEste > presupuesto.monto
      
      return {
        presupuesto: presupuesto.monto,
        gastado: gastadoHastaEste,
        disponible,
        excedido
      }
    }
    
    // Obtener todos los gastos hasta este (incluyendo el actual) en orden cronológico
    const gastosHastaEste = gastosCategoria.slice(0, indexActual + 1)
    const gastadoHastaEste = gastosHastaEste.reduce((sum, g) => sum + g.monto, 0)
    
    const disponible = presupuesto.monto - gastadoHastaEste
    const excedido = gastadoHastaEste > presupuesto.monto
    
    return {
      presupuesto: presupuesto.monto,
      gastado: gastadoHastaEste,
      disponible,
      excedido
    }
  }

  return (
    <div className="gastos-page">
      <div className="gastos-container">
        <div className="gastos-header">
          <h1 className="gastos-title">Gastos de {nombreMes}</h1>
          <p className="gastos-subtitle">
            Gestiona tus gastos del mes de {nombreMes.toLowerCase()}
          </p>
        </div>

        {/* Layout horizontal: Formulario y Lista lado a lado */}
        <div className="gastos-content-grid">
          {/* Formulario para agregar/editar gastos - lado izquierdo */}
          <div className="gastos-form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="gastos-form-title">
                {gastoEditando ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}
              </h2>
              {gastoEditando && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn"
                  style={{ 
                    padding: '8px 16px',
                    fontSize: '0.9em',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
            <form className="gastos-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <input
                  type="text"
                  id="descripcion"
                  name="descripcion"
                  className="form-input"
                  placeholder="Ej: Supermercado, Transporte, etc."
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

              {/* Opción para dividir gasto - Minimalista */}
              <div className="gasto-dividir-container">
                <label className="gasto-dividir-toggle">
                  <input
                    type="checkbox"
                    checked={dividirGasto}
                    onChange={(e) => {
                      setDividirGasto(e.target.checked)
                      if (!e.target.checked) {
                        setModoDivision('iguales')
                        setAmigosSeleccionados([])
                        setAmigosPagados({})
                        setMontosPersonalizados({})
                      }
                    }}
                    disabled={loading || amigos.length === 0}
                  />
                  <span className="gasto-dividir-label">
                    {amigos.length === 0 ? 'Dividir con amigos (sin amigos)' : 'Dividir con amigos'}
                  </span>
                </label>
                
                {dividirGasto && amigos.length > 0 && (
                  <div className="gasto-dividir-opciones">
                    {/* Selector de modo de división */}
                    <div className="gasto-dividir-modo">
                      <label className="gasto-dividir-modo-label">
                        <input
                          type="radio"
                          name="modoDivision"
                          value="iguales"
                          checked={modoDivision === 'iguales'}
                          onChange={(e) => {
                            setModoDivision('iguales')
                            setMontosPersonalizados({})
                          }}
                          disabled={loading}
                        />
                        <span>Partes iguales</span>
                      </label>
                      <label className="gasto-dividir-modo-label">
                        <input
                          type="radio"
                          name="modoDivision"
                          value="personalizado"
                          checked={modoDivision === 'personalizado'}
                          onChange={(e) => setModoDivision('personalizado')}
                          disabled={loading}
                        />
                        <span>Personalizado</span>
                      </label>
                    </div>

                    <div className="gasto-dividir-amigos">
                      {amigos.map((amigo) => {
                        const estaSeleccionado = amigosSeleccionados.includes(amigo.id)
                        const estaPagado = amigosPagados[amigo.id] || false
                        const montoPersonalizado = montosPersonalizados[amigo.id] || ''
                        const montoTotalNum = parseFloat(monto) || 0
                        const montoCalculado = modoDivision === 'iguales' && estaSeleccionado && montoTotalNum > 0
                          ? montoTotalNum / (amigosSeleccionados.length + 1)
                          : parseFloat(montoPersonalizado) || 0
                        
                        return (
                          <div key={amigo.id} className="gasto-dividir-amigo-item">
                            <label className="gasto-dividir-amigo-checkbox">
                              <input
                                type="checkbox"
                                checked={estaSeleccionado}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAmigosSeleccionados([...amigosSeleccionados, amigo.id])
                                    // Inicializar monto personalizado si está en modo personalizado
                                    if (modoDivision === 'personalizado') {
                                      const montoInicial = montoTotalNum > 0 
                                        ? (montoTotalNum / (amigosSeleccionados.length + 2)).toFixed(2)
                                        : '0'
                                      setMontosPersonalizados({
                                        ...montosPersonalizados,
                                        [amigo.id]: montoInicial
                                      })
                                    }
                                  } else {
                                    setAmigosSeleccionados(amigosSeleccionados.filter(id => id !== amigo.id))
                                    const nuevosPagados = { ...amigosPagados }
                                    delete nuevosPagados[amigo.id]
                                    setAmigosPagados(nuevosPagados)
                                    const nuevosMontos = { ...montosPersonalizados }
                                    delete nuevosMontos[amigo.id]
                                    setMontosPersonalizados(nuevosMontos)
                                  }
                                }}
                                disabled={loading}
                              />
                              <span className="gasto-dividir-amigo-nombre">{amigo.nombre}</span>
                            </label>
                            
                            {estaSeleccionado && (
                              <div className="gasto-dividir-amigo-opciones">
                                {modoDivision === 'personalizado' && (
                                  <div className="gasto-dividir-monto-input">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max={montoTotalNum}
                                      placeholder="0.00"
                                      value={montoPersonalizado}
                                      onChange={(e) => {
                                        const valor = e.target.value
                                        setMontosPersonalizados({
                                          ...montosPersonalizados,
                                          [amigo.id]: valor
                                        })
                                      }}
                                      disabled={loading}
                                      className="gasto-dividir-monto-field"
                                    />
                                    <span className="gasto-dividir-monto-currency">€</span>
                                  </div>
                                )}
                                
                                <label className="gasto-dividir-amigo-pagado">
                                  <input
                                    type="checkbox"
                                    checked={estaPagado}
                                    onChange={(e) => {
                                      setAmigosPagados({
                                        ...amigosPagados,
                                        [amigo.id]: e.target.checked
                                      })
                                    }}
                                    disabled={loading}
                                  />
                                  <span>Pagó</span>
                                </label>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    {amigosSeleccionados.length > 0 && (
                      <div className="gasto-dividir-hint">
                        {modoDivision === 'iguales' ? (
                          <p>
                            Se dividirá entre {amigosSeleccionados.length + 1} personas. 
                            Tu parte: <strong>{monto && amigosSeleccionados.length > 0 ? formatMonto(parseFloat(monto) / (amigosSeleccionados.length + 1)) : ''}</strong>
                            {Object.values(amigosPagados).some(p => !p) && ' Se enviará mensaje a los que no han pagado.'}
                          </p>
                        ) : (
                          <p>
                            {(() => {
                              const montoTotalCalculado = parseFloat(monto) || 0
                              const sumaAmigos = amigosSeleccionados.reduce((sum, id) => {
                                const montoStr = montosPersonalizados[id] || '0'
                                return sum + (parseFloat(montoStr) || 0)
                              }, 0)
                              const montoUsuarioPersonalizado = montoTotalCalculado - sumaAmigos
                              const sumaExcede = sumaAmigos > montoTotalCalculado
                              
                              return (
                                <>
                                  Tu parte: <strong className={sumaExcede ? 'gasto-dividir-error' : ''}>
                                    {formatMonto(montoUsuarioPersonalizado)}
                                  </strong>
                                  {sumaExcede && <span className="gasto-dividir-error-text"> (La suma excede el total)</span>}
                                  {!sumaExcede && Object.values(amigosPagados).some(p => !p) && ' Se enviará mensaje a los que no han pagado.'}
                                </>
                              )
                            })()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Guardando...' : gastoEditando ? 'Actualizar Gasto' : 'Agregar Gasto'}
              </button>
            </form>
          </div>

          {/* Lista de gastos - lado derecho */}
          <div className="gastos-list-card">
          <h2 className="gastos-list-title">
            Gastos Registrados ({gastos.length})
          </h2>
          
          {loadingGastos ? (
            <div className="gastos-list">
              <p className="gastos-empty">Cargando gastos...</p>
            </div>
          ) : errorGastos ? (
            <div className="gastos-list">
              <p className="gastos-empty" style={{ color: 'red' }}>
                Error: {errorGastos}
              </p>
              <button 
                onClick={loadGastos}
                className="btn btn-primary"
                style={{ marginTop: '10px' }}
              >
                Reintentar
              </button>
            </div>
          ) : gastos.length > 0 ? (
            <>
              <div className="gastos-list">
                {gastos.map((gasto, index) => {
                  const saldoInfo = getSaldoDisponibleHasta(gasto, index)
                  
                  return (
                    <div key={gasto.id} className="gasto-item">
                      <div className="gasto-item-content">
                        <div className="gasto-item-header">
                          <div className="gasto-item-left">
                            <h3 className="gasto-item-descripcion">{gasto.descripcion}</h3>
                            <span className="gasto-item-categoria">{gasto.categoria}</span>
                          </div>
                          <span className="gasto-item-monto">{formatMonto(gasto.monto)}</span>
                        </div>
                        <p className="gasto-item-fecha">{formatFecha(gasto.fecha)}</p>
                        
                        {/* Información de división del gasto */}
                        {gasto.dividido && gasto.dividido.length > 0 && (
                          <div className="gasto-dividido-info" style={{ 
                            marginTop: '8px', 
                            padding: '8px', 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: '4px',
                            fontSize: '0.9em'
                          }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#666' }}>
                              Dividido entre:
                            </p>
                            <ul style={{ margin: '0', paddingLeft: '20px', listStyle: 'disc' }}>
                              {gasto.dividido.map((item, idx) => (
                                <li key={idx} style={{ marginBottom: '2px' }}>
                                  <span>{item.amigoNombre}: {formatMonto(item.montoDividido)}</span>
                                  <span style={{ marginLeft: '8px', color: item.pagado ? '#28a745' : '#ffc107' }}>
                                    {item.pagado ? '✓ Pagado' : '⏳ Pendiente'}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Información del saldo disponible debajo de cada gasto */}
                        {saldoInfo && (
                          <div className={`gasto-saldo-info ${saldoInfo.excedido ? 'gasto-saldo-excedido' : ''}`}>
                            <span className="gasto-saldo-label">
                              {saldoInfo.excedido ? 'Excedido:' : 'Saldo disponible:'}
                            </span>
                            <span className={`gasto-saldo-value ${saldoInfo.excedido ? 'gasto-saldo-excedido-text' : 'gasto-saldo-disponible-text'}`}>
                              {formatMonto(Math.abs(saldoInfo.disponible))}
                            </span>
                            {saldoInfo.excedido && (
                              <span className="gasto-saldo-warning">⚠️</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(gasto)}
                          className="gasto-item-edit"
                          title="Editar gasto"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2em',
                            padding: '4px 8px'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(gasto.id)}
                          className="gasto-item-delete"
                          title="Eliminar gasto"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2em',
                            padding: '4px 8px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {total > 0 && (
                <div className="gastos-total">
                  <span className="gastos-total-label">Total del mes:</span>
                  <span className="gastos-total-amount">{formatMonto(total)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="gastos-list">
              <p className="gastos-empty">
                No hay gastos registrados para {nombreMes.toLowerCase()} aún.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
