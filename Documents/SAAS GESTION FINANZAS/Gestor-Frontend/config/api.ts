// Configuración de la API
// Centraliza la URL base del backend y configuración de endpoints

export const API_CONFIG = {
  // URL base del backend - debe ser configurada via variable de entorno
  // Según documentación: http://localhost:4444
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444',
  
  // Endpoints de autenticación
  // Formato: /api/auth/<endpoint>
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me', // Obtener usuario actual
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    USERS: {
      PROFILE: '/api/users/profile', // Obtener perfil
      UPDATE_PROFILE: '/api/users/profile', // Actualizar perfil
    },
    GASTOS: {
      GET_BY_MES: (mes: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/gastos/${mes}${query}` // Obtener gastos por mes (opcionalmente filtrado por cartera)
      },
      CREATE: '/api/gastos', // Crear gasto
      UPDATE: (id: string) => `/api/gastos/${id}`, // Actualizar gasto
      DELETE: (id: string) => `/api/gastos/${id}`, // Eliminar gasto
      GET_TOTAL: (mes: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/gastos/${mes}/total${query}` // Obtener total de gastos por mes (opcionalmente filtrado por cartera)
      },
      GET_BY_CATEGORIA: (mes: string, categoria: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/gastos/${mes}/categoria/${encodeURIComponent(categoria)}${query}` // Obtener gastos por categoría (opcionalmente filtrado por cartera)
      },
    },
    INGRESOS: {
      GET_BY_MES: (mes: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/ingresos/${mes}${query}` // Obtener ingresos por mes (opcionalmente filtrado por cartera)
      },
      CREATE: '/api/ingresos', // Crear ingreso
      UPDATE: (id: string) => `/api/ingresos/${id}`, // Actualizar ingreso
      DELETE: (id: string) => `/api/ingresos/${id}`, // Eliminar ingreso
      GET_TOTAL: (mes: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/ingresos/${mes}/total${query}` // Obtener total de ingresos por mes (opcionalmente filtrado por cartera)
      },
      GET_BY_CATEGORIA: (mes: string, categoria: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/ingresos/${mes}/categoria/${encodeURIComponent(categoria)}${query}` // Obtener ingresos por categoría (opcionalmente filtrado por cartera)
      },
    },
    CATEGORIAS: {
      GET_ALL: '/api/categorias', // Obtener todas las categorías
      GET_BY_TIPO: (tipo: string) => `/api/categorias/tipo/${tipo}`, // Obtener categorías por tipo (gastos, ingresos, ambos)
      CREATE: '/api/categorias', // Crear categoría
      UPDATE: (id: string) => `/api/categorias/${id}`, // Actualizar categoría
      DELETE: (id: string) => `/api/categorias/${id}`, // Eliminar categoría
    },
    AMIGOS: {
      GET_ALL: '/api/amigos', // Obtener todos los amigos (solo activos)
      GET_BY_ID: (id: string) => `/api/amigos/${id}`, // Obtener amigo por ID
      SEARCH: (query: string) => `/api/amigos/search?q=${encodeURIComponent(query)}`, // Buscar entre tus amigos
      SEARCH_USUARIOS: (query: string) => `/api/amigos/usuarios/search?q=${encodeURIComponent(query)}`, // Buscar usuarios del sistema (NUEVO)
      GET_BY_ESTADO: (estado: string) => `/api/amigos/estado/${estado}`, // Obtener amigos por estado
      CREATE: '/api/amigos', // Crear amigo (DEPRECADO - usar ENVIAR_SOLICITUD)
      ENVIAR_SOLICITUD: '/api/amigos/solicitud', // Enviar solicitud de amistad (NUEVO)
      GET_SOLICITUDES: '/api/amigos/solicitudes', // Obtener solicitudes recibidas (NUEVO)
      ACEPTAR_SOLICITUD: (id: string) => `/api/amigos/solicitud/${id}/aceptar`, // Aceptar solicitud (NUEVO)
      RECHAZAR_SOLICITUD: (id: string) => `/api/amigos/solicitud/${id}/rechazar`, // Rechazar solicitud (NUEVO)
      UPDATE: (id: string) => `/api/amigos/${id}`, // Actualizar amigo
      UPDATE_ESTADO: (id: string) => `/api/amigos/${id}/estado`, // Actualizar estado de amigo
      DELETE: (id: string) => `/api/amigos/${id}`, // Eliminar amigo
    },
    MENSAJES: {
      GET_ALL: (leido?: boolean) => leido !== undefined ? `/api/mensajes?leido=${leido}` : '/api/mensajes', // Obtener todos los mensajes (opcionalmente filtrado por leído)
      GET_BY_ID: (id: string) => `/api/mensajes/${id}`, // Obtener mensaje por ID
      CREATE: '/api/mensajes', // Crear mensaje
      MARK_AS_LEIDO: (id: string) => `/api/mensajes/${id}/leido`, // Marcar mensaje como leído
      MARK_ALL_AS_LEIDOS: '/api/mensajes/leer-todos', // Marcar todos los mensajes como leídos
      DELETE: (id: string) => `/api/mensajes/${id}`, // Eliminar mensaje
      DELETE_ALL: '/api/mensajes', // Eliminar todos los mensajes
    },
    CHAT: {
      GET_CHATS: '/api/chat/amigos', // Obtener lista de chats con amigos
      GET_MENSAJES: (amigoId: string) => `/api/chat/${amigoId}/mensajes`, // Obtener mensajes de un chat
      SEND_MENSAJE: (amigoId: string) => `/api/chat/${amigoId}/mensajes`, // Enviar mensaje en un chat
      MARK_AS_LEIDO: (amigoId: string) => `/api/chat/${amigoId}/leer`, // Marcar mensajes no leídos de un chat como leídos
      MARK_ALL_AS_LEIDOS: (amigoId: string) => `/api/chat/${amigoId}/leer-todos`, // Marcar TODOS los mensajes de un chat como leídos
    },
    NOTIFICACIONES: {
      GET_ALL: (params?: { leida?: boolean; tipo?: string }) => {
        const queryParams = new URLSearchParams()
        if (params?.leida !== undefined) {
          queryParams.append('leida', params.leida.toString())
        }
        if (params?.tipo) {
          queryParams.append('tipo', params.tipo)
        }
        const queryString = queryParams.toString()
        return `/api/notificaciones${queryString ? `?${queryString}` : ''}`
      }, // Obtener todas las notificaciones con filtros opcionales
      GET_BY_ID: (id: string) => `/api/notificaciones/${id}`, // Obtener notificación por ID
      GET_BY_TIPO: (tipo: string) => `/api/notificaciones/tipo/${tipo}`, // Obtener notificaciones por tipo
      CREATE: '/api/notificaciones', // Crear nueva notificación
      MARK_AS_LEIDA: (id: string) => `/api/notificaciones/${id}/leida`, // Marcar notificación como leída
      MARK_ALL_AS_LEIDAS: '/api/notificaciones/leer-todas', // Marcar todas las notificaciones como leídas
      DELETE: (id: string) => `/api/notificaciones/${id}`, // Eliminar notificación por ID
      DELETE_ALL: '/api/notificaciones', // Eliminar todas las notificaciones
    },
    PRESUPUESTOS: {
      GET_BY_MES: (mes: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/presupuestos/${mes}${query}` // Obtener presupuestos por mes (opcionalmente filtrado por cartera)
      },
      CREATE: '/api/presupuestos', // Crear o actualizar presupuesto (upsert)
      UPDATE: (id: string) => `/api/presupuestos/${id}`, // Actualizar presupuesto por ID
      DELETE: (mes: string, categoria: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/presupuestos/${mes}/${encodeURIComponent(categoria)}${query}` // Eliminar presupuesto por mes y categoría (opcionalmente filtrado por cartera)
      },
      GET_TOTAL: (mes: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/presupuestos/${mes}/total${query}` // Obtener total presupuestado del mes (opcionalmente filtrado por cartera)
      },
      GET_RESUMEN: (mes: string, carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/presupuestos/${mes}/resumen${query}` // Obtener resumen de presupuestos (opcionalmente filtrado por cartera)
      },
    },
    DASHBOARD: {
      RESUMEN: (carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/dashboard/resumen${query}` // Obtener resumen del mes actual (opcionalmente filtrado por cartera)
      },
      GASTOS_RECIENTES: (carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/dashboard/gastos-recientes${query}` // Obtener últimos 7 gastos del mes actual (opcionalmente filtrado por cartera)
      },
      GASTOS_CATEGORIA: (carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/dashboard/gastos-categoria${query}` // Obtener top 3 categorías con más gastos (opcionalmente filtrado por cartera)
      },
      COMPARATIVA: (carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/dashboard/comparativa${query}` // Comparativa mensual (opcionalmente filtrado por cartera)
      },
      ALERTAS: (carteraId?: string) => {
        const query = carteraId ? `?carteraId=${encodeURIComponent(carteraId)}` : ''
        return `/api/dashboard/alertas${query}` // Obtener alertas financieras (opcionalmente filtrado por cartera)
      },
    },
    CARTERAS: {
      GET_ALL: '/api/carteras', // Obtener todas las carteras del usuario
      GET_BY_ID: (id: string) => `/api/carteras/${id}`, // Obtener cartera por ID
      CREATE: '/api/carteras', // Crear cartera
      UPDATE: (id: string) => `/api/carteras/${id}`, // Actualizar cartera
      DELETE: (id: string, deleteData: boolean = false) => {
        const query = deleteData ? '?deleteData=true' : '?deleteData=false'
        return `/api/carteras/${id}${query}` // Eliminar cartera (opcionalmente eliminar datos asociados)
      },
      DEPOSITAR: (id: string) => `/api/carteras/${id}/depositar`, // Depositar en cartera
      RETIRAR: (id: string) => `/api/carteras/${id}/retirar`, // Retirar de cartera
      TRANSFERIR: '/api/carteras/transferir', // Transferir entre carteras
      GET_TRANSACCIONES: (id: string) => `/api/carteras/${id}/transacciones`, // Obtener transacciones de una cartera
      GET_SALDO: (id: string) => `/api/carteras/${id}/saldo`, // Obtener saldo actualizado de una cartera
      SINCRONIZAR: (id: string) => `/api/carteras/${id}/sincronizar`, // Sincronizar saldo con gastos/ingresos
    },
    ESTADISTICAS: {
      RESUMEN: '/api/estadisticas/resumen', // Obtener resumen de estadísticas por periodo
      TENDENCIAS: '/api/estadisticas/tendencias', // Obtener tendencias temporales con comparativa
      CATEGORIAS: '/api/estadisticas/categorias', // Obtener análisis por categorías
      COMPORTAMIENTO: '/api/estadisticas/comportamiento', // Obtener métricas de comportamiento
    }
  },
  
  // Timeout para requests (ms)
  TIMEOUT: 10000,
}

