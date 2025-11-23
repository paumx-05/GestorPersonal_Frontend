# Fix Backend: Dashboard - Filtrado por Cartera

## 🐛 Problema Identificado

Los endpoints del dashboard (`/api/dashboard/resumen` y `/api/dashboard/gastos-recientes`) **NO están filtrando correctamente por `carteraId`** cuando se proporciona el parámetro en el query string.

### Síntomas

1. **Resumen Financiero**: Cuando se envía `carteraId` en el query parameter, el backend devuelve la suma de TODOS los datos (de todas las carteras) en lugar de solo los datos de la cartera especificada.

2. **Gastos Recientes**: Similar al resumen, devuelve gastos de todas las carteras en lugar de solo los de la cartera especificada.

### Comportamiento Actual (Incorrecto)

```
GET /api/dashboard/resumen?carteraId=507f1f77bcf86cd799439011
```

**Respuesta actual (INCORRECTA):**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "ingresos": 5000.00,  // ❌ Suma de TODAS las carteras
    "gastos": 3500.00,    // ❌ Suma de TODAS las carteras
    "balance": 1500.00,
    "porcentajeGastado": 70.00
  }
}
```

### Comportamiento Esperado (Correcto)

```
GET /api/dashboard/resumen?carteraId=507f1f77bcf86cd799439011
```

**Respuesta esperada (CORRECTA):**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "ingresos": 2500.00,  // ✅ Solo datos de la cartera especificada
    "gastos": 1800.00,    // ✅ Solo datos de la cartera especificada
    "balance": 700.00,
    "porcentajeGastado": 72.00
  }
}
```

---

## 📋 Endpoints Afectados

### 1. GET /api/dashboard/resumen

**Query Parameter:**
- `carteraId` (string, opcional): ID de la cartera para filtrar los datos

**Lógica de Filtrado Requerida:**

```javascript
// Pseudocódigo de la lógica correcta
async function getResumenMesActual(req, res) {
  const userId = req.user.id; // Del token JWT
  const mesActual = obtenerMesActual(); // Ej: "noviembre"
  const carteraId = req.query.carteraId; // Del query parameter
  
  // Construir filtro base
  const filtroBase = {
    userId: userId,
    mes: mesActual
  };
  
  // IMPORTANTE: Si se proporciona carteraId, filtrar SOLO por esa cartera
  if (carteraId) {
    // Validar que la cartera pertenece al usuario
    const cartera = await Cartera.findOne({ 
      _id: carteraId, 
      userId: userId 
    });
    
    if (!cartera) {
      return res.status(404).json({
        success: false,
        error: "Cartera no encontrada o no pertenece al usuario"
      });
    }
    
    // Filtrar SOLO por esta cartera
    filtroBase.carteraId = new ObjectId(carteraId);
  } else {
    // Si NO se proporciona carteraId, filtrar por carteraId = null (datos sin cartera)
    filtroBase.carteraId = null;
  }
  
  // Calcular ingresos (solo de la cartera especificada o sin cartera)
  const ingresos = await Ingreso.aggregate([
    { $match: filtroBase },
    { $group: { _id: null, total: { $sum: "$monto" } } }
  ]);
  
  // Calcular gastos (solo de la cartera especificada o sin cartera)
  const gastos = await Gasto.aggregate([
    { $match: filtroBase },
    { $group: { _id: null, total: { $sum: "$monto" } } }
  ]);
  
  const totalIngresos = ingresos[0]?.total || 0;
  const totalGastos = gastos[0]?.total || 0;
  const balance = totalIngresos - totalGastos;
  const porcentajeGastado = totalIngresos > 0 
    ? (totalGastos / totalIngresos) * 100 
    : 0;
  
  res.json({
    success: true,
    data: {
      mes: mesActual,
      ingresos: totalIngresos,
      gastos: totalGastos,
      balance: balance,
      porcentajeGastado: parseFloat(porcentajeGastado.toFixed(2))
    }
  });
}
```

### 2. GET /api/dashboard/gastos-recientes

**Query Parameter:**
- `carteraId` (string, opcional): ID de la cartera para filtrar los gastos

**Lógica de Filtrado Requerida:**

```javascript
// Pseudocódigo de la lógica correcta
async function getGastosRecientes(req, res) {
  const userId = req.user.id; // Del token JWT
  const mesActual = obtenerMesActual(); // Ej: "noviembre"
  const carteraId = req.query.carteraId; // Del query parameter
  
  // Construir filtro base
  const filtroBase = {
    userId: userId,
    mes: mesActual
  };
  
  // IMPORTANTE: Si se proporciona carteraId, filtrar SOLO por esa cartera
  if (carteraId) {
    // Validar que la cartera pertenece al usuario
    const cartera = await Cartera.findOne({ 
      _id: carteraId, 
      userId: userId 
    });
    
    if (!cartera) {
      return res.status(404).json({
        success: false,
        error: "Cartera no encontrada o no pertenece al usuario"
      });
    }
    
    // Filtrar SOLO por esta cartera
    filtroBase.carteraId = new ObjectId(carteraId);
  } else {
    // Si NO se proporciona carteraId, filtrar por carteraId = null (gastos sin cartera)
    filtroBase.carteraId = null;
  }
  
  // Obtener últimos 7 gastos (solo de la cartera especificada o sin cartera)
  const gastos = await Gasto.find(filtroBase)
    .sort({ fecha: -1 }) // Más recientes primero
    .limit(7)
    .select('_id descripcion monto categoria fecha mes')
    .lean();
  
  res.json({
    success: true,
    data: gastos
  });
}
```

---

## 🔍 Casos de Prueba

### Caso 1: Resumen con carteraId específico

**Request:**
```
GET /api/dashboard/resumen?carteraId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Datos en BD:**
- Cartera 1 (ID: 507f1f77bcf86cd799439011): Ingresos: 2500, Gastos: 1800
- Cartera 2 (ID: 507f1f77bcf86cd799439012): Ingresos: 2000, Gastos: 1200
- Sin cartera (null): Ingresos: 500, Gastos: 300

**Response Esperada:**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "ingresos": 2500.00,  // ✅ Solo Cartera 1
    "gastos": 1800.00,    // ✅ Solo Cartera 1
    "balance": 700.00,
    "porcentajeGastado": 72.00
  }
}
```

**Response Incorrecta (actual):**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "ingresos": 5000.00,  // ❌ Suma de todas las carteras
    "gastos": 3300.00,    // ❌ Suma de todas las carteras
    "balance": 1700.00,
    "porcentajeGastado": 66.00
  }
}
```

### Caso 2: Resumen sin carteraId (datos sin cartera)

**Request:**
```
GET /api/dashboard/resumen
Authorization: Bearer <token>
```

**Response Esperada:**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "ingresos": 500.00,   // ✅ Solo datos con carteraId = null
    "gastos": 300.00,     // ✅ Solo datos con carteraId = null
    "balance": 200.00,
    "porcentajeGastado": 60.00
  }
}
```

### Caso 3: Gastos recientes con carteraId específico

**Request:**
```
GET /api/dashboard/gastos-recientes?carteraId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Datos en BD:**
- Cartera 1: 5 gastos en noviembre
- Cartera 2: 3 gastos en noviembre
- Sin cartera: 2 gastos en noviembre

**Response Esperada:**
```json
{
  "success": true,
  "data": [
    // ✅ Solo los 5 gastos de Cartera 1 (o máximo 7 si hay más)
  ]
}
```

**Response Incorrecta (actual):**
```json
{
  "success": true,
  "data": [
    // ❌ Gastos de todas las carteras mezclados
  ]
}
```

---

## ✅ Checklist de Implementación

### Para GET /api/dashboard/resumen

- [ ] Leer `carteraId` del query parameter `req.query.carteraId`
- [ ] Si `carteraId` está presente:
  - [ ] Validar que la cartera existe y pertenece al usuario
  - [ ] Filtrar ingresos por `userId`, `mes` Y `carteraId = <carteraId>`
  - [ ] Filtrar gastos por `userId`, `mes` Y `carteraId = <carteraId>`
- [ ] Si `carteraId` NO está presente:
  - [ ] Filtrar ingresos por `userId`, `mes` Y `carteraId = null`
  - [ ] Filtrar gastos por `userId`, `mes` Y `carteraId = null`
- [ ] Calcular totales SOLO de los registros filtrados
- [ ] Retornar resumen con los datos filtrados

### Para GET /api/dashboard/gastos-recientes

- [ ] Leer `carteraId` del query parameter `req.query.carteraId`
- [ ] Si `carteraId` está presente:
  - [ ] Validar que la cartera existe y pertenece al usuario
  - [ ] Filtrar gastos por `userId`, `mes` Y `carteraId = <carteraId>`
- [ ] Si `carteraId` NO está presente:
  - [ ] Filtrar gastos por `userId`, `mes` Y `carteraId = null`
- [ ] Ordenar por fecha descendente (más recientes primero)
- [ ] Limitar a 7 resultados
- [ ] Retornar solo los gastos filtrados

---

## 🔧 Ejemplo de Implementación (Mongoose/Express)

### Controller: dashboard.controller.js

```javascript
const Ingreso = require('../models/Ingreso');
const Gasto = require('../models/Gasto');
const Cartera = require('../models/Cartera');
const { ObjectId } = require('mongoose').Types;

// Función auxiliar para obtener mes actual
function obtenerMesActual() {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return meses[new Date().getMonth()];
}

// Función auxiliar para construir filtro por cartera
async function construirFiltroCartera(userId, mes, carteraId) {
  const filtro = {
    userId: new ObjectId(userId),
    mes: mes
  };
  
  if (carteraId) {
    // Validar que la cartera pertenece al usuario
    const cartera = await Cartera.findOne({
      _id: new ObjectId(carteraId),
      userId: new ObjectId(userId)
    });
    
    if (!cartera) {
      throw new Error('Cartera no encontrada o no pertenece al usuario');
    }
    
    // Filtrar por cartera específica
    filtro.carteraId = new ObjectId(carteraId);
  } else {
    // Filtrar por datos sin cartera (carteraId = null)
    filtro.carteraId = null;
  }
  
  return filtro;
}

// GET /api/dashboard/resumen
exports.getResumenMesActual = async (req, res) => {
  try {
    const userId = req.user.id;
    const mesActual = obtenerMesActual();
    const carteraId = req.query.carteraId; // Del query parameter
    
    // Construir filtro con validación de cartera
    const filtro = await construirFiltroCartera(userId, mesActual, carteraId);
    
    // Calcular ingresos (solo de la cartera especificada o sin cartera)
    const ingresosResult = await Ingreso.aggregate([
      { $match: filtro },
      { $group: { _id: null, total: { $sum: "$monto" } } }
    ]);
    
    // Calcular gastos (solo de la cartera especificada o sin cartera)
    const gastosResult = await Gasto.aggregate([
      { $match: filtro },
      { $group: { _id: null, total: { $sum: "$monto" } } }
    ]);
    
    const totalIngresos = ingresosResult[0]?.total || 0;
    const totalGastos = gastosResult[0]?.total || 0;
    const balance = totalIngresos - totalGastos;
    const porcentajeGastado = totalIngresos > 0 
      ? (totalGastos / totalIngresos) * 100 
      : 0;
    
    res.json({
      success: true,
      data: {
        mes: mesActual,
        ingresos: parseFloat(totalIngresos.toFixed(2)),
        gastos: parseFloat(totalGastos.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
        porcentajeGastado: parseFloat(porcentajeGastado.toFixed(2))
      }
    });
  } catch (error) {
    if (error.message === 'Cartera no encontrada o no pertenece al usuario') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    console.error('Error en getResumenMesActual:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener resumen del mes actual'
    });
  }
};

// GET /api/dashboard/gastos-recientes
exports.getGastosRecientes = async (req, res) => {
  try {
    const userId = req.user.id;
    const mesActual = obtenerMesActual();
    const carteraId = req.query.carteraId; // Del query parameter
    
    // Construir filtro con validación de cartera
    const filtro = await construirFiltroCartera(userId, mesActual, carteraId);
    
    // Obtener últimos 7 gastos (solo de la cartera especificada o sin cartera)
    const gastos = await Gasto.find(filtro)
      .sort({ fecha: -1 }) // Más recientes primero
      .limit(7)
      .select('_id descripcion monto categoria fecha mes')
      .lean();
    
    res.json({
      success: true,
      data: gastos
    });
  } catch (error) {
    if (error.message === 'Cartera no encontrada o no pertenece al usuario') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    console.error('Error en getGastosRecientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener gastos recientes'
    });
  }
};
```

---

## 🧪 Pruebas Recomendadas

### Test 1: Resumen con carteraId válido
```bash
curl -X GET "http://localhost:4444/api/dashboard/resumen?carteraId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```
**Verificar:** Los totales deben ser SOLO de la cartera especificada.

### Test 2: Resumen sin carteraId
```bash
curl -X GET "http://localhost:4444/api/dashboard/resumen" \
  -H "Authorization: Bearer <token>"
```
**Verificar:** Los totales deben ser SOLO de registros con `carteraId = null`.

### Test 3: Resumen con carteraId inválido
```bash
curl -X GET "http://localhost:4444/api/dashboard/resumen?carteraId=invalid" \
  -H "Authorization: Bearer <token>"
```
**Verificar:** Debe retornar error 404.

### Test 4: Gastos recientes con carteraId válido
```bash
curl -X GET "http://localhost:4444/api/dashboard/gastos-recientes?carteraId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```
**Verificar:** Solo deben aparecer gastos de la cartera especificada.

### Test 5: Cambio de cartera
1. Obtener resumen de Cartera 1
2. Obtener resumen de Cartera 2
3. **Verificar:** Los totales deben ser diferentes y corresponder a cada cartera.

---

## 📝 Notas Importantes

1. **Validación de carteraId**: Siempre validar que la cartera pertenece al usuario antes de filtrar.

2. **Filtrado estricto**: Cuando se proporciona `carteraId`, el filtro debe ser EXACTO (`carteraId = <id>`), no un filtro parcial.

3. **Datos sin cartera**: Cuando NO se proporciona `carteraId`, filtrar por `carteraId = null`, NO por todos los datos.

4. **Conversión de tipos**: Asegurarse de convertir `carteraId` a `ObjectId` de MongoDB antes de usarlo en las consultas.

5. **Índices**: Asegurarse de que existen índices en `userId`, `mes`, y `carteraId` para optimizar las consultas.

---

## 🚨 Errores Comunes a Evitar

1. ❌ **NO filtrar cuando se proporciona carteraId**: El backend ignora el parámetro y devuelve todos los datos.

2. ❌ **Filtrar incorrectamente**: Usar `$in` o `$exists` en lugar de igualdad exacta.

3. ❌ **No validar carteraId**: Permitir que usuarios accedan a datos de carteras de otros usuarios.

4. ❌ **Mezclar lógica**: Cuando no hay `carteraId`, devolver todos los datos en lugar de solo los sin cartera.

---

## 📞 Contacto

Si hay dudas sobre la implementación, revisar:
- `Doc_backend/carteras-integracion.md` - Documentación completa de carteras
- `Doc_backend/dashboard-integracion.md` - Documentación del dashboard
- Modelos: `Gasto`, `Ingreso`, `Cartera`

---

**Última actualización:** 2024-11-22
**Prioridad:** 🔴 ALTA - Bloquea funcionalidad crítica del dashboard

