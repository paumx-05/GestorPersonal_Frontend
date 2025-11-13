# Integración Endpoints: Dashboard

## Objetivo
Crear todas las rutas REST API necesarias para el dashboard financiero, proporcionando resúmenes del mes actual, gastos recientes, distribución por categorías, comparativas mensuales y alertas financieras.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Usa modelos: Gasto, Ingreso, Presupuesto)
- **Express.js**: Framework web
- **TypeScript**: Lenguaje de programación
- **REST API**: Estándares REST con métodos HTTP apropiados

### Estándares API
- Métodos HTTP correctos (GET)
- Nomenclatura consistente de endpoints
- Respuestas JSON estructuradas
- Códigos de estado HTTP apropiados
- Autenticación con JWT en todas las rutas protegidas

---

## 📝 Pasos de Implementación

### Paso 1: Crear Controlador de Dashboard

**Archivo a crear:** `src/controllers/dashboard.controller.ts`

**Funciones a implementar:**

```typescript
// Obtener resumen del mes actual
export const getResumenMesActual = async (req: AuthRequest, res: Response): Promise<void>

// Obtener gastos recientes (últimos 7)
export const getGastosRecientes = async (req: AuthRequest, res: Response): Promise<void>

// Obtener gastos por categorías (top 3)
export const getGastosPorCategoria = async (req: AuthRequest, res: Response): Promise<void>

// Obtener comparativa mes anterior vs actual
export const getComparativaMensual = async (req: AuthRequest, res: Response): Promise<void>

// Obtener alertas financieras
export const getAlertasFinancieras = async (req: AuthRequest, res: Response): Promise<void>
```

**Lógica de cada función:**
- `getResumenMesActual`: Calcular totales de ingresos, gastos, balance y porcentaje gastado del mes actual
- `getGastosRecientes`: Obtener últimos 7 gastos del mes actual, ordenados por fecha descendente
- `getGastosPorCategoria`: Agrupar gastos por categoría, obtener top 3 con más gastos
- `getComparativaMensual`: Comparar ingresos, gastos y balance del mes actual vs mes anterior
- `getAlertasFinancieras`: Generar alertas dinámicas según situación financiera (sin ingresos, presupuesto excedido, balance negativo, etc.)

**Funciones helper necesarias:**
```typescript
// Obtener mes actual en formato para URL
const getMesActual = (): string

// Obtener mes anterior en formato para URL
const getMesAnterior = (): string

// Calcular porcentaje de cambio
const calcularPorcentajeCambio = (actual: number, anterior: number): number
```

---

### Paso 2: Crear Rutas de Dashboard

**Archivo a crear:** `src/routes/dashboard.routes.ts`

**Endpoints a implementar:**

```typescript
GET    /api/dashboard/resumen              - Obtener resumen del mes actual
GET    /api/dashboard/gastos-recientes      - Obtener gastos recientes
GET    /api/dashboard/gastos-categoria       - Obtener gastos por categorías (top 3)
GET    /api/dashboard/comparativa           - Obtener comparativa mensual
GET    /api/dashboard/alertas                - Obtener alertas financieras
```

**Estructura de rutas:**

```typescript
import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import * as dashboardController from '../controllers/dashboard.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/resumen', authenticate, dashboardController.getResumenMesActual);
router.get('/gastos-recientes', authenticate, dashboardController.getGastosRecientes);
router.get('/gastos-categoria', authenticate, dashboardController.getGastosPorCategoria);
router.get('/comparativa', authenticate, dashboardController.getComparativaMensual);
router.get('/alertas', authenticate, dashboardController.getAlertasFinancieras);

export default router;
```

---

### Paso 3: Implementar Lógica de Negocio

**Cálculos del resumen del mes actual:**

```typescript
// Obtener ingresos del mes actual
const ingresos = await Ingreso.find({ userId, mes: mesActual });
const totalIngresos = ingresos.reduce((sum, ing) => sum + ing.monto, 0);

// Obtener gastos del mes actual
const gastos = await Gasto.find({ userId, mes: mesActual });
const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

// Calcular balance
const balance = totalIngresos - totalGastos;

// Calcular porcentaje gastado
const porcentajeGastado = totalIngresos > 0 
  ? (totalGastos / totalIngresos) * 100 
  : 0;
```

**Gastos por categoría (top 3):**

```typescript
// Agrupar gastos por categoría
const gastosPorCategoria = gastos.reduce((acc, gasto) => {
  const categoria = gasto.categoria;
  if (!acc[categoria]) {
    acc[categoria] = 0;
  }
  acc[categoria] += gasto.monto;
  return acc;
}, {});

// Convertir a array y ordenar
const categoriasOrdenadas = Object.entries(gastosPorCategoria)
  .map(([categoria, monto]) => ({ categoria, monto }))
  .sort((a, b) => b.monto - a.monto)
  .slice(0, 3); // Top 3
```

**Comparativa mensual:**

```typescript
// Obtener datos del mes anterior
const ingresosAnterior = await Ingreso.find({ userId, mes: mesAnterior });
const gastosAnterior = await Gasto.find({ userId, mes: mesAnterior });

const totalIngresosAnterior = ingresosAnterior.reduce((sum, ing) => sum + ing.monto, 0);
const totalGastosAnterior = gastosAnterior.reduce((sum, gasto) => sum + gasto.monto, 0);
const balanceAnterior = totalIngresosAnterior - totalGastosAnterior;

// Calcular cambios porcentuales
const cambioIngresos = calcularPorcentajeCambio(totalIngresos, totalIngresosAnterior);
const cambioGastos = calcularPorcentajeCambio(totalGastos, totalGastosAnterior);
const cambioBalance = calcularPorcentajeCambio(balance, balanceAnterior);
```

**Alertas financieras:**

```typescript
const alertas = [];

// Alerta: Sin ingresos registrados
if (totalIngresos === 0) {
  alertas.push({
    tipo: 'info',
    titulo: 'Sin ingresos registrados',
    mensaje: 'No hay ingresos registrados para este mes'
  });
}

// Alerta: Balance negativo
if (balance < 0) {
  alertas.push({
    tipo: 'error',
    titulo: 'Balance negativo',
    mensaje: `Los gastos superan los ingresos en ${Math.abs(balance).toFixed(2)}€`
  });
}

// Alerta: Presupuesto excedido (verificar por categoría)
// ... lógica para verificar presupuestos vs gastos reales
```

---

### Paso 4: Integrar Rutas en Server

**Archivo a modificar:** `src/server.ts`

**Cambios a realizar:**

```typescript
// 1. Importar las rutas
import { dashboardRoutes } from './routes/dashboard.routes';

// 2. Agregar después de las rutas existentes
app.use('/api/dashboard', dashboardRoutes);

// 3. Actualizar endpoint raíz con nueva ruta
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Bienvenido al API del Gestor Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      gastos: '/api/gastos',
      ingresos: '/api/ingresos',
      presupuestos: '/api/presupuestos',
      categorias: '/api/categorias',
      dashboard: '/api/dashboard',  // ← Agregar esta línea
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});
```

---

### Paso 5: Testing y Documentación

**Testing con Postman/Thunder Client:**

1. **Obtener resumen del mes actual:**
   ```
   GET http://localhost:4444/api/dashboard/resumen
   Headers: Authorization: Bearer <token>
   ```

2. **Obtener gastos recientes:**
   ```
   GET http://localhost:4444/api/dashboard/gastos-recientes
   Headers: Authorization: Bearer <token>
   ```

3. **Obtener gastos por categoría:**
   ```
   GET http://localhost:4444/api/dashboard/gastos-categoria
   Headers: Authorization: Bearer <token>
   ```

4. **Obtener comparativa mensual:**
   ```
   GET http://localhost:4444/api/dashboard/comparativa
   Headers: Authorization: Bearer <token>
   ```

5. **Obtener alertas financieras:**
   ```
   GET http://localhost:4444/api/dashboard/alertas
   Headers: Authorization: Bearer <token>
   ```

**Estructura de respuestas esperadas:**

```typescript
// GET /api/dashboard/resumen
{
  success: true,
  data: {
    mes: string,
    ingresos: number,
    gastos: number,
    balance: number,
    porcentajeGastado: number
  }
}

// GET /api/dashboard/gastos-recientes
{
  success: true,
  data: [
    {
      _id: string,
      descripcion: string,
      monto: number,
      categoria: string,
      fecha: string (ISO),
      mes: string
    }
  ]
}

// GET /api/dashboard/gastos-categoria
{
  success: true,
  data: [
    {
      categoria: string,
      monto: number,
      porcentaje: number
    }
  ],
  total: number
}

// GET /api/dashboard/comparativa
{
  success: true,
  data: {
    mesActual: {
      ingresos: number,
      gastos: number,
      balance: number
    },
    mesAnterior: {
      ingresos: number,
      gastos: number,
      balance: number
    },
    cambios: {
      ingresos: { valor: number, porcentaje: number, tipo: 'aumento' | 'disminucion' },
      gastos: { valor: number, porcentaje: number, tipo: 'aumento' | 'disminucion' },
      balance: { valor: number, porcentaje: number, tipo: 'aumento' | 'disminucion' }
    }
  }
}

// GET /api/dashboard/alertas
{
  success: true,
  data: [
    {
      tipo: 'info' | 'success' | 'warning' | 'error',
      titulo: string,
      mensaje: string
    }
  ]
}
```

---

## 📁 Estructura de Archivos

```
src/
├── controllers/
│   └── dashboard.controller.ts         ✅ (nuevo)
├── routes/
│   └── dashboard.routes.ts              ✅ (nuevo)
├── models/
│   ├── Gasto.model.ts                   ✅ (ya existe - usado)
│   ├── Ingreso.model.ts                 ✅ (ya existe - usado)
│   └── Presupuesto.model.ts             ✅ (ya existe - usado)
└── server.ts                             ✅ (modificar - registrar rutas)
```

---

## 📝 Notas Técnicas

- Todas las rutas protegidas con middleware `authenticate`
- Usar `AuthRequest` para acceder a `req.user.userId`
- El dashboard no tiene modelo propio, usa datos de otras colecciones
- Optimizar consultas usando `Promise.all()` para consultas paralelas cuando sea posible
- Calcular mes anterior basándose en el mes actual
- Manejar casos donde no hay datos del mes anterior (retornar null o 0)
- Ordenar gastos recientes por fecha descendente (más recientes primero)
- Las alertas se generan dinámicamente según la situación financiera
- Usar `lean()` en consultas de solo lectura para mejor rendimiento

---

## ✅ Checklist de Verificación

- [ ] Controlador creado con todas las funciones
- [ ] Funciones helper implementadas (getMesActual, getMesAnterior, calcularPorcentajeCambio)
- [ ] Rutas creadas y conectadas al controlador
- [ ] Todas las rutas protegidas con middleware `authenticate`
- [ ] Cálculos del resumen implementados correctamente
- [ ] Gastos por categoría (top 3) funcionando
- [ ] Comparativa mensual implementada
- [ ] Sistema de alertas financieras funcionando
- [ ] Manejo de errores consistente
- [ ] Rutas registradas en `server.ts`
- [ ] Endpoint raíz actualizado
- [ ] Testing completo con Postman/Thunder Client
- [ ] Verificar que usuarios solo accedan a sus propios datos
- [ ] Documentación de endpoints completa


