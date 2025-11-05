# Milestone 3: Menú Desplegable de Perfil y Mejoras del Header

## Objetivo
Implementar un menú desplegable en el icono de perfil del header con opciones típicas de usuario, manteniendo los iconos de mensajes y notificaciones visibles en el header.

---

## 📝 Tareas

### 1. Implementar menú desplegable en el icono de perfil

**Archivo:** `components/Header.tsx`

- Agregar estado para controlar la visibilidad del menú
- Implementar funcionalidad de toggle (abrir/cerrar)
- Agregar funcionalidad de click fuera para cerrar automáticamente
- Crear estructura del menú con opciones típicas

**Características:**
- Menú desplegable al hacer clic en el icono de perfil
- Opciones: Perfil, Opciones, Amigos, Notificaciones, Mensajes y Cerrar sesión
- Iconos SVG minimalistas para cada opción
- Separador visual antes de "Cerrar sesión"
- Cierre automático al hacer click fuera del menú
- Cierre automático al seleccionar una opción

---

### 2. Mantener iconos de mensajes y notificaciones en el header

**Archivo:** `components/Header.tsx`

- Mantener los iconos de mensajes y notificaciones visibles en el header
- Los iconos deben estar alineados junto al icono de perfil
- Mantener la funcionalidad y estilos existentes

**Estructura del header:**
```
[Logo] ... [Icono Mensajes] [Icono Notificaciones] [Icono Perfil con menú]
```

---

### 3. Crear estilos para el menú desplegable

**Archivo:** `app/globals.css`

- Estilos para el contenedor del menú
- Estilos para los items del menú
- Efectos hover en cada item
- Estilo distintivo para la opción de logout
- Animación de apertura suave
- Diseño responsive

**Estilos necesarios:**
- `.profile-menu-container` - Contenedor relativo del menú
- `.profile-dropdown` - Menú desplegable
- `.profile-menu-item` - Items del menú
- `.profile-menu-item-danger` - Estilo para logout
- `.profile-menu-divider` - Separador visual

---

### 4. Agregar funcionalidad de click fuera

**Archivo:** `components/Header.tsx`

- Usar `useRef` para referenciar el contenedor del menú
- Implementar `useEffect` para detectar clicks fuera
- Cerrar el menú automáticamente cuando se hace click fuera

**Funcionalidad:**
- Event listener para eventos de mouse
- Limpieza del event listener al desmontar
- Detección precisa de clicks fuera del contenedor

---

## 🎨 Guía de Diseño

- **Fondo del menú:** #1e293b (gris azulado oscuro)
- **Borde:** #334155 (gris medio)
- **Hover:** Fondo #334155 con texto claro
- **Logout:** Color rojo (#ef4444) para indicar acción destructiva
- **Animación:** slideDown suave (0.2s ease-out)
- **Sombra:** Pronunciada para efecto de elevación
- **Iconos:** 18px, color gris (#94a3b8) que cambia a azul en hover

---

## 📁 Estructura de Archivos Creados/Modificados

```
components/
  ├── Header.tsx                    ✅ (modificado - menús desplegables agregados)
  └── PieChart.tsx                  ✅ (modificado - tooltips interactivos agregados)

lib/
  └── gastos.ts                     ✅ (modificado - interfaz Gasto actualizada con división de gastos)

app/
  ├── dashboard/
  │   ├── page.tsx                  ✅ (modificado - dashboard completo con métricas, gráficos, comparativas y alertas)
  │   ├── gastos/
  │   │   └── [mes]/
  │   │       └── page.tsx          ✅ (modificado - funcionalidad de dividir gastos con amigos y mensajes automáticos al chat)
  │   ├── chat/
  │   │   └── [amigoId]/
  │   │       └── page.tsx          ✅ (nuevo - página de chat individual con cada amigo)
  │   ├── amigos/
  │   │   └── page.tsx              ✅ (modificado - botón de chat agregado en cada tarjeta de amigo)
  │   ├── mensajes/
  │   │   └── page.tsx              ✅ (modificado - interfaz Mensaje actualizada con amigoId y esSistema)
  │   ├── notificaciones/
  │   │   └── page.tsx              ✅ (nuevo - página de notificaciones)
  │   └── perfil/
  │       └── page.tsx              ✅ (nuevo - página de perfil de usuario)
  └── globals.css                   ✅ (modificado - estilos de menús desplegables, mensajes, notificaciones, amigos, página de perfil, dashboard, división de gastos y chat)
```

---

## ✅ Checklist de Verificación

- [x] Menú desplegable implementado en el icono de perfil
- [x] Opciones del menú: Perfil, Opciones, Amigos, Notificaciones, Mensajes y Cerrar sesión
- [x] Iconos SVG agregados para cada opción
- [x] Separador visual antes de "Cerrar sesión"
- [x] Cierre automático al hacer click fuera del menú
- [x] Cierre automático al seleccionar una opción
- [x] Animación suave de apertura implementada
- [x] Iconos de mensajes y notificaciones mantenidos en el header
- [x] Estilos profesionales aplicados al menú
- [x] Diseño responsive para móviles
- [x] Página de perfil creada con avatar y nombre
- [x] Descripción del usuario implementada
- [x] Opciones del perfil con 6 tarjetas interactivas
- [x] Modo de edición para actualizar información
- [x] Persistencia de datos del perfil en localStorage
- [x] Menú desplegable en el icono de mensajes implementado
- [x] Menú desplegable en el icono de notificaciones implementado
- [x] Cierre automático de menús al hacer click fuera
- [x] Cierre automático al abrir otro menú
- [x] Página individual de mensajes creada
- [x] Página individual de notificaciones creada
- [x] Funcionalidad de filtros en ambas páginas
- [x] Persistencia de datos en localStorage
- [x] Página de amigos creada
- [x] Funcionalidad de agregar/eliminar amigos
- [x] Búsqueda y filtros de amigos
- [x] Gestión de estados de amigos (activo, pendiente, bloqueado)
- [x] Sidebar colapsable implementado
- [x] Colapso automático en páginas de perfil, amigos, mensajes y notificaciones
- [x] Botón toggle para expandir/colapsar manualmente
- [x] Tooltips en iconos cuando el sidebar está colapsado
- [x] Dashboard mejorado con resumen financiero completo
- [x] Métricas del mes actual (ingresos, gastos, balance, % gastado)
- [x] Gráfico circular de gastos por categorías con tooltips interactivos
- [x] Lista de gastos recientes
- [x] Comparativa mes anterior vs mes actual
- [x] Panel de alertas financieras dinámicas
- [x] Funcionalidad de dividir gastos con amigos implementada
- [x] Selección múltiple de amigos para dividir gastos
- [x] Cálculo automático de la parte del usuario según número de personas
- [x] Checkbox para marcar si cada amigo ya pagó
- [x] Mensajes automáticos para amigos que no han pagado
- [x] 3 amigos mock por defecto
- [x] Interfaz minimalista y discreta para dividir gastos
- [x] Sistema de chat individual por amigo implementado
- [x] Botón de chat agregado en cada tarjeta de amigo
- [x] Mensajes automáticos de deuda enviados al chat del amigo
- [x] Envío manual de mensajes en el chat
- [x] Interfaz de chat con mensajes diferenciados (tuyos, del amigo, del sistema)

---

## ✅ Tareas Implementadas

### 1. ✅ Menú Desplegable en el Icono de Perfil

**Archivo modificado:** `components/Header.tsx`

**Características implementadas:**
- Estado `isProfileMenuOpen` para controlar la visibilidad del menú
- Hook `useRef` para referenciar el contenedor del menú
- Función `toggleProfileMenu` para abrir/cerrar el menú
- Menú desplegable con 6 opciones:
  - **Perfil**: Enlace a `/dashboard/perfil` con icono de usuario
  - **Opciones**: Enlace a `/dashboard/opciones` con icono de configuración
  - **Amigos**: Enlace a `/dashboard/amigos` con icono de usuarios múltiples
  - **Notificaciones**: Enlace a `/dashboard/notificaciones` con icono de campana
  - **Mensajes**: Enlace a `/dashboard/mensajes` con icono de sobre
  - **Cerrar sesión**: Botón con funcionalidad de logout e icono de salida
- Separador visual (`profile-menu-divider`) antes de "Cerrar sesión"
- Cierre automático al hacer click fuera del menú
- Cierre automático al seleccionar cualquier opción

**Funcionalidad técnica:**
```tsx
const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)

// Cerrar menú cuando se hace click fuera
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsProfileMenuOpen(false)
    }
  }

  if (isProfileMenuOpen) {
    document.addEventListener('mousedown', handleClickOutside)
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [isProfileMenuOpen])
```

---

### 2. ✅ Iconos de Mensajes y Notificaciones Mantenidos

**Archivo modificado:** `components/Header.tsx`

**Características implementadas:**
- Iconos de mensajes y notificaciones mantenidos en el header
- Posicionados antes del icono de perfil
- Mantienen sus estilos y funcionalidad originales
- Alineados correctamente con el icono de perfil

**Estructura del header:**
```
[Logo] ... [Mensajes] [Notificaciones] [Perfil con menú]
```

**Iconos SVG:**
- Mensajes: Icono de sobre con contorno
- Notificaciones: Icono de campana con indicador
- Ambos con tamaño 24x24px y color gris claro (#cbd5e1)

---

### 3. ✅ Estilos del Menú Desplegable

**Archivo modificado:** `app/globals.css`

**Estilos implementados:**
- `.profile-menu-container`: Contenedor relativo para posicionamiento absoluto del menú
- `.profile-dropdown`: Menú desplegable con:
  - Posicionamiento absoluto a la derecha del icono
  - Fondo oscuro (#1e293b) con borde sutil (#334155)
  - Sombra pronunciada para efecto de elevación
  - Animación slideDown (0.2s ease-out)
  - Ancho mínimo de 220px
  - z-index alto (1000) para aparecer sobre otros elementos

- `.profile-menu-item`: Items del menú con:
  - Flexbox para alineación de icono y texto
  - Padding de 0.75rem 1rem
  - Transición suave en hover
  - Color de texto gris claro (#cbd5e1)
  - Hover effect con fondo #334155 y texto claro

- `.profile-menu-item svg`: Iconos SVG de 18px con color gris (#94a3b8) que cambia a azul en hover

- `.profile-menu-item-danger`: Estilo especial para logout con:
  - Color rojo (#ef4444) para indicar acción destructiva
  - Hover con fondo rojo translúcido
  - Mantiene el color rojo en todos los estados

- `.profile-menu-divider`: Separador visual de 1px con color #334155

**Animación:**
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### 4. ✅ Funcionalidad de Click Fuera

**Archivo modificado:** `components/Header.tsx`

**Implementación:**
- Hook `useRef` para referenciar el contenedor del menú
- `useEffect` que escucha eventos de mouse cuando el menú está abierto
- Función `handleClickOutside` que verifica si el click fue fuera del contenedor
- Limpieza automática del event listener al desmontar o cerrar el menú

**Lógica:**
```tsx
const menuRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsProfileMenuOpen(false)
    }
  }

  if (isProfileMenuOpen) {
    document.addEventListener('mousedown', handleClickOutside)
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [isProfileMenuOpen])
```

---

## 📝 Notas Técnicas

- El menú desplegable usa `position: absolute` para posicionarse relativo al icono de perfil
- Se usa `useRef` para referenciar el DOM y detectar clicks fuera
- El event listener se agrega solo cuando el menú está abierto para optimizar rendimiento
- La limpieza del event listener es importante para evitar memory leaks
- Los iconos SVG son minimalistas y consistentes con el diseño general
- El menú tiene un z-index alto (1000) para aparecer sobre otros elementos
- La animación slideDown mejora la experiencia de usuario
- El diseño es responsive y se adapta a diferentes tamaños de pantalla
- Los enlaces a las páginas de dashboard están preparados para futuras implementaciones
- El botón de logout mantiene la funcionalidad existente de cerrar sesión

---

### 5. ✅ Menús Desplegables en Iconos de Mensajes y Notificaciones

**Archivo modificado:** `components/Header.tsx`, `app/globals.css`

**Características implementadas:**
- Menú desplegable en el icono de mensajes
- Menú desplegable en el icono de notificaciones
- Ambos menús se abren al hacer click en sus respectivos iconos
- Cierre automático al hacer click fuera del menú
- Cierre automático cuando se abre otro menú (solo uno abierto a la vez)
- Estructura consistente con el menú de perfil

**Funcionalidad técnica:**
- Estados `isMessagesMenuOpen` e `isNotificationsMenuOpen` para controlar la visibilidad
- Hooks `useRef` para referenciar los contenedores de los menús
- `useEffect` mejorado para detectar clicks fuera de todos los menús
- Funciones `toggleMessagesMenu` y `toggleNotificationsMenu` para abrir/cerrar
- Cierre automático de otros menús al abrir uno nuevo

**Estilos implementados:**
- `.header-menu-container` - Contenedor para menús de mensajes y notificaciones
- `.header-dropdown` - Menú desplegable con scroll
- `.header-dropdown-header` - Encabezado con título y enlace "Ver todos"
- `.header-dropdown-content` - Contenido con scroll independiente
- `.header-dropdown-empty` - Estado vacío con icono y mensaje
- Diseño responsive y consistente con el menú de perfil

**Estructura de los menús:**
- Encabezado con título y enlace "Ver todos" que lleva a la página correspondiente
- Área de contenido con scroll para listar mensajes/notificaciones
- Estado vacío cuando no hay elementos nuevos
- Ancho mínimo de 320px y máximo de 400px
- Altura máxima de 500px con scroll interno

---

### 6. ✅ Páginas Individuales de Mensajes y Notificaciones

**Archivos creados:** `app/dashboard/mensajes/page.tsx`, `app/dashboard/notificaciones/page.tsx`

**Página de Mensajes - Características implementadas:**
- Vista de lista de mensajes con scroll independiente
- Vista detallada del mensaje seleccionado
- Filtros: "Todos" y "No leídos"
- Contador de mensajes no leídos
- Marcar mensajes como leídos automáticamente al abrirlos
- Eliminar mensajes individuales
- Badge "Nuevo" para mensajes no leídos
- Diseño responsive con layout de dos columnas (lista y detalle)
- Estado vacío cuando no hay mensajes

**Página de Notificaciones - Características implementadas:**
- Lista de notificaciones con diferentes tipos (info, success, warning, error)
- Iconos distintivos según el tipo de notificación
- Filtros: "Todas" y "No leídas"
- Contador de notificaciones no leídas
- Marcar notificaciones como leídas individualmente o todas a la vez
- Eliminar notificaciones individuales o todas
- Botón "Marcar todas como leídas"
- Botón "Eliminar todas" con confirmación
- Badge "Nueva" para notificaciones no leídas
- Estado vacío cuando no hay notificaciones
- Diseño responsive

**Funcionalidad técnica:**
- Interfaces TypeScript para `Mensaje` y `Notificacion`
- Funciones `getMensajes()`, `saveMensajes()`, `getNotificaciones()`, `saveNotificaciones()` para localStorage
- Estados para controlar filtros y selección de mensajes
- Verificación de autenticación con redirección a login si no está autenticado
- Formateo de fechas en español

**Estilos implementados:**
- `.mensajes-page` y `.notificaciones-page` - Contenedores principales
- `.mensajes-content` - Grid de dos columnas (lista y detalle)
- `.mensaje-item` - Items de mensajes con estados hover y seleccionado
- `.notificacion-item` - Items de notificaciones con colores según tipo
- `.btn-filtro` - Botones de filtro con estado activo
- Diseño responsive para móviles

---

### 7. ✅ Página de Amigos

**Archivo creado:** `app/dashboard/amigos/page.tsx`

**Características implementadas:**
- Lista de amigos con diseño de tarjetas
- Formulario para agregar nuevos amigos (nombre y email)
- Búsqueda de amigos por nombre o email
- Filtros por estado: Todos, Activos, Pendientes, Bloqueados
- Contadores de amigos por estado en los filtros
- Estados de amistad:
  - **Activo**: Amigo activo en la lista
  - **Pendiente**: Solicitud de amistad pendiente
  - **Bloqueado**: Amigo bloqueado
- Gestión de estados: cambiar entre activo, pendiente y bloqueado
- Eliminar amigos con confirmación
- Avatar con iniciales si no hay imagen de perfil
- Fecha de amistad mostrada en cada tarjeta
- Validación de email duplicado al agregar
- Estado vacío cuando no hay amigos
- Diseño responsive con grid de tarjetas

**Funcionalidad técnica:**
- Interface TypeScript `Amigo` con campos: id, nombre, email, avatar, fechaAmistad, estado
- Funciones `getAmigos()` y `saveAmigos()` para localStorage
- Función `getInitials()` para generar iniciales del nombre
- Búsqueda y filtrado en tiempo real
- Verificación de autenticación con redirección a login si no está autenticado
- Formateo de fechas en español

**Estilos implementados:**
- `.amigos-page` - Contenedor principal de la página
- `.amigos-grid` - Grid responsive de tarjetas de amigos
- `.amigo-card` - Tarjetas individuales con hover effects
- `.amigo-avatar-placeholder` - Avatar con iniciales y gradiente
- `.amigo-estado` - Badges de estado con colores distintivos
- `.amigos-search` - Barra de búsqueda con icono
- Diseño responsive para móviles

---

### 8. ✅ Sidebar Colapsable

**Archivo modificado:** `components/Sidebar.tsx`, `app/globals.css`

**Características implementadas:**
- Sidebar que se colapsa automáticamente en páginas específicas (perfil, amigos, mensajes, notificaciones, opciones)
- Botón toggle para expandir/colapsar manualmente el sidebar
- Modo colapsado: solo muestra iconos (70px de ancho)
- Modo expandido: muestra iconos y texto completo (250px de ancho)
- Tooltips en iconos cuando el sidebar está colapsado (al hacer hover)
- Transición suave entre estados (0.3s ease)
- Los desplegables de meses se ocultan automáticamente cuando está colapsado
- El contenido principal se ajusta automáticamente al ancho del sidebar

**Funcionalidad técnica:**
- Estado `isCollapsed` para controlar la visibilidad del sidebar
- Detección automática de rutas que requieren sidebar colapsado
- `useEffect` para actualizar el estado cuando cambia la ruta
- Función `toggleSidebar()` para cambio manual
- Clase CSS `.collapsed` aplicada condicionalmente
- Ajuste automático del margen del contenido principal

**Estilos implementados:**
- `.sidebar.collapsed` - Estado colapsado con ancho de 70px
- `.sidebar-toggle-btn` - Botón para expandir/colapsar
- Tooltips en hover cuando está colapsado usando `::after` con `attr(title)`
- Transiciones suaves para ancho y margen
- Ocultación de texto y desplegables cuando está colapsado

**Páginas con sidebar colapsado automáticamente:**
- `/dashboard/perfil`
- `/dashboard/amigos`
- `/dashboard/mensajes`
- `/dashboard/notificaciones`
- `/dashboard/opciones`

---

### 9. ✅ Página de Perfil de Usuario

**Archivo creado:** `app/dashboard/perfil/page.tsx`

**Características implementadas:**
- Página de perfil completa con avatar y nombre del usuario
- Descripción editable del usuario
- Sección de opciones del perfil con 6 tarjetas:
  - **Información Personal**: Actualizar información básica
  - **Seguridad**: Cambiar contraseña y configuración de seguridad
  - **Facturación**: Gestionar plan y métodos de pago
  - **Preferencias**: Configurar notificaciones y preferencias
  - **Privacidad**: Controlar quién puede ver la información
  - **Exportar Datos**: Descargar una copia de los datos
- Modo de edición para actualizar nombre y descripción
- Persistencia en localStorage
- Avatar con iniciales si no hay imagen de perfil
- Verificación de autenticación al cargar

**Funcionalidad técnica:**
- Estado `isEditing` para controlar el modo de edición
- Funciones `getPerfil()` y `savePerfil()` para manejar datos en localStorage
- Función `getInitials()` para generar iniciales del nombre
- Verificación de autenticación con redirección a login si no está autenticado

**Estilos implementados:**
- `.perfil-page` - Contenedor principal de la página
- `.perfil-card` - Card principal del perfil
- `.perfil-avatar-section` - Sección de avatar y nombre
- `.perfil-avatar-placeholder` - Avatar con iniciales
- `.perfil-options-grid` - Grid de opciones del perfil
- `.perfil-option-card` - Tarjetas de opciones con hover effects
- Diseño responsive para móviles

---

### 10. ✅ Dashboard Mejorado con Resumen Financiero Completo

**Archivo modificado:** `app/dashboard/page.tsx`, `components/PieChart.tsx`, `app/globals.css`

**Características implementadas:**

#### 1. Resumen del Mes Actual - Métricas en Sidebar
- **4 tarjetas de métricas** en sidebar vertical a la derecha:
  - **Ingresos**: Total de ingresos del mes actual con icono 💰
  - **Gastos**: Total de gastos del mes actual con icono 💸
  - **Balance**: Diferencia entre ingresos y gastos con icono 📈 (positivo) o 📉 (negativo)
  - **% Gastado**: Porcentaje de gastos sobre ingresos con icono 📊
- Tarjetas compactas y visuales con iconos y colores distintivos
- Formato de moneda en euros (EUR)
- Indicadores visuales para balance positivo/negativo

#### 2. Gráfico Circular de Gastos por Categorías
- **Gráfico circular interactivo** (pie chart) mostrando las 3 categorías con más gastos
- **Tooltips interactivos**: Al pasar el mouse sobre cada sección del gráfico, aparece un tooltip con:
  - Nombre de la categoría
  - Monto total gastado (formateado en euros)
  - Porcentaje del total
- **Efectos visuales**: Los segmentos tienen efecto hover (opacidad y borde más grueso)
- **Círculo central**: Muestra el total de gastos del mes
- **Tamaño**: 280px de diámetro para mejor visualización
- **Sin leyenda fija**: La información se muestra en tooltips al pasar el mouse, eliminando los recuadros de leyenda

#### 3. Lista de Gastos Recientes
- Lista de hasta 7 gastos más recientes del mes
- Ordenados por fecha descendente (más recientes primero)
- Cada gasto muestra:
  - Descripción del gasto
  - Categoría con badge
  - Monto formateado en euros
  - Fecha formateada (día y mes abreviado)
- Enlaces clickeables que llevan a la página de gastos del mes
- Estado vacío cuando no hay gastos recientes

#### 4. Comparativa Mes Anterior vs Mes Actual
- **Card de comparación** mostrando:
  - **Ingresos**: Comparación con el mes anterior con indicador de cambio (↑/↓) y porcentaje
  - **Gastos**: Comparación con el mes anterior con indicador de cambio (↑/↓) y porcentaje
  - **Balance**: Comparación con el mes anterior con indicador de cambio (↑/↓) y porcentaje
- **Colores indicativos**:
  - Verde para cambios positivos en ingresos y balance
  - Rojo para cambios negativos en ingresos y balance
  - Rojo para aumentos en gastos (negativo)
  - Verde para disminuciones en gastos (positivo)
- Solo se muestra si hay datos del mes anterior

#### 5. Panel de Alertas Financieras
- **Sistema dinámico de alertas** que se generan automáticamente según la situación financiera:
  - **Sin ingresos registrados**: Alerta informativa con link a registrar ingresos
  - **Presupuesto no configurado**: Alerta informativa con link a configurar presupuestos
  - **Presupuesto excedido**: Alerta de error por categoría con link a ver gastos
  - **Cerca del límite**: Alerta de advertencia cuando se alcanza el 80% del presupuesto
  - **Balance negativo**: Alerta de error cuando los gastos superan los ingresos
- **Tipos de alertas**:
  - **Info** (ℹ️): Información general
  - **Warning** (⚠️): Advertencias importantes
  - **Error** (🔴): Errores críticos
- Cada alerta tiene un enlace directo a la acción correspondiente
- Solo se muestra si hay alertas activas

**Funcionalidad técnica:**
- Importación de funciones de `lib/gastos.ts`, `lib/ingresos.ts`, `lib/presupuestos.ts`, `lib/distribucion.ts`
- Funciones helper:
  - `getMesActual()`: Obtiene el mes actual en formato para URL
  - `getNombreMesActual()`: Obtiene el nombre del mes actual
  - `getMesAnterior()`: Obtiene el mes anterior en formato para URL
  - `getNombreMesAnterior()`: Obtiene el nombre del mes anterior
  - `formatCurrency()`: Formatea montos en formato de moneda EUR
  - `calcularPorcentajeCambio()`: Calcula el porcentaje de cambio entre dos valores
- Estados para controlar:
  - Resumen del mes actual y anterior
  - Gastos recientes
  - Gastos por categorías para el gráfico
  - Presupuestos y total presupuestado
  - Alertas financieras
- Función `loadDashboardData()`: Carga todos los datos necesarios al iniciar
- Función `generarAlertas()`: Genera alertas dinámicamente basadas en los datos financieros
- Verificación de autenticación con redirección a login si no está autenticado

**Estilos implementados:**
- `.dashboard-page` - Contenedor principal del dashboard
- `.dashboard-container` - Contenedor interno con padding
- `.dashboard-header` - Encabezado con título y subtítulo
- `.dashboard-main-grid` - Grid principal (1fr 220px) para contenido y sidebar
- `.dashboard-content-grid` - Grid de contenido (0.85fr 1.15fr) para gráfico y lista
- `.dashboard-metrics-sidebar` - Sidebar vertical con métricas
- `.dashboard-metric-card` - Tarjetas de métricas compactas
- `.metric-icon` - Iconos de métricas con colores distintivos
- `.metric-value` - Valores de métricas con formato grande
- `.metric-positive` y `.metric-negative` - Colores para valores positivos/negativos
- `.dashboard-chart-card` - Card del gráfico circular
- `.dashboard-chart-container` - Contenedor del gráfico con tooltips
- `.dashboard-recent-card` - Card de gastos recientes
- `.dashboard-recent-list` - Lista de gastos recientes
- `.recent-item` - Items de gastos recientes con hover
- `.dashboard-comparison-card` - Card de comparación mensual
- `.comparison-grid` - Grid de comparación
- `.comparison-change` - Indicadores de cambio con colores
- `.dashboard-alerts-card` - Card de alertas financieras
- `.alerts-list` - Lista de alertas
- `.alert-item` - Items de alertas con colores según tipo
- `.dashboard-empty-state` - Estado vacío cuando no hay datos
- Diseño responsive para móviles

**Mejoras del PieChart:**
- **Tooltips interactivos** con `useState` para controlar hover
- Posicionamiento dinámico del tooltip siguiendo el cursor
- Estilos de tooltip con fondo oscuro, borde y sombra
- Flecha en el tooltip apuntando al segmento
- Efectos hover mejorados en los segmentos (opacidad y stroke-width)

**Layout del Dashboard:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard - Noviembre                    │
│              Resumen financiero del mes actual               │
├──────────────────────────┬──────────────────────────────────┤
│                          │  💰 Ingresos: €X,XXX            │
│  📊 Gastos por Categorías │  💸 Gastos: €X,XXX              │
│     [Gráfico Circular]   │  📈 Balance: €X,XXX             │
│                          │  📊 % Gastado: XX%               │
│                          │                                  │
│  📝 Gastos Recientes     │                                  │
│  • Gastos ordenados...   │                                  │
│                          │                                  │
├──────────────────────────┴──────────────────────────────────┤
│  📊 Comparativa: Octubre vs Noviembre                       │
│  Ingresos | Gastos | Balance (+/- %)                        │
├─────────────────────────────────────────────────────────────┤
│  ⚠️ Alertas Financieras                                     │
│  • Alertas dinámicas...                                     │
└─────────────────────────────────────────────────────────────┘
```

**Beneficios implementados:**
- **Vista completa del mes**: Todas las métricas importantes en un solo lugar
- **Visualización interactiva**: Gráfico circular con tooltips informativos
- **Análisis comparativo**: Comparación fácil con el mes anterior
- **Alertas proactivas**: Sistema de alertas que previene problemas financieros
- **Navegación rápida**: Enlaces directos a secciones relevantes
- **Diseño limpio**: Layout organizado sin leyendas fijas que ocupan espacio
- **Responsive**: Se adapta a diferentes tamaños de pantalla

---

### 11. ✅ Funcionalidad de Dividir Gastos con Amigos

**Archivos modificados:** `app/dashboard/gastos/[mes]/page.tsx`, `lib/gastos.ts`, `app/globals.css`

**Características implementadas:**

#### 1. Opción Minimalista para Dividir Gastos
- **Checkbox discreto** "Dividir con amigos" en un recuadro pequeño dentro del formulario
- Diseño minimalista que no interfiere con la creación de gastos
- Solo se muestra si hay amigos agregados
- Deshabilitado si no hay amigos disponibles

#### 2. Selección Múltiple de Amigos
- **Lista de checkboxes** para seleccionar múltiples amigos
- Cada amigo tiene su propio checkbox para seleccionarlo
- Scroll independiente si hay muchos amigos (max-height: 200px)
- Checkbox "Pagó" individual para cada amigo seleccionado
- Todos los amigos agregados son visibles (no solo los activos)

#### 3. Cálculo Automático de la Parte del Usuario
- **División equitativa** del gasto total entre todas las personas:
  - 1 amigo seleccionado: gasto total / 2 (usuario paga 1/2)
  - 2 amigos seleccionados: gasto total / 3 (usuario paga 1/3)
  - 3 amigos seleccionados: gasto total / 4 (usuario paga 1/4)
  - Y así sucesivamente...
- **Solo se guarda la parte del usuario** en el monto del gasto
- El monto total del gasto se divide entre (1 usuario + N amigos)
- Preview en tiempo real del monto que se guardará (tu parte)

#### 4. Gestión de Pagos
- **Checkbox "Pagó"** para cada amigo seleccionado
- Si está marcado: el amigo ya pagó su parte, no se envía mensaje
- Si no está marcado: se envía mensaje automático con lo que debe
- Cada amigo puede tener un estado de pago independiente

#### 5. Mensajes Automáticos de Deuda
- **Mensajes automáticos** creados para cada amigo que no ha pagado
- El mensaje incluye:
  - Nombre del amigo
  - Monto que debe (su parte del gasto)
  - Descripción del gasto
  - Fecha del recordatorio
- Los mensajes se guardan en localStorage como mensajes del sistema
- Remitente: "Sistema"
- Asunto: "Recordatorio de pago: [descripción del gasto]"

#### 6. Datos Mock de Amigos
- **3 amigos ficticios** creados automáticamente si no hay amigos:
  - Juan Pérez (juan.perez@example.com)
  - María García (maria.garcia@example.com)
  - Carlos López (carlos.lopez@example.com)
- Todos con estado "activo" por defecto
- Se inicializan automáticamente al cargar la página de gastos

#### 7. Almacenamiento de Información de División
- **Interfaz Gasto actualizada** para incluir información de división:
  - `dividido`: Array de objetos con información de cada amigo
  - Cada objeto contiene:
    - `amigoId`: ID del amigo
    - `amigoNombre`: Nombre del amigo
    - `montoDividido`: Parte del gasto que corresponde al amigo
    - `pagado`: Estado de pago (true/false)
- El monto del gasto refleja solo la parte del usuario

**Funcionalidad técnica:**
- Estados para controlar:
  - `dividirGasto`: Si la opción está activada
  - `amigosSeleccionados`: Array de IDs de amigos seleccionados
  - `amigosPagados`: Objeto con estado de pago por amigo (Record<string, boolean>)
  - `amigos`: Lista de todos los amigos disponibles
- Función `loadAmigos()`: Carga amigos desde localStorage, crea 3 amigos mock si no hay
- Función `crearMensajeDeuda()`: Crea mensajes automáticos para recordatorios de pago
- Actualización de `handleSubmit()` para:
  - Calcular el monto del usuario según la división
  - Crear información de división para cada amigo
  - Enviar mensajes automáticos a amigos que no han pagado
  - Guardar solo la parte del usuario en el gasto

**Estilos implementados:**
- `.gasto-dividir-container` - Contenedor principal minimalista con fondo oscuro
- `.gasto-dividir-toggle` - Checkbox principal para activar la división
- `.gasto-dividir-label` - Texto del checkbox
- `.gasto-dividir-opciones` - Contenedor de opciones cuando está activado
- `.gasto-dividir-amigos` - Lista de amigos con scroll independiente
- `.gasto-dividir-amigo-item` - Item de cada amigo con hover effect
- `.gasto-dividir-amigo-nombre` - Nombre del amigo
- `.gasto-dividir-amigo-pagado` - Checkbox "Pagó" para cada amigo
- `.gasto-dividir-hint` - Hint informativo con preview del monto y alerta de mensajes

**Ejemplo de uso:**
```
Gasto: 90€
Dividir con: Juan Pérez, María García

Cálculo:
- Total personas: 3 (usuario + 2 amigos)
- Parte del usuario: 90€ / 3 = 30€
- Parte de Juan: 30€
- Parte de María: 30€

Si María no ha pagado:
- Se guarda gasto de 30€ (solo la parte del usuario)
- Se crea mensaje automático para María con: "Debes pagar 30€ por el gasto..."
```

**Beneficios implementados:**
- **Gestión de gastos compartidos**: Fácil dividir gastos con amigos
- **Cálculo automático**: No necesitas calcular manualmente tu parte
- **Recordatorios automáticos**: Los amigos reciben mensajes automáticos si no han pagado
- **Diseño minimalista**: No complica la creación de gastos
- **Múltiples amigos**: Puedes dividir con varios amigos a la vez
- **Control de pagos**: Marca quién ya te pagó y quién no
- **Datos por defecto**: 3 amigos mock para probar la funcionalidad inmediatamente

---

### 12. ✅ Sistema de Chat Individual por Amigo

**Archivos creados/modificados:** `app/dashboard/chat/[amigoId]/page.tsx`, `app/dashboard/amigos/page.tsx`, `app/dashboard/gastos/[mes]/page.tsx`, `app/dashboard/mensajes/page.tsx`, `app/globals.css`

**Características implementadas:**

#### 1. Página de Chat Individual
- **Ruta dinámica**: `/dashboard/chat/[amigoId]` para cada amigo
- **Header del chat**: Muestra avatar, nombre y email del amigo
- **Botón de retroceso**: Regresa a la página de amigos
- **Área de mensajes**: Scroll independiente con todos los mensajes del chat
- **Formulario de envío**: Input y botón para enviar mensajes manualmente
- **Autenticación**: Redirige a login si no está autenticado
- **Validación**: Verifica que el amigo existe antes de cargar el chat

#### 2. Botón de Chat en Tarjetas de Amigos
- **Botón "Chat"** agregado en cada tarjeta de amigo en la página de amigos
- **Siempre visible**: Disponible para todos los amigos, independientemente de su estado
- **Icono de chat**: SVG moderno y minimalista
- **Link directo**: Navega directamente al chat del amigo
- **Estilo distintivo**: Color azul (#3b82f6) para diferenciarlo de otras acciones

#### 3. Sistema de Mensajes por Chat
- **Filtrado por amigo**: Cada chat muestra solo los mensajes de ese amigo específico
- **Campo `amigoId`**: Los mensajes incluyen el ID del amigo para filtrar
- **Campo `esSistema`**: Indica si es un mensaje automático del sistema
- **Ordenamiento**: Los mensajes se ordenan por fecha (más antiguos primero)
- **Scroll automático**: Se desplaza automáticamente al final cuando hay nuevos mensajes

#### 4. Mensajes Automáticos de Deuda en el Chat
- **Integración con división de gastos**: Cuando se divide un gasto y el amigo no ha pagado, el mensaje automático se envía directamente al chat del amigo
- **Mensaje del sistema**: Los recordatorios de pago aparecen como mensajes del sistema en el chat
- **Estilo distintivo**: Los mensajes del sistema tienen un estilo especial (borde punteado, fondo semitransparente)
- **Información completa**: Incluye nombre del amigo, monto que debe, descripción del gasto y fecha

#### 5. Envío Manual de Mensajes
- **Formulario de envío**: Input de texto y botón de envío en la parte inferior del chat
- **Validación**: No permite enviar mensajes vacíos
- **Estados de carga**: Muestra estado de carga mientras se envía el mensaje
- **Actualización inmediata**: Los mensajes aparecen inmediatamente después de enviarse
- **Persistencia**: Todos los mensajes se guardan en localStorage

#### 6. Interfaz de Mensajes Diferenciada
- **Mensajes propios**: Aparecen a la derecha con fondo azul (#3b82f6)
- **Mensajes del amigo**: Aparecen a la izquierda con fondo oscuro
- **Mensajes del sistema**: Aparecen centrados con estilo distintivo (borde punteado azul)
- **Fechas formateadas**: 
  - Si es hoy: Solo muestra la hora (ej: "14:30")
  - Si es otro día: Muestra fecha y hora (ej: "15 Nov, 14:30")
- **Animación**: Los mensajes aparecen con animación fadeIn suave

#### 7. Funcionalidad Técnica
- **Interfaz Mensaje actualizada**:
  - `amigoId?: string` - ID del amigo si es un mensaje de chat
  - `esSistema?: boolean` - Si es un mensaje automático del sistema
- **Función `crearMensajeDeuda` actualizada**: Ahora recibe y guarda el `amigoId` del amigo
- **Función `getAmigo(amigoId)`**: Obtiene la información del amigo desde localStorage
- **Función `loadMensajes()`**: Filtra y carga solo los mensajes del chat actual
- **Función `enviarMensaje()`**: Crea y guarda nuevos mensajes en el chat
- **Función `formatFecha()`**: Formatea las fechas de manera legible

**Estilos implementados:**
- `.chat-page` - Página completa del chat
- `.chat-container` - Contenedor principal con altura completa
- `.chat-header` - Header con información del amigo
- `.chat-back-btn` - Botón para regresar a amigos
- `.chat-avatar`, `.chat-avatar-image`, `.chat-avatar-placeholder` - Avatar del amigo
- `.chat-title`, `.chat-subtitle` - Nombre y email del amigo
- `.chat-messages-container` - Contenedor scrollable de mensajes
- `.chat-messages` - Lista de mensajes
- `.chat-message` - Mensaje individual
- `.chat-message-mio` - Estilo para mensajes propios (derecha, azul)
- `.chat-message-sistema` - Estilo para mensajes del sistema (centrado, borde punteado)
- `.chat-message-content` - Contenedor del contenido del mensaje
- `.chat-message-text`, `.chat-message-fecha`, `.chat-message-remitente` - Elementos del mensaje
- `.chat-form` - Formulario de envío
- `.chat-input` - Input de texto
- `.chat-send-btn` - Botón de envío
- `.chat-empty` - Estado vacío cuando no hay mensajes
- `.btn-link-chat` - Estilo del botón de chat en tarjetas de amigos
- Animación `fadeIn` para mensajes nuevos
- Media queries responsive para móviles

**Flujo de uso:**
```
1. Usuario va a "Amigos"
2. Click en botón "Chat" de un amigo
3. Se abre el chat individual del amigo
4. Puede:
   - Ver mensajes previos (incluyendo recordatorios de pago automáticos)
   - Enviar nuevos mensajes manualmente
   - Ver mensajes del sistema (recordatorios de deuda)
5. Al dividir un gasto con ese amigo (si no ha pagado):
   - Se crea automáticamente un mensaje en el chat del amigo
   - El mensaje aparece como "Sistema" con el recordatorio de pago
```

**Beneficios implementados:**
- **Comunicación directa**: Chat individual con cada amigo para comunicación personalizada
- **Integración con gastos**: Los recordatorios de pago aparecen automáticamente en el chat correspondiente
- **Historial de conversación**: Todos los mensajes se guardan y se pueden revisar
- **UX intuitiva**: Interfaz similar a aplicaciones de mensajería modernas
- **Mensajes diferenciados**: Fácil distinguir entre tus mensajes, mensajes del amigo y mensajes del sistema
- **Acceso rápido**: Botón de chat visible en cada tarjeta de amigo
- **Responsive**: Funciona perfectamente en móviles y desktop

---

## 🚀 Próximos Pasos Sugeridos

- Implementar las páginas de Opciones
- Agregar funcionalidad de subir imagen de perfil
- Agregar contadores de notificaciones y mensajes no leídos en los iconos
- Implementar funcionalidad de notificaciones en tiempo real
- Agregar más gráficos al dashboard (líneas de tendencia, barras)
- Implementar exportación de datos del dashboard
- Agregar filtros de fecha personalizados al dashboard
- Implementar sistema de preferencias de usuario
- Agregar opciones de privacidad y seguridad
- Implementar funcionalidad de exportar datos
- Considerar agregar más opciones al menú según necesidades

---

## 📊 Estructura Visual del Header

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Gestor Finanzas    [Mensajes] [Notificaciones] [Perfil▼] │
└─────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
                                    ┌───────────────────────────┐
                                    │ 👤 Perfil                │
                                    │ ⚙️ Opciones              │
                                    │ 👥 Amigos                │
                                    │ 🔔 Notificaciones        │
                                    │ ✉️ Mensajes              │
                                    │ ─────────────────────    │
                                    │ 🚪 Cerrar sesión         │
                                    └───────────────────────────┘
```

---

## ✅ Beneficios Implementados

- **Navegación mejorada**: Acceso rápido a funciones importantes del usuario
- **UX mejorada**: Menú intuitivo y fácil de usar
- **Consistencia visual**: Iconos y estilos consistentes con el resto de la aplicación
- **Accesibilidad**: Funcionalidad de click fuera para cerrar el menú
- **Responsive**: Diseño que se adapta a diferentes tamaños de pantalla
- **Mantenibilidad**: Código limpio y bien estructurado
- **Extensibilidad**: Fácil agregar más opciones al menú en el futuro

