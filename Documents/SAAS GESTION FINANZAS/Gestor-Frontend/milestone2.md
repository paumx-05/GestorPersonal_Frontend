# Milestone 2: Menú Vertical y Gestión de Gastos Mensuales

## Objetivo
Implementar un menú vertical lateral (sidebar) con todas las opciones de la aplicación, comenzando con la funcionalidad de "Pasar Gastos Mensuales" que incluye un desplegable con todos los meses del año.

---

## 📝 Tareas

### 1. Crear componente Sidebar con menú vertical

**Archivo:** `components/Sidebar.tsx`

- Crear componente Sidebar simple en la carpeta `components`
- Menú vertical fijo en la parte izquierda de la pantalla
- Estilos consistentes con el diseño oscuro de la aplicación
- Diseño responsive que se adapte a móviles (puede ocultarse o convertirse en hamburguesa)

**Características:**
- Fondo oscuro (#1e293b) con bordes sutiles
- Ancho fijo para desktop (ej: 250px)
- Logo o título en la parte superior
- Lista de opciones de menú debajo
- Estados hover para los items del menú

---

### 2. Implementar sección de Gastos Mensuales con desplegable

**Archivo:** `components/Sidebar.tsx`

- Agregar opción "Gastos Mensuales" en el sidebar
- Implementar funcionalidad de desplegable (expandir/colapsar)
- Mostrar todos los meses del año cuando se expande
- Cada mes debe ser clickeable y navegable
- Usar iconos o indicadores visuales para el estado expandido/colapsado

**Estructura:**
- Opción principal "Gastos Mensuales" con icono
- Al hacer clic, se despliega lista de 12 meses
- Meses: Enero, Febrero, Marzo, Abril, Mayo, Junio, Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre
- Cada mes debe ser un enlace a su página correspondiente

---

### 3. Crear layout con sidebar para el dashboard

**Archivo:** `app/dashboard/page.tsx` o `app/dashboard/layout.tsx`

- Modificar el dashboard para incluir el sidebar
- Layout con sidebar a la izquierda y contenido principal a la derecha
- El sidebar debe estar presente en todas las páginas del dashboard
- Asegurar que el contenido principal tenga padding adecuado

**Estructura:**
```
[Sidebar] | [Contenido Principal]
```

---

### 4. Crear página de gastos por mes

**Archivo:** `app/dashboard/gastos/[mes]/page.tsx` o similar

- Crear estructura de rutas para los diferentes meses
- Página simple que muestre el mes seleccionado
- Formulario o interfaz para agregar gastos mensuales
- Diseño consistente con el resto de la aplicación

**Características:**
- Ruta dinámica para cada mes
- Título mostrando el mes actual
- Formulario básico para agregar gastos (nombre, monto, fecha)
- Lista de gastos agregados (mock por ahora)

---

### 5. Agregar estilos para sidebar y contenido principal

**Archivo:** `app/globals.css`

- Estilos para el sidebar (fondo, bordes, hover effects)
- Estilos para items del menú (activos, hover, expandidos)
- Estilos para el desplegable de meses
- Layout flexbox o grid para sidebar + contenido
- Responsive design para móviles

**Estilos necesarios:**
- `.sidebar` - Contenedor del sidebar
- `.sidebar-item` - Items del menú
- `.sidebar-item-active` - Item activo
- `.sidebar-dropdown` - Contenedor del desplegable
- `.sidebar-subitem` - Items del desplegable (meses)
- `.main-content-with-sidebar` - Contenedor principal con sidebar

---

## 🎨 Guía de Diseño

- **Ancho del sidebar:** 250px en desktop
- **Colores:** Usar la misma paleta oscura (#1e293b, #0f172a, etc.)
- **Iconos:** Usar emojis simples para mantenerlo simple
- **Hover effects:** Suaves y consistentes con el resto de la app
- **Estado activo:** Indicar claramente qué sección está seleccionada

---

## 📁 Estructura de Archivos

```
components/
  └── Sidebar.tsx      (nuevo)

app/
  ├── dashboard/
  │   ├── layout.tsx   (nuevo - incluye sidebar)
  │   ├── page.tsx     (modificar - dashboard principal)
  │   └── gastos/
  │       └── [mes]/
  │           └── page.tsx  (nuevo - página de gastos por mes)

app/
  └── globals.css      (modificar - estilos sidebar)
```

---

## ✅ Checklist de Verificación

- [x] Sidebar creado con menú vertical
- [x] Sección "Gastos Mensuales" agregada
- [x] Desplegable de meses funcional
- [x] Todos los meses del año listados
- [x] Navegación a páginas de cada mes funcionando
- [x] Layout con sidebar implementado en dashboard
- [x] Página de gastos por mes creada
- [x] Estilos responsive para móviles
- [x] Diseño consistente con el resto de la aplicación
- [x] Sistema de categorías implementado
- [x] Campo de categoría en formulario de gastos
- [x] Visualización de categorías en lista de gastos
- [x] Funciones auxiliares para métricas por categorías
- [x] Datos mock actualizados con categorías
- [x] Opción "Distribución" agregada en sidebar
- [x] Funciones utilitarias para distribución mensual por categorías
- [x] Página de distribución mensual con selector de mes
- [x] Visualización de distribución por categorías con porcentajes
- [x] Selector de mes funcional
- [x] Tabla de distribución con resumen mensual
- [x] Opción "Ingresos Mensuales" agregada en sidebar
- [x] Desplegable de meses para ingresos funcional
- [x] Páginas dinámicas de ingresos por mes creadas
- [x] Formulario de agregar ingresos con categorías
- [x] Lista de ingresos con persistencia en localStorage
- [x] Estilos para sección de ingresos implementados
- [x] Opción "Tus Categorías" agregada en sidebar
- [x] Sistema CRUD de categorías personalizadas implementado
- [x] Integración de categorías personalizadas en gastos
- [x] Integración de categorías personalizadas en ingresos
- [x] Integración de categorías personalizadas en distribución
- [x] Conexión entre gastos y distribución de presupuestos
- [x] Visualización de presupuesto restante por categoría
- [x] Alertas cuando se excede el presupuesto

---

## ✅ Tareas Implementadas

### 1. ✅ Componente Sidebar creado

**Archivo creado:** `components/Sidebar.tsx`

**Características implementadas:**
- Sidebar fijo en la parte izquierda (250px de ancho)
- Header con título "Gestor Finanzas"
- Menú vertical con opciones navegables
- Opción "Dashboard" que lleva a la página principal
- Opción "Gastos Mensuales" con funcionalidad de desplegable
- Estados activos e hover para mejor UX
- Diseño responsive que se adapta a móviles

**Funcionalidades:**
- Detección automática de ruta activa usando `usePathname`
- Estado expandido/colapsado para el desplegable de gastos
- Animación suave al expandir/colapsar

---

### 2. ✅ Sección de Gastos Mensuales con desplegable

**Archivo modificado:** `components/Sidebar.tsx`

**Características implementadas:**
- Botón "Gastos Mensuales" con icono 💰
- Flecha indicadora que rota al expandir/colapsar
- Desplegable con los 12 meses del año:
  - Enero, Febrero, Marzo, Abril, Mayo, Junio
  - Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre
- Cada mes es un enlace navegable
- Estados activos para indicar el mes seleccionado
- Animación de desplegable suave

---

### 3. ✅ Layout del Dashboard con Sidebar

**Archivo creado:** `app/dashboard/layout.tsx`

**Características implementadas:**
- Layout que envuelve todas las páginas del dashboard
- Sidebar incluido automáticamente en todas las rutas del dashboard
- Contenido principal con margen izquierdo para compensar el sidebar
- Estructura flexible que permite agregar más páginas fácilmente

---

### 4. ✅ Páginas de Gastos por Mes

**Archivo creado/modificado:** `app/dashboard/gastos/[mes]/page.tsx`

**Características implementadas:**
- Ruta dinámica para cada mes usando `[mes]` en Next.js
- Página que detecta automáticamente el mes seleccionado
- Header con título dinámico mostrando el mes
- Formulario para agregar nuevos gastos:
  - Campo de descripción
  - Campo de monto (número decimal)
  - Campo de fecha
  - Campo de categoría (select obligatorio)
- **Integración con Distribución de Presupuestos:**
  - Muestra el saldo disponible o excedido debajo de cada gasto en la lista
  - Calcula el saldo acumulativo hasta cada gasto (en orden cronológico)
  - Indica cuánto queda disponible del presupuesto después de cada gasto
  - Alerta visual cuando se excede el presupuesto (indicador rojo y símbolo ⚠️)
  - Solo se muestra para categorías que tienen presupuesto asignado
- Lista de gastos con funcionalidad completa:
  - Muestra todos los gastos del mes
  - **Ordenamiento automático por fecha**: Los gastos se ordenan automáticamente de más antiguos a más recientes (más antiguos arriba, más recientes abajo, independientemente del orden en que se agreguen)
  - Visualización de categoría con badge
  - Botón para eliminar gastos
  - Total del mes calculado automáticamente
- Persistencia en localStorage
- Verificación de autenticación al cargar

**Mapeo de meses:**
- Convierte valores de URL (ej: "enero") a nombres completos ("Enero")
- Soporta todos los 12 meses del año

---

### 5. ✅ Estilos Completos

**Archivo modificado:** `app/globals.css`

**Estilos implementados:**
- Sidebar con fondo oscuro (#1e293b) y bordes sutiles
- Items del menú con estados hover y active
- Desplegable con animación slideDown
- Subitems (meses) con indentación y estilos propios
- Layout flexbox para sidebar + contenido principal
- Estilos responsive para móviles (sidebar más estrecho)
- Páginas de gastos con formularios y cards consistentes

**Clases CSS creadas:**
- `.sidebar` - Contenedor principal del sidebar
- `.sidebar-item` - Items del menú principal
- `.sidebar-item.active` - Item activo
- `.sidebar-dropdown` - Contenedor del desplegable
- `.sidebar-subitem` - Items del desplegable (meses)
- `.dashboard-layout` - Layout con sidebar
- `.dashboard-main-content` - Contenido principal
- `.gastos-page` - Página de gastos
- `.gastos-form-card` - Card del formulario
- `.gastos-list-card` - Card de la lista
- `.gasto-item-categoria` - Badge de categoría en gastos
- `.gasto-item-left` - Contenedor izquierdo del item de gasto
- `.distribucion-page` - Página de distribución
- `.distribucion-controls` - Contenedor de selectores
- `.control-select` - Selector de periodo/año
- `.distribucion-resumen` - Resumen general
- `.distribucion-table` - Tabla de distribución
- `.table-header` - Encabezado de tabla
- `.table-row` - Fila de tabla

---

## 📁 Estructura de Archivos Creados/Modificados

```
components/
  ├── Sidebar.tsx                    ✅ (modificado - agregada opción Distribución, Ingresos y Categorías)
  └── PieChart.tsx                   ✅ (nuevo - componente de gráfica circular)

app/
  ├── dashboard/
  │   ├── layout.tsx                 ✅ (nuevo - layout con sidebar)
  │   ├── page.tsx                   ✅ (sin cambios, funciona con nuevo layout)
  │   ├── distribucion/
  │   │   └── page.tsx               ✅ (nuevo - página de distribución de gastos)
  │   ├── gastos/
  │   │   └── [mes]/
  │   │       └── page.tsx           ✅ (modificado - integración con categorías personalizadas)
  │   ├── ingresos/
  │   │   └── [mes]/
  │   │       └── page.tsx           ✅ (modificado - integración con categorías personalizadas)
  │   └── categorias/
  │       └── page.tsx                ✅ (nuevo - página de gestión de categorías)

lib/
  ├── gastos.ts                      ✅ (modificado - tipo Gasto con categoría y funciones auxiliares)
  ├── ingresos.ts                    ✅ (modificado - funciones para manejar ingresos)
  ├── distribucion.ts                ✅ (nuevo - funciones para agrupar gastos por periodos)
  ├── presupuestos.ts                ✅ (nuevo - funciones para manejar presupuestos mensuales)
  └── categorias.ts                  ✅ (nuevo - funciones para manejar categorías personalizadas)

app/
  └── globals.css                     ✅ (modificado - estilos sidebar, gastos, ingresos, categorías, distribución y presupuestos)
```

---

## 📝 Notas Técnicas

- El sidebar es un componente client-side ('use client') para manejar el estado del desplegable
- Se usa `useState` para controlar qué sección está expandida (gastosOpen)
- Los meses usan rutas dinámicas con `[mes]` en Next.js App Router
- El componente `usePathname` detecta automáticamente la ruta activa para resaltar items
- El layout del dashboard se aplica a todas las rutas dentro de `/dashboard/*`
- El sidebar está fijo en la izquierda y el contenido principal tiene margen para compensarlo
- Los estilos usan la misma paleta de colores oscuros del resto de la aplicación
- El código es simple sin over-engineering, fácil de entender y extender
- Comentarios claros en funciones esenciales para facilitar el aprendizaje
- Las animaciones usan CSS keyframes para transiciones suaves
- El diseño es responsive y se adapta a pantallas móviles
- Los gastos se guardan en localStorage con estructura completa incluyendo categoría
- El sistema de categorías permite futuras métricas y análisis sin modificar la estructura de datos
- Las funciones auxiliares están preparadas para generar reportes y gráficos por categorías
- La distribución de gastos agrupa automáticamente todos los gastos de todos los meses
- Las funciones de distribución calculan semanas, trimestres y cuatrimestres basándose en las fechas de los gastos
- El sistema filtra automáticamente por año para mostrar solo los gastos relevantes

---

### 6. ✅ Sistema de Categorías para Gastos

**Archivos modificados:** `lib/gastos.ts`, `app/dashboard/gastos/[mes]/page.tsx`

**Características implementadas:**
- 10 categorías predefinidas para clasificar gastos:
  - Alimentación, Transporte, Vivienda, Servicios, Entretenimiento
  - Salud, Educación, Compras, Restaurantes, Otros
- Campo de categoría obligatorio en el formulario de agregar gastos
- Select dropdown con todas las categorías disponibles
- Visualización de categoría en cada gasto con badge distintivo
- Datos mock actualizados con categorías asignadas

**Funciones auxiliares para métricas futuras:**
- `getGastosPorCategoria()`: Obtiene todos los gastos de una categoría específica
- `getTotalPorCategoria()`: Calcula el total de gastos por categoría
- `getResumenPorCategorias()`: Genera un resumen completo con totales por cada categoría
- `getPresupuestoPorCategoria()`: Obtiene el presupuesto asignado a una categoría específica

**Beneficios:**
- Estructura de datos preparada para análisis por categorías
- Facilita la creación de métricas y resúmenes futuros
- Permite filtrar y agrupar gastos por tipo
- Base sólida para gráficos y reportes por categoría
- **Control de presupuestos en tiempo real:** Los usuarios pueden ver cuánto han gastado y cuánto les queda disponible en cada categoría mientras registran gastos

---

### 7. ✅ Sección de Distribución de Presupuestos Mensuales

**Archivos creados/modificados:** `lib/presupuestos.ts`, `app/dashboard/distribucion/page.tsx`, `components/PieChart.tsx`, `components/Sidebar.tsx`, `app/globals.css`

**Características implementadas:**
- Opción "Distribución" agregada en el sidebar con icono 📊
- Página de distribución de presupuestos mensuales con selector de mes
- Gráfica circular (pie chart) interactiva para visualizar distribución de presupuestos
- Sistema de presupuestos por categorías para cada mes
- Selector de mes con los 12 meses del año
- Formulario para agregar/editar presupuestos con dos modos:
  - **Modo Monto (€)**: Definir presupuesto directamente en euros
  - **Modo Porcentaje (%)**: Definir presupuesto como porcentaje del total de ingresos
- Conversión automática entre monto y porcentaje
- Visualización en gráfica circular con:
  - Segmentos de colores distintos para cada categoría
  - Porcentajes mostrados en cada segmento (si > 5%)
  - Círculo central mostrando el total presupuestado
  - Leyenda detallada con categoría, monto y porcentaje
  - **Sobrante automático como "Ahorro"**: El dinero no presupuestado aparece automáticamente como categoría "Ahorro" en la gráfica (color verde especial)
- Resumen general con:
  - Total de ingresos del mes
  - Total presupuestado
  - Ahorro/Disponible (ingresos - presupuestos) con color indicativo
  - Porcentaje del total de ingresos que está presupuestado
- Lista de presupuestos configurados con opciones de editar y eliminar
- Persistencia en localStorage

**Funciones utilitarias creadas:**
- `getPresupuestos(mes)`: Obtiene todos los presupuestos de un mes
- `setPresupuesto(mes, categoria, monto, totalIngresos)`: Agrega o actualiza un presupuesto
- `deletePresupuesto(mes, categoria)`: Elimina un presupuesto
- `getTotalPresupuestos(mes)`: Calcula el total de presupuestos del mes
- `actualizarPorcentajes(mes, totalIngresos)`: Actualiza porcentajes cuando cambian los ingresos
- `savePresupuestos(mes, presupuestos)`: Guarda presupuestos en localStorage

**Componente PieChart:**
- Gráfica circular SVG personalizada
- Colores automáticos para cada categoría
- Etiquetas de porcentaje en segmentos visibles
- Círculo central con total presupuestado
- Leyenda interactiva con información detallada
- Diseño responsive y profesional

**Interfaz de usuario:**
- Layout horizontal: gráfica a la izquierda, formulario a la derecha
- Formulario sticky para fácil acceso
- Selector de modo (Monto/Porcentaje) con radio buttons
- Vista previa en tiempo real de conversión (monto ↔ porcentaje)
- Lista de presupuestos con acciones rápidas (editar/eliminar)
- Resumen destacado con información clave
- Diseño limpio y profesional
- Mensaje cuando no hay presupuestos configurados

**Beneficios:**
- Planificación visual de gastos por categorías
- Definición flexible de presupuestos (monto o porcentaje)
- Visualización clara de distribución presupuestaria
- Control automático de ahorro (el sobrante se muestra como "Ahorro" en la gráfica)
- Facilita identificar si se está sobre-presupuestando
- Visualización inmediata de cuánto se está ahorrando cada mes
- Base para comparar presupuestos vs gastos reales en el futuro

---

### 8. ✅ Sección de Gestión de Categorías Personalizadas

**Archivos creados/modificados:** `lib/categorias.ts`, `app/dashboard/categorias/page.tsx`, `components/Sidebar.tsx`, `app/dashboard/gastos/[mes]/page.tsx`, `app/dashboard/ingresos/[mes]/page.tsx`, `app/dashboard/distribucion/page.tsx`, `app/globals.css`

**Características implementadas:**
- Opción "Tus Categorías" agregada en el sidebar con icono 🏷️
- Página de gestión completa de categorías personalizadas
- Sistema CRUD (Crear, Leer, Actualizar, Eliminar) para categorías
- Tres tipos de categorías:
  - **Solo Gastos**: Categorías exclusivas para gastos
  - **Solo Ingresos**: Categorías exclusivas para ingresos
  - **Gastos e Ingresos**: Categorías que se pueden usar en ambos
- Formulario para crear/editar categorías con:
  - Campo de nombre
  - Selector de tipo (Gastos/Ingresos/Ambos)
  - Validación de nombres duplicados
- Visualización de categorías agrupadas por tipo:
  - Sección de categorías de gastos
  - Sección de categorías de ingresos
  - Grid responsive con cards de categorías
- Acciones rápidas en cada categoría:
  - Botón de editar
  - Botón de eliminar con confirmación
- **Navegación rápida**: Click en cualquier categoría lleva directamente al mes actual (Noviembre) en la sección correspondiente (Gastos o Ingresos)
- Preselección automática de la categoría al llegar desde "Tus Categorías"
- Integración completa:
  - Las categorías creadas aparecen automáticamente en el formulario de gastos
  - Las categorías creadas aparecen automáticamente en el formulario de ingresos
  - Las categorías creadas aparecen en el selector de distribución de presupuestos
- Inicialización automática con categorías por defecto

**Funciones utilitarias creadas:**
- `getCategorias()`: Obtiene todas las categorías personalizadas
- `addCategoria()`: Crea una nueva categoría
- `updateCategoria()`: Actualiza una categoría existente
- `deleteCategoria()`: Elimina una categoría
- `getCategoriasPorTipo()`: Obtiene categorías filtradas por tipo
- `getNombresCategoriasPorTipo()`: Obtiene solo los nombres de categorías por tipo (para compatibilidad)
- `saveCategorias()`: Guarda categorías en localStorage

**Interfaz de usuario:**
- Formulario limpio y simple para crear/editar
- Grid de categorías con diseño de cards
- Secciones separadas para gastos e ingresos
- Mensajes de error claros
- Confirmación antes de eliminar
- Diseño responsive para móviles

**Beneficios:**
- Personalización completa de categorías según necesidades del usuario
- Flexibilidad para usar categorías en gastos, ingresos o ambos
- Organización clara y visual de todas las categorías
- Integración automática en todas las secciones relevantes
- Facilita la organización financiera personalizada

---

### 9. ✅ Sección de Ingresos Mensuales

**Archivos creados/modificados:** `lib/ingresos.ts`, `app/dashboard/ingresos/[mes]/page.tsx`, `components/Sidebar.tsx`

**Características implementadas:**
- Opción "Ingresos Mensuales" agregada en el sidebar con desplegable
- Funcionalidad similar a Gastos Mensuales pero para ingresos
- Desplegable con los 12 meses del año
- Páginas dinámicas para cada mes (`/dashboard/ingresos/enero`, etc.)
- Formulario para agregar ingresos con campos:
  - Descripción
  - Monto (número decimal)
  - Fecha
  - Categoría (select con categorías de ingresos)
- Lista de ingresos registrados por mes
- Persistencia en localStorage
- Total del mes calculado automáticamente

**Categorías de ingresos predefinidas:**
- Salario, Freelance, Inversiones, Ventas, Alquileres, Regalos, Otros

**Funciones utilitarias creadas:**
- `getIngresos(mes)`: Obtiene todos los ingresos de un mes
- `addIngreso(mes, ingreso)`: Agrega un nuevo ingreso
- `deleteIngreso(mes, id)`: Elimina un ingreso
- `getTotalIngresos(mes)`: Calcula el total de ingresos del mes
- `getIngresosPorCategoria(mes, categoria)`: Filtra ingresos por categoría
- `getResumenPorCategorias(mes)`: Resumen por categorías

**Diseño:**
- Layout horizontal similar a gastos (formulario izquierda, lista derecha)
- Scroll independiente en la lista de ingresos
- Total del mes en la parte inferior de la lista
- Badges de categoría en cada ingreso
- Estilos consistentes con la sección de gastos

---

## 🚀 Próximos Pasos Sugeridos

- Agregar gráficos visuales (barras, líneas, pie charts) para la distribución mensual por categorías
- Implementar distribución mensual de ingresos por categorías
- Agregar comparación entre diferentes meses en la distribución
- Implementar balance mensual (ingresos vs gastos) con gráfico comparativo
- Agregar funcionalidad de editar gastos e ingresos existentes
- Implementar exportación de datos de distribución (PDF, Excel)
- Crear dashboard con métricas generales (ingresos totales, gastos totales, balance)
- Implementar búsqueda avanzada en las listas de gastos e ingresos
- Agregar más opciones al sidebar (Reportes, Configuración, etc.)
- Crear visualización de tendencias mensuales (gráfico de líneas)

