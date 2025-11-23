# Integración Backend: Gestión de Carteras con Saldos y Transferencias

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Modelos de Datos](#modelos-de-datos)
3. [Endpoints de API](#endpoints-de-api)
4. [Lógica de Negocio](#lógica-de-negocio)
5. [Transacciones y Consistencia](#transacciones-y-consistencia)
6. [Validaciones](#validaciones)
7. [Ejemplos de Implementación](#ejemplos-de-implementación)
8. [Testing](#testing)

---

## Resumen Ejecutivo

Este documento describe la implementación completa del sistema de **Gestión de Carteras** con capacidades avanzadas de manejo de saldos, transferencias entre carteras, y seguimiento de transacciones.

### Características Principales

- ✅ **Gestión completa de carteras** (CRUD básico ya implementado)
- 🆕 **Saldo dinámico** con campo `saldo`, `saldoInicial`, `moneda`
- 🆕 **Operaciones de saldo**: Depositar y retirar capital
- 🆕 **Transferencias** entre carteras del mismo usuario
- 🆕 **Historial de transacciones** completo y auditable
- 🆕 **Sincronización automática** con gastos e ingresos
- 🆕 **Multi-moneda** con soporte para diferentes divisas
- 🆕 **Saldo contable vs manual** para reconciliación

### Stack Tecnológico Backend Recomendado

- **Node.js** + **Express.js**
- **MongoDB** con **Mongoose**
- **JWT** para autenticación
- **Joi** o **Zod** para validación
- **Winston** para logging

---

## Modelos de Datos

### 1. Modelo Cartera (Ampliado)

**Archivo:** `models/cartera.model.js`

```javascript
const mongoose = require('mongoose');

const carteraSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // ============ NUEVOS CAMPOS ============
  saldo: {
    type: Number,
    required: true,
    default: 0,
    min: 0 // Opcional: Puede ser negativo si permites "crédito"
  },
  saldoInicial: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  moneda: {
    type: String,
    required: true,
    default: 'EUR',
    enum: ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'MXN'] // Extendible
  },
  icono: {
    type: String,
    default: '💳',
    maxlength: 10
  },
  color: {
    type: String,
    default: '#3b82f6',
    match: /^#[0-9A-F]{6}$/i // Validar color hex
  },
  activa: {
    type: Boolean,
    default: true
  },
  // ========================================
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices compuestos para rendimiento
carteraSchema.index({ userId: 1, nombre: 1 }, { unique: true }); // Nombre único por usuario
carteraSchema.index({ userId: 1, activa: 1 });

// Virtual para calcular el cambio desde el inicio
carteraSchema.virtual('cambio').get(function() {
  return this.saldo - this.saldoInicial;
});

// Virtual para calcular porcentaje de cambio
carteraSchema.virtual('porcentajeCambio').get(function() {
  if (this.saldoInicial === 0) return 0;
  return ((this.cambio / this.saldoInicial) * 100).toFixed(2);
});

carteraSchema.set('toJSON', { virtuals: true });
carteraSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cartera', carteraSchema);
```

### 2. Modelo TransaccionCartera (NUEVO)

**Archivo:** `models/transaccionCartera.model.js`

```javascript
const mongoose = require('mongoose');

const transaccionCarteraSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['deposito', 'retiro', 'transferencia', 'ajuste', 'gasto', 'ingreso'],
    index: true
  },
  // Cartera origen (null para depósitos o ajustes de entrada)
  carteraOrigenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cartera',
    default: null
  },
  // Cartera destino (null para retiros o ajustes de salida)
  carteraDestinoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cartera',
    default: null
  },
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  // Para conversión de moneda (si aplica)
  montoOrigen: {
    type: Number
  },
  montoDestino: {
    type: Number
  },
  concepto: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  // Referencia a gasto/ingreso que generó esta transacción (si aplica)
  referenciaId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  // Metadata adicional
  metadata: {
    gastosAfectados: [mongoose.Schema.Types.ObjectId],
    ingresosAfectados: [mongoose.Schema.Types.ObjectId]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
transaccionCarteraSchema.index({ userId: 1, fecha: -1 });
transaccionCarteraSchema.index({ carteraOrigenId: 1, fecha: -1 });
transaccionCarteraSchema.index({ carteraDestinoId: 1, fecha: -1 });
transaccionCarteraSchema.index({ tipo: 1, userId: 1 });

module.exports = mongoose.model('TransaccionCartera', transaccionCarteraSchema);
```

---

## Endpoints de API

### Base URL
`http://localhost:4444/api/carteras`

Todos los endpoints requieren autenticación con JWT en el header:
```
Authorization: Bearer <token>
```

---

### 1. **Depositar en Cartera** (NUEVO)

**Endpoint:** `POST /api/carteras/:id/depositar`

**Descripción:** Añade capital a una cartera específica.

**Path Parameters:**
- `id` (string): ID de la cartera

**Body (JSON):**
```json
{
  "monto": 500.00,
  "concepto": "Ingreso inicial de ahorros",
  "fecha": "2024-11-23T10:00:00.000Z" // Opcional, default: now
}
```

**Validaciones:**
- `monto`: Requerido, número positivo
- `concepto`: Requerido, string (1-200 caracteres)
- `fecha`: Opcional, fecha válida (no futura)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cartera": {
      "_id": "6745a1b2c3d4e5f678901234",
      "userId": "6745a1b2c3d4e5f678901230",
      "nombre": "Personal",
      "descripcion": "Cartera personal",
      "saldo": 1500.00,
      "saldoInicial": 1000.00,
      "moneda": "EUR",
      "icono": "💳",
      "color": "#3b82f6",
      "activa": true,
      "createdAt": "2024-11-20T10:00:00.000Z",
      "updatedAt": "2024-11-23T10:00:00.000Z"
    },
    "transaccion": {
      "_id": "6745a1b2c3d4e5f678901235",
      "userId": "6745a1b2c3d4e5f678901230",
      "tipo": "deposito",
      "carteraDestinoId": "6745a1b2c3d4e5f678901234",
      "monto": 500.00,
      "concepto": "Ingreso inicial de ahorros",
      "fecha": "2024-11-23T10:00:00.000Z",
      "createdAt": "2024-11-23T10:00:00.000Z",
      "updatedAt": "2024-11-23T10:00:00.000Z"
    }
  },
  "message": "Depósito realizado exitosamente"
}
```

**Errores:**
- `400`: Datos inválidos (monto negativo, concepto vacío, etc.)
- `401`: No autenticado
- `404`: Cartera no encontrada
- `500`: Error del servidor

---

### 2. **Retirar de Cartera** (NUEVO)

**Endpoint:** `POST /api/carteras/:id/retirar`

**Descripción:** Retira capital de una cartera específica.

**Path Parameters:**
- `id` (string): ID de la cartera

**Body (JSON):**
```json
{
  "monto": 200.00,
  "concepto": "Retiro para efectivo",
  "fecha": "2024-11-23T10:00:00.000Z" // Opcional, default: now
}
```

**Validaciones:**
- `monto`: Requerido, número positivo
- `monto` <= `saldo actual` (saldo suficiente)
- `concepto`: Requerido, string (1-200 caracteres)
- `fecha`: Opcional, fecha válida (no futura)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cartera": {
      "_id": "6745a1b2c3d4e5f678901234",
      "saldo": 1300.00,
      // ... resto de campos
    },
    "transaccion": {
      "_id": "6745a1b2c3d4e5f678901236",
      "tipo": "retiro",
      "carteraOrigenId": "6745a1b2c3d4e5f678901234",
      "monto": 200.00,
      "concepto": "Retiro para efectivo",
      // ... resto de campos
    }
  },
  "message": "Retiro realizado exitosamente"
}
```

**Errores:**
- `400`: Saldo insuficiente, datos inválidos
- `401`: No autenticado
- `404`: Cartera no encontrada
- `500`: Error del servidor

---

### 3. **Transferir entre Carteras** (NUEVO)

**Endpoint:** `POST /api/carteras/transferir`

**Descripción:** Transfiere capital entre dos carteras del mismo usuario.

**Body (JSON):**
```json
{
  "carteraOrigenId": "6745a1b2c3d4e5f678901234",
  "carteraDestinoId": "6745a1b2c3d4e5f678901237",
  "monto": 300.00,
  "concepto": "Reorganización de fondos",
  "fecha": "2024-11-23T10:00:00.000Z" // Opcional, default: now
}
```

**Validaciones:**
- `carteraOrigenId`: Requerido, ID válido de cartera del usuario
- `carteraDestinoId`: Requerido, ID válido de cartera del usuario
- `carteraOrigenId` ≠ `carteraDestinoId`
- `monto`: Requerido, número positivo
- `monto` <= `saldo de cartera origen`
- `concepto`: Requerido, string (1-200 caracteres)
- `fecha`: Opcional, fecha válida (no futura)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "carteraOrigen": {
      "_id": "6745a1b2c3d4e5f678901234",
      "saldo": 1000.00, // Reducido
      // ... resto de campos
    },
    "carteraDestino": {
      "_id": "6745a1b2c3d4e5f678901237",
      "saldo": 800.00, // Aumentado
      // ... resto de campos
    },
    "transaccion": {
      "_id": "6745a1b2c3d4e5f678901238",
      "tipo": "transferencia",
      "carteraOrigenId": "6745a1b2c3d4e5f678901234",
      "carteraDestinoId": "6745a1b2c3d4e5f678901237",
      "monto": 300.00,
      "concepto": "Reorganización de fondos",
      // ... resto de campos
    }
  },
  "message": "Transferencia realizada exitosamente"
}
```

**Errores:**
- `400`: Saldo insuficiente, carteras iguales, datos inválidos
- `401`: No autenticado
- `404`: Una o ambas carteras no encontradas
- `403`: Las carteras no pertenecen al mismo usuario
- `500`: Error del servidor

---

### 4. **Obtener Transacciones de Cartera** (NUEVO)

**Endpoint:** `GET /api/carteras/:id/transacciones`

**Descripción:** Obtiene el historial completo de transacciones de una cartera.

**Path Parameters:**
- `id` (string): ID de la cartera

**Query Parameters (opcionales):**
- `tipo`: Filtrar por tipo (`deposito`, `retiro`, `transferencia`, `gasto`, `ingreso`, `ajuste`)
- `fechaDesde`: Fecha desde (ISO string)
- `fechaHasta`: Fecha hasta (ISO string)
- `limit`: Número de resultados (default: 100, max: 500)
- `offset`: Paginación (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6745a1b2c3d4e5f678901238",
      "userId": "6745a1b2c3d4e5f678901230",
      "tipo": "transferencia",
      "carteraOrigenId": "6745a1b2c3d4e5f678901234",
      "carteraDestinoId": "6745a1b2c3d4e5f678901237",
      "monto": 300.00,
      "concepto": "Reorganización de fondos",
      "fecha": "2024-11-23T10:00:00.000Z",
      "createdAt": "2024-11-23T10:00:00.000Z",
      "updatedAt": "2024-11-23T10:00:00.000Z"
    },
    {
      "_id": "6745a1b2c3d4e5f678901236",
      "userId": "6745a1b2c3d4e5f678901230",
      "tipo": "retiro",
      "carteraOrigenId": "6745a1b2c3d4e5f678901234",
      "monto": 200.00,
      "concepto": "Retiro para efectivo",
      "fecha": "2024-11-23T09:00:00.000Z",
      "createdAt": "2024-11-23T09:00:00.000Z",
      "updatedAt": "2024-11-23T09:00:00.000Z"
    }
    // ... más transacciones
  ]
}
```

**Errores:**
- `401`: No autenticado
- `404`: Cartera no encontrada
- `500`: Error del servidor

---

### 5. **Obtener Saldo Actualizado** (NUEVO)

**Endpoint:** `GET /api/carteras/:id/saldo`

**Descripción:** Obtiene el saldo actual de la cartera con información de reconciliación.

**Path Parameters:**
- `id` (string): ID de la cartera

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "saldo": 1500.00,
    "saldoContable": 1480.00,
    "diferencia": 20.00,
    "ultimaActualizacion": "2024-11-23T10:00:00.000Z"
  }
}
```

**Campos:**
- `saldo`: Saldo manual actual de la cartera
- `saldoContable`: Saldo calculado desde `saldoInicial` + transacciones + gastos/ingresos
- `diferencia`: Diferencia entre saldo manual y contable (para detectar discrepancias)
- `ultimaActualizacion`: Fecha de última modificación

**Errores:**
- `401`: No autenticado
- `404`: Cartera no encontrada
- `500`: Error del servidor

---

### 6. **Sincronizar Saldo** (NUEVO)

**Endpoint:** `POST /api/carteras/:id/sincronizar`

**Descripción:** Recalcula el saldo de la cartera basándose en todas las transacciones, gastos e ingresos registrados.

**Path Parameters:**
- `id` (string): ID de la cartera

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "6745a1b2c3d4e5f678901234",
    "saldo": 1480.00, // Saldo sincronizado
    // ... resto de campos
  },
  "message": "Saldo sincronizado exitosamente"
}
```

**Lógica de Cálculo:**
```javascript
saldoSincronizado = saldoInicial 
                  + Σ(transacciones tipo 'deposito' o 'ingreso')
                  - Σ(transacciones tipo 'retiro' o 'gasto')
                  + Σ(transferencias entrantes)
                  - Σ(transferencias salientes)
```

**Errores:**
- `401`: No autenticado
- `404`: Cartera no encontrada
- `500`: Error del servidor

---

## Lógica de Negocio

### Reglas de Negocio Críticas

#### 1. **Transacciones Atómicas**

Todas las operaciones que modifiquen saldos deben ejecutarse en **transacciones de base de datos** para garantizar consistencia:

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Actualizar saldo de cartera origen
  await Cartera.findByIdAndUpdate(
    carteraOrigenId,
    { $inc: { saldo: -monto } },
    { session }
  );

  // 2. Actualizar saldo de cartera destino
  await Cartera.findByIdAndUpdate(
    carteraDestinoId,
    { $inc: { saldo: monto } },
    { session }
  );

  // 3. Crear transacción
  await TransaccionCartera.create([{
    tipo: 'transferencia',
    carteraOrigenId,
    carteraDestinoId,
    monto,
    concepto,
    fecha
  }], { session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

#### 2. **Validación de Saldo Suficiente**

Antes de retiros o transferencias:

```javascript
const cartera = await Cartera.findById(carteraId);
if (cartera.saldo < monto) {
  throw new Error('Saldo insuficiente');
}
```

#### 3. **Auditoría Completa**

Cada operación de saldo debe generar una `TransaccionCartera`:

```javascript
await TransaccionCartera.create({
  userId: req.user._id,
  tipo: 'deposito',
  carteraDestinoId: carteraId,
  monto,
  concepto,
  fecha: fecha || new Date()
});
```

#### 4. **Sincronización con Gastos/Ingresos**

Cuando se crea un gasto o ingreso con `carteraId`, actualizar saldo automáticamente:

```javascript
// Al crear un gasto
if (gasto.carteraId) {
  await Cartera.findByIdAndUpdate(
    gasto.carteraId,
    { $inc: { saldo: -gasto.monto } }
  );

  await TransaccionCartera.create({
    userId: gasto.userId,
    tipo: 'gasto',
    carteraOrigenId: gasto.carteraId,
    monto: gasto.monto,
    concepto: gasto.descripcion,
    fecha: gasto.fecha,
    referenciaId: gasto._id
  });
}

// Al crear un ingreso
if (ingreso.carteraId) {
  await Cartera.findByIdAndUpdate(
    ingreso.carteraId,
    { $inc: { saldo: ingreso.monto } }
  );

  await TransaccionCartera.create({
    userId: ingreso.userId,
    tipo: 'ingreso',
    carteraDestinoId: ingreso.carteraId,
    monto: ingreso.monto,
    concepto: ingreso.descripcion,
    fecha: ingreso.fecha,
    referenciaId: ingreso._id
  });
}
```

#### 5. **Conversión de Moneda (Opcional Avanzado)**

Si las carteras tienen diferentes monedas:

```javascript
if (carteraOrigen.moneda !== carteraDestino.moneda) {
  const tasaCambio = await obtenerTasaCambio(
    carteraOrigen.moneda,
    carteraDestino.moneda
  );
  
  montoDestino = monto * tasaCambio;
  
  // Guardar ambos montos en la transacción
  await TransaccionCartera.create({
    tipo: 'transferencia',
    carteraOrigenId,
    carteraDestinoId,
    monto,
    montoOrigen: monto,
    montoDestino: montoDestino,
    concepto: `${concepto} (conversión ${carteraOrigen.moneda} → ${carteraDestino.moneda})`
  });
}
```

---

## Transacciones y Consistencia

### Implementación con Mongoose

```javascript
// controllers/carteras.controller.js

async function transferir(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { carteraOrigenId, carteraDestinoId, monto, concepto, fecha } = req.body;
    const userId = req.user._id;

    // Validar propiedad de ambas carteras
    const carteraOrigen = await Cartera.findOne({
      _id: carteraOrigenId,
      userId
    }).session(session);

    const carteraDestino = await Cartera.findOne({
      _id: carteraDestinoId,
      userId
    }).session(session);

    if (!carteraOrigen || !carteraDestino) {
      throw new Error('Cartera no encontrada');
    }

    if (carteraOrigen.saldo < monto) {
      throw new Error('Saldo insuficiente');
    }

    // Actualizar saldos
    carteraOrigen.saldo -= monto;
    carteraDestino.saldo += monto;

    await carteraOrigen.save({ session });
    await carteraDestino.save({ session });

    // Crear transacción
    const transaccion = await TransaccionCartera.create([{
      userId,
      tipo: 'transferencia',
      carteraOrigenId,
      carteraDestinoId,
      monto,
      concepto,
      fecha: fecha || new Date()
    }], { session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        carteraOrigen,
        carteraDestino,
        transaccion: transaccion[0]
      },
      message: 'Transferencia realizada exitosamente'
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      error: error.message
    });
  } finally {
    session.endSession();
  }
}
```

---

## Validaciones

### Middleware de Validación con Joi

```javascript
// validators/carteras.validator.js

const Joi = require('joi');

const depositarSchema = Joi.object({
  monto: Joi.number().positive().required().messages({
    'number.positive': 'El monto debe ser positivo',
    'any.required': 'El monto es requerido'
  }),
  concepto: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'El concepto es requerido',
    'string.max': 'El concepto no puede exceder 200 caracteres'
  }),
  fecha: Joi.date().max('now').optional().messages({
    'date.max': 'La fecha no puede ser futura'
  })
});

const retirarSchema = Joi.object({
  monto: Joi.number().positive().required(),
  concepto: Joi.string().min(1).max(200).required(),
  fecha: Joi.date().max('now').optional()
});

const transferirSchema = Joi.object({
  carteraOrigenId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'ID de cartera inválido',
    'string.length': 'ID de cartera inválido'
  }),
  carteraDestinoId: Joi.string().hex().length(24).required(),
  monto: Joi.number().positive().required(),
  concepto: Joi.string().min(1).max(200).required(),
  fecha: Joi.date().max('now').optional()
});

module.exports = {
  depositarSchema,
  retirarSchema,
  transferirSchema
};
```

---

## Ejemplos de Implementación

### Controller Completo

```javascript
// controllers/carteras.controller.js

const Cartera = require('../models/cartera.model');
const TransaccionCartera = require('../models/transaccionCartera.model');
const mongoose = require('mongoose');

// ============ DEPOSITAR ============
exports.depositar = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { monto, concepto, fecha } = req.body;
    const userId = req.user._id;

    // Buscar cartera
    const cartera = await Cartera.findOne({
      _id: id,
      userId
    }).session(session);

    if (!cartera) {
      throw new Error('Cartera no encontrada');
    }

    // Actualizar saldo
    cartera.saldo += monto;
    await cartera.save({ session });

    // Crear transacción
    const transaccion = await TransaccionCartera.create([{
      userId,
      tipo: 'deposito',
      carteraDestinoId: id,
      monto,
      concepto,
      fecha: fecha || new Date()
    }], { session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        cartera,
        transaccion: transaccion[0]
      },
      message: 'Depósito realizado exitosamente'
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// ============ RETIRAR ============
exports.retirar = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { monto, concepto, fecha } = req.body;
    const userId = req.user._id;

    // Buscar cartera
    const cartera = await Cartera.findOne({
      _id: id,
      userId
    }).session(session);

    if (!cartera) {
      throw new Error('Cartera no encontrada');
    }

    // Validar saldo suficiente
    if (cartera.saldo < monto) {
      throw new Error('Saldo insuficiente');
    }

    // Actualizar saldo
    cartera.saldo -= monto;
    await cartera.save({ session });

    // Crear transacción
    const transaccion = await TransaccionCartera.create([{
      userId,
      tipo: 'retiro',
      carteraOrigenId: id,
      monto,
      concepto,
      fecha: fecha || new Date()
    }], { session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        cartera,
        transaccion: transaccion[0]
      },
      message: 'Retiro realizado exitosamente'
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// ============ TRANSFERIR ============
exports.transferir = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { carteraOrigenId, carteraDestinoId, monto, concepto, fecha } = req.body;
    const userId = req.user._id;

    // Validar que no sean la misma cartera
    if (carteraOrigenId === carteraDestinoId) {
      throw new Error('No puedes transferir a la misma cartera');
    }

    // Buscar ambas carteras
    const carteraOrigen = await Cartera.findOne({
      _id: carteraOrigenId,
      userId
    }).session(session);

    const carteraDestino = await Cartera.findOne({
      _id: carteraDestinoId,
      userId
    }).session(session);

    if (!carteraOrigen || !carteraDestino) {
      throw new Error('Una o ambas carteras no fueron encontradas');
    }

    // Validar saldo suficiente
    if (carteraOrigen.saldo < monto) {
      throw new Error('Saldo insuficiente en la cartera origen');
    }

    // Actualizar saldos
    carteraOrigen.saldo -= monto;
    carteraDestino.saldo += monto;

    await carteraOrigen.save({ session });
    await carteraDestino.save({ session });

    // Crear transacción
    const transaccion = await TransaccionCartera.create([{
      userId,
      tipo: 'transferencia',
      carteraOrigenId,
      carteraDestinoId,
      monto,
      concepto,
      fecha: fecha || new Date()
    }], { session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        carteraOrigen,
        carteraDestino,
        transaccion: transaccion[0]
      },
      message: 'Transferencia realizada exitosamente'
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// ============ OBTENER TRANSACCIONES ============
exports.getTransacciones = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { tipo, fechaDesde, fechaHasta, limit = 100, offset = 0 } = req.query;

    // Verificar que la cartera existe y pertenece al usuario
    const cartera = await Cartera.findOne({ _id: id, userId });
    if (!cartera) {
      return res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
    }

    // Construir query
    const query = {
      userId,
      $or: [
        { carteraOrigenId: id },
        { carteraDestinoId: id }
      ]
    };

    if (tipo) {
      query.tipo = tipo;
    }

    if (fechaDesde || fechaHasta) {
      query.fecha = {};
      if (fechaDesde) query.fecha.$gte = new Date(fechaDesde);
      if (fechaHasta) query.fecha.$lte = new Date(fechaHasta);
    }

    // Obtener transacciones
    const transacciones = await TransaccionCartera.find(query)
      .sort({ fecha: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      data: transacciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============ OBTENER SALDO ============
exports.getSaldo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Buscar cartera
    const cartera = await Cartera.findOne({ _id: id, userId });
    if (!cartera) {
      return res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
    }

    // Calcular saldo contable
    const transacciones = await TransaccionCartera.find({
      userId,
      $or: [
        { carteraOrigenId: id },
        { carteraDestinoId: id }
      ]
    });

    let saldoContable = cartera.saldoInicial;

    for (const t of transacciones) {
      if (['deposito', 'ingreso'].includes(t.tipo) && t.carteraDestinoId?.toString() === id) {
        saldoContable += t.monto;
      } else if (['retiro', 'gasto'].includes(t.tipo) && t.carteraOrigenId?.toString() === id) {
        saldoContable -= t.monto;
      } else if (t.tipo === 'transferencia') {
        if (t.carteraDestinoId?.toString() === id) {
          saldoContable += t.monto;
        } else if (t.carteraOrigenId?.toString() === id) {
          saldoContable -= t.monto;
        }
      }
    }

    res.json({
      success: true,
      data: {
        saldo: cartera.saldo,
        saldoContable,
        diferencia: cartera.saldo - saldoContable,
        ultimaActualizacion: cartera.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============ SINCRONIZAR SALDO ============
exports.sincronizar = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Buscar cartera
    const cartera = await Cartera.findOne({
      _id: id,
      userId
    }).session(session);

    if (!cartera) {
      throw new Error('Cartera no encontrada');
    }

    // Obtener todas las transacciones
    const transacciones = await TransaccionCartera.find({
      userId,
      $or: [
        { carteraOrigenId: id },
        { carteraDestinoId: id }
      ]
    }).session(session);

    // Calcular saldo desde cero
    let saldoCalculado = cartera.saldoInicial;

    for (const t of transacciones) {
      if (['deposito', 'ingreso'].includes(t.tipo) && t.carteraDestinoId?.toString() === id) {
        saldoCalculado += t.monto;
      } else if (['retiro', 'gasto'].includes(t.tipo) && t.carteraOrigenId?.toString() === id) {
        saldoCalculado -= t.monto;
      } else if (t.tipo === 'transferencia') {
        if (t.carteraDestinoId?.toString() === id) {
          saldoCalculado += t.monto;
        } else if (t.carteraOrigenId?.toString() === id) {
          saldoCalculado -= t.monto;
        }
      }
    }

    // Actualizar saldo
    cartera.saldo = saldoCalculado;
    await cartera.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: cartera,
      message: 'Saldo sincronizado exitosamente'
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      error: error.message
    });
  } finally {
    session.endSession();
  }
};
```

### Routes

```javascript
// routes/carteras.routes.js

const express = require('express');
const router = express.Router();
const carterasController = require('../controllers/carteras.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  depositarSchema,
  retirarSchema,
  transferirSchema
} = require('../validators/carteras.validator');

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Rutas CRUD básicas (ya implementadas)
router.get('/', carterasController.getAll);
router.get('/:id', carterasController.getById);
router.post('/', carterasController.create);
router.put('/:id', carterasController.update);
router.delete('/:id', carterasController.delete);

// ============ NUEVAS RUTAS ============
router.post('/:id/depositar', validate(depositarSchema), carterasController.depositar);
router.post('/:id/retirar', validate(retirarSchema), carterasController.retirar);
router.post('/transferir', validate(transferirSchema), carterasController.transferir);
router.get('/:id/transacciones', carterasController.getTransacciones);
router.get('/:id/saldo', carterasController.getSaldo);
router.post('/:id/sincronizar', carterasController.sincronizar);

module.exports = router;
```

---

## Testing

### Pruebas Unitarias con Jest

```javascript
// tests/carteras.test.js

const request = require('supertest');
const app = require('../app');
const Cartera = require('../models/cartera.model');
const TransaccionCartera = require('../models/transaccionCartera.model');
const { generateToken } = require('../utils/jwt');

describe('Gestión de Carteras - Operaciones de Saldo', () => {
  let token;
  let userId;
  let carteraId;

  beforeAll(async () => {
    // Setup: Crear usuario y generar token
    userId = 'testUserId123';
    token = generateToken({ _id: userId });

    // Crear cartera de prueba
    const cartera = await Cartera.create({
      userId,
      nombre: 'Test Cartera',
      saldo: 1000,
      saldoInicial: 1000,
      moneda: 'EUR'
    });
    carteraId = cartera._id.toString();
  });

  afterAll(async () => {
    // Cleanup
    await Cartera.deleteMany({ userId });
    await TransaccionCartera.deleteMany({ userId });
  });

  describe('POST /api/carteras/:id/depositar', () => {
    it('debe depositar correctamente y crear transacción', async () => {
      const response = await request(app)
        .post(`/api/carteras/${carteraId}/depositar`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          monto: 500,
          concepto: 'Depósito de prueba'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cartera.saldo).toBe(1500);
      expect(response.body.data.transaccion.tipo).toBe('deposito');
      expect(response.body.data.transaccion.monto).toBe(500);
    });

    it('debe rechazar monto negativo', async () => {
      const response = await request(app)
        .post(`/api/carteras/${carteraId}/depositar`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          monto: -100,
          concepto: 'Depósito inválido'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/carteras/:id/retirar', () => {
    it('debe retirar correctamente si hay saldo suficiente', async () => {
      const response = await request(app)
        .post(`/api/carteras/${carteraId}/retirar`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          monto: 200,
          concepto: 'Retiro de prueba'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cartera.saldo).toBe(1300); // 1500 - 200
    });

    it('debe rechazar retiro con saldo insuficiente', async () => {
      const response = await request(app)
        .post(`/api/carteras/${carteraId}/retirar`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          monto: 5000,
          concepto: 'Retiro excesivo'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Saldo insuficiente');
    });
  });

  describe('POST /api/carteras/transferir', () => {
    let carteraDestinoId;

    beforeAll(async () => {
      const carteraDestino = await Cartera.create({
        userId,
        nombre: 'Cartera Destino',
        saldo: 500,
        saldoInicial: 500,
        moneda: 'EUR'
      });
      carteraDestinoId = carteraDestino._id.toString();
    });

    it('debe transferir correctamente entre carteras', async () => {
      const response = await request(app)
        .post('/api/carteras/transferir')
        .set('Authorization', `Bearer ${token}`)
        .send({
          carteraOrigenId: carteraId,
          carteraDestinoId,
          monto: 300,
          concepto: 'Transferencia de prueba'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.carteraOrigen.saldo).toBe(1000); // 1300 - 300
      expect(response.body.data.carteraDestino.saldo).toBe(800); // 500 + 300
    });
  });
});
```

---

## Resumen de Implementación

### Checklist Backend

- [ ] Ampliar modelo `Cartera` con campos: `saldo`, `saldoInicial`, `moneda`, `icono`, `color`, `activa`
- [ ] Crear modelo `TransaccionCartera`
- [ ] Implementar endpoint `POST /api/carteras/:id/depositar`
- [ ] Implementar endpoint `POST /api/carteras/:id/retirar`
- [ ] Implementar endpoint `POST /api/carteras/transferir`
- [ ] Implementar endpoint `GET /api/carteras/:id/transacciones`
- [ ] Implementar endpoint `GET /api/carteras/:id/saldo`
- [ ] Implementar endpoint `POST /api/carteras/:id/sincronizar`
- [ ] Agregar validación con Joi/Zod
- [ ] Implementar transacciones atómicas en MongoDB
- [ ] Agregar middleware de autenticación a todas las rutas
- [ ] Implementar lógica de sincronización con gastos/ingresos
- [ ] Escribir tests unitarios e integración
- [ ] Documentar API en Swagger/OpenAPI
- [ ] Configurar logging con Winston
- [ ] Implementar rate limiting para prevenir abuso

### Performance y Optimización

1. **Índices de MongoDB:**
   ```javascript
   // En modelo Cartera
   carteraSchema.index({ userId: 1, activa: 1 });
   carteraSchema.index({ userId: 1, nombre: 1 }, { unique: true });

   // En modelo TransaccionCartera
   transaccionCarteraSchema.index({ userId: 1, fecha: -1 });
   transaccionCarteraSchema.index({ carteraOrigenId: 1, fecha: -1 });
   transaccionCarteraSchema.index({ carteraDestinoId: 1, fecha: -1 });
   ```

2. **Caché (Redis):**
   - Cachear saldo de carteras (TTL: 5 minutos)
   - Invalidar caché al realizar operaciones

3. **Paginación:**
   - Limitar transacciones a 100 por request
   - Implementar cursor-based pagination para historiales largos

---

## Contacto y Soporte

**Fecha de Creación:** 2024-11-23  
**Versión del Documento:** 1.0  
**Autor:** Sistema de Gestión Finanzas - Frontend Team

Para dudas o aclaraciones sobre la implementación backend, consultar este documento o contactar al equipo de desarrollo.

---

**Última actualización:** 2024-11-23

