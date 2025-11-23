# Integración Backend: Sistema de Múltiples Carteras

## Objetivo
Este documento describe la implementación del sistema de múltiples carteras en el backend, permitiendo a los usuarios gestionar ingresos, gastos y presupuestos de forma separada por cartera. Cada usuario puede tener múltiples carteras y cambiar entre ellas fácilmente.

---

## 🎯 Flujo del Sistema de Carteras

El sistema de carteras funciona de la siguiente manera:

1. **Crear cartera** → El usuario crea una nueva cartera con nombre y descripción opcional
2. **Obtener carteras** → Listar todas las carteras del usuario autenticado
3. **Seleccionar cartera activa** → El frontend mantiene la cartera activa en localStorage
4. **Filtrar datos por cartera** → Gastos, ingresos y presupuestos se filtran por `carteraId`
5. **Gestionar carteras** → Actualizar o eliminar carteras existentes

**Importante:** 
- Los usuarios solo pueden acceder a sus propias carteras
- Todas las operaciones están protegidas por autenticación
- El campo `carteraId` es **opcional** en gastos, ingresos y presupuestos para mantener retrocompatibilidad
- Si no se proporciona `carteraId`, los datos se consideran de la "cartera por defecto" (null)

---

## 🏗️ Estructura del Backend (MVC)

### Modelo de Datos

#### 1. Modelo de Cartera

**Schema MongoDB (Mongoose):**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required, indexado),
  nombre: String (required, maxLength: 100, trim: true),
  descripcion: String (optional, maxLength: 500, trim: true),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Índices recomendados:**
- `userId` (índice simple) - Para búsquedas rápidas por usuario
- `userId + nombre` (índice compuesto único) - Para evitar duplicados de nombre por usuario

#### 2. Modificaciones a Modelos Existentes

**Gastos, Ingresos y Presupuestos deben incluir:**
```javascript
carteraId: ObjectId (ref: 'Cartera', optional, indexado)
```

**Índices recomendados:**
- `userId + carteraId` (índice compuesto) - Para búsquedas eficientes
- `userId + mes + carteraId` (índice compuesto) - Para consultas por mes y cartera

---

## 📋 Endpoints de Carteras

### Base URL
```
http://localhost:4444
```

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

### 1. Obtener Todas las Carteras del Usuario

**Endpoint:**
```
GET /api/carteras
```

**Descripción:** Obtiene todas las carteras del usuario autenticado, ordenadas por fecha de creación (más recientes primero).

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/carteras
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "nombre": "Personal",
      "descripcion": "Cartera para gastos personales",
      "createdAt": "2024-11-01T10:00:00.000Z",
      "updatedAt": "2024-11-01T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439012",
      "nombre": "Negocio",
      "descripcion": "Cartera para gastos del negocio",
      "createdAt": "2024-11-02T10:00:00.000Z",
      "updatedAt": "2024-11-02T10:00:00.000Z"
    }
  ]
}
```

**Campos de respuesta:**
- `_id`: ID único de la cartera
- `userId`: ID del usuario propietario
- `nombre`: Nombre de la cartera
- `descripcion`: Descripción opcional de la cartera
- `createdAt`: Fecha de creación en formato ISO
- `updatedAt`: Fecha de última actualización en formato ISO

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

---

### 2. Obtener Cartera por ID

**Endpoint:**
```
GET /api/carteras/:id
```

**Descripción:** Obtiene una cartera específica por su ID. Solo puede acceder a sus propias carteras.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la cartera

**Ejemplo de uso:**
```
GET /api/carteras/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Personal",
    "descripcion": "Cartera para gastos personales",
    "createdAt": "2024-11-01T10:00:00.000Z",
    "updatedAt": "2024-11-01T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada o no pertenece al usuario
- `500`: Error del servidor

---

### 3. Crear Nueva Cartera

**Endpoint:**
```
POST /api/carteras
```

**Descripción:** Crea una nueva cartera para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Personal",
  "descripcion": "Cartera para gastos personales"
}
```

**Campos requeridos:**
- `nombre` (string): Nombre de la cartera (máximo 100 caracteres, requerido)

**Campos opcionales:**
- `descripcion` (string): Descripción de la cartera (máximo 500 caracteres)

**Validaciones:**
- `nombre`: Requerido, no vacío, máximo 100 caracteres, trim
- `descripcion`: Opcional, máximo 500 caracteres, trim
- No puede haber dos carteras con el mismo nombre para el mismo usuario

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Personal",
    "descripcion": "Cartera para gastos personales",
    "createdAt": "2024-11-01T10:00:00.000Z",
    "updatedAt": "2024-11-01T10:00:00.000Z"
  },
  "message": "Cartera creada exitosamente"
}
```

**Errores posibles:**
- `400`: Datos inválidos (nombre vacío, muy largo, etc.)
- `401`: Usuario no autenticado
- `409`: Ya existe una cartera con ese nombre para el usuario
- `500`: Error del servidor

---

### 4. Actualizar Cartera

**Endpoint:**
```
PUT /api/carteras/:id
```

**Descripción:** Actualiza una cartera existente. Solo puede actualizar sus propias carteras.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, requerido): ID de la cartera

**Request Body:**
```json
{
  "nombre": "Personal Actualizado",
  "descripcion": "Nueva descripción"
}
```

**Campos opcionales (debe enviarse al menos uno):**
- `nombre` (string): Nuevo nombre de la cartera (máximo 100 caracteres)
- `descripcion` (string): Nueva descripción (máximo 500 caracteres)

**Validaciones:**
- Debe proporcionar al menos un campo para actualizar
- `nombre`: Si se proporciona, no vacío, máximo 100 caracteres, trim
- `descripcion`: Si se proporciona, máximo 500 caracteres, trim
- No puede haber dos carteras con el mismo nombre para el mismo usuario

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Personal Actualizado",
    "descripcion": "Nueva descripción",
    "createdAt": "2024-11-01T10:00:00.000Z",
    "updatedAt": "2024-11-01T15:30:00.000Z"
  },
  "message": "Cartera actualizada exitosamente"
}
```

**Errores posibles:**
- `400`: Datos inválidos o ningún campo proporcionado
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada o no pertenece al usuario
- `409`: Ya existe una cartera con ese nombre para el usuario
- `500`: Error del servidor

---

### 5. Eliminar Cartera

**Endpoint:**
```
DELETE /api/carteras/:id
```

**Descripción:** Elimina una cartera. Solo puede eliminar sus propias carteras.

**⚠️ IMPORTANTE:** Antes de eliminar una cartera, el backend debe:
1. Verificar que la cartera pertenece al usuario
2. **Opcionalmente:** Preguntar si se deben eliminar también los gastos, ingresos y presupuestos asociados, o si se deben mover a otra cartera (null = cartera por defecto)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la cartera

**Query Parameters (opcionales):**
- `deleteData` (boolean, default: false): Si es `true`, elimina todos los gastos, ingresos y presupuestos asociados. Si es `false`, los mantiene sin cartera (carteraId = null).

**Ejemplo de uso:**
```
DELETE /api/carteras/507f1f77bcf86cd799439011?deleteData=false
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cartera eliminada exitosamente"
}
```

**Errores posibles:**
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada o no pertenece al usuario
- `500`: Error del servidor

---

## 🔄 Modificaciones a Endpoints Existentes

### Gastos

Todos los endpoints de gastos deben aceptar `carteraId` como parámetro opcional:

#### GET /api/gastos/:mes
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar gastos por cartera específica

**Ejemplo:**
```
GET /api/gastos/noviembre?carteraId=507f1f77bcf86cd799439011
```

**Lógica del backend:**
- Si se proporciona `carteraId`, filtrar gastos donde `carteraId` coincida
- Si no se proporciona `carteraId`, retornar todos los gastos del usuario (incluyendo los que tienen `carteraId = null`)

#### POST /api/gastos
**Request Body debe incluir:**
```json
{
  "descripcion": "Compra en supermercado",
  "monto": 150.50,
  "fecha": "2024-11-15T10:00:00.000Z",
  "categoria": "Alimentación",
  "mes": "noviembre",
  "carteraId": "507f1f77bcf86cd799439011"  // Opcional
}
```

#### PUT /api/gastos/:id
**Request Body puede incluir:**
```json
{
  "carteraId": "507f1f77bcf86cd799439011"  // Opcional, para mover gasto a otra cartera
}
```

#### GET /api/gastos/:mes/total
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar total por cartera específica

#### GET /api/gastos/:mes/categoria/:categoria
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar por cartera específica

---

### Ingresos

Todos los endpoints de ingresos deben aceptar `carteraId` como parámetro opcional:

#### GET /api/ingresos/:mes
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar ingresos por cartera específica

#### POST /api/ingresos
**Request Body debe incluir:**
```json
{
  "descripcion": "Salario mensual",
  "monto": 5000,
  "fecha": "2024-11-01T10:00:00.000Z",
  "categoria": "Salario",
  "mes": "noviembre",
  "carteraId": "507f1f77bcf86cd799439011"  // Opcional
}
```

#### PUT /api/ingresos/:id
**Request Body puede incluir:**
```json
{
  "carteraId": "507f1f77bcf86cd799439011"  // Opcional
}
```

#### GET /api/ingresos/:mes/total
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar total por cartera específica

#### GET /api/ingresos/:mes/categoria/:categoria
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar por cartera específica

---

### Presupuestos

Todos los endpoints de presupuestos deben aceptar `carteraId` como parámetro opcional:

#### GET /api/presupuestos/:mes
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar presupuestos por cartera específica

#### POST /api/presupuestos
**Request Body debe incluir:**
```json
{
  "mes": "noviembre",
  "categoria": "Alimentación",
  "monto": 500,
  "totalIngresos": 2500,
  "carteraId": "507f1f77bcf86cd799439011"  // Opcional
}
```

#### PUT /api/presupuestos/:id
**Request Body puede incluir:**
```json
{
  "carteraId": "507f1f77bcf86cd799439011"  // Opcional
}
```

#### DELETE /api/presupuestos/:mes/:categoria
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar por cartera específica

#### GET /api/presupuestos/:mes/total
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar total por cartera específica

#### GET /api/presupuestos/:mes/resumen
**Query Parameters:**
- `carteraId` (string, opcional): Filtrar resumen por cartera específica

---

## 🔒 Seguridad y Validaciones

### Validaciones de Seguridad

1. **Autenticación requerida:** Todos los endpoints requieren token JWT válido
2. **Autorización:** Los usuarios solo pueden acceder a sus propias carteras
3. **Validación de carteraId:** 
   - Si se proporciona `carteraId`, verificar que pertenece al usuario autenticado
   - Si no pertenece al usuario, retornar error 403 o 404
4. **Unicidad de nombre:** No puede haber dos carteras con el mismo nombre para el mismo usuario

### Validaciones de Datos

**Cartera:**
- `nombre`: Requerido, no vacío, máximo 100 caracteres, trim
- `descripcion`: Opcional, máximo 500 caracteres, trim

**carteraId en Gastos/Ingresos/Presupuestos:**
- Opcional (puede ser null o undefined)
- Si se proporciona, debe ser un ObjectId válido
- Debe existir en la colección de carteras y pertenecer al usuario

---

## 📊 Migración de Datos Existentes

### Estrategia de Migración

Los datos existentes (gastos, ingresos, presupuestos) que no tienen `carteraId` se consideran parte de la "cartera por defecto" (null).

**Opciones de migración:**

1. **Sin migración automática (recomendado):**
   - Los datos existentes quedan con `carteraId = null`
   - El frontend puede crear una cartera "Por Defecto" y asignarla manualmente si lo desea

2. **Migración automática:**
   - Crear una cartera "Por Defecto" para cada usuario existente
   - Asignar todos los datos sin `carteraId` a esta cartera
   - Ejecutar script de migración una sola vez

**Script de migración sugerido (MongoDB):**
```javascript
// Crear cartera por defecto para usuarios existentes
db.users.find().forEach(function(user) {
  const carteraPorDefecto = {
    userId: user._id,
    nombre: "Por Defecto",
    descripcion: "Cartera creada automáticamente para datos existentes",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const cartera = db.carteras.insertOne(carteraPorDefecto);
  
  // Asignar datos existentes a la cartera por defecto
  db.gastos.updateMany(
    { userId: user._id, carteraId: { $exists: false } },
    { $set: { carteraId: cartera.insertedId } }
  );
  
  db.ingresos.updateMany(
    { userId: user._id, carteraId: { $exists: false } },
    { $set: { carteraId: cartera.insertedId } }
  );
  
  db.presupuestos.updateMany(
    { userId: user._id, carteraId: { $exists: false } },
    { $set: { carteraId: cartera.insertedId } }
  );
});
```

---

## 🧪 Casos de Prueba Sugeridos

### Endpoints de Carteras

1. **Crear cartera:**
   - ✅ Crear cartera con nombre válido
   - ✅ Crear cartera con nombre y descripción
   - ❌ Crear cartera sin nombre
   - ❌ Crear cartera con nombre duplicado
   - ❌ Crear cartera sin autenticación

2. **Obtener carteras:**
   - ✅ Obtener todas las carteras del usuario
   - ✅ No obtener carteras de otros usuarios
   - ❌ Obtener carteras sin autenticación

3. **Actualizar cartera:**
   - ✅ Actualizar nombre de cartera
   - ✅ Actualizar descripción
   - ✅ Actualizar ambos campos
   - ❌ Actualizar cartera de otro usuario
   - ❌ Actualizar con nombre duplicado

4. **Eliminar cartera:**
   - ✅ Eliminar cartera propia
   - ✅ Eliminar cartera con deleteData=true
   - ✅ Eliminar cartera con deleteData=false
   - ❌ Eliminar cartera de otro usuario

### Integración con Gastos/Ingresos/Presupuestos

1. **Filtrado por cartera:**
   - ✅ Obtener gastos de una cartera específica
   - ✅ Obtener gastos sin cartera (null)
   - ✅ Obtener todos los gastos (sin filtro)
   - ❌ Obtener gastos de cartera de otro usuario

2. **Crear con cartera:**
   - ✅ Crear gasto con carteraId válido
   - ✅ Crear gasto sin carteraId (null)
   - ❌ Crear gasto con carteraId de otro usuario

---

## 📝 Notas de Implementación

### Consideraciones Importantes

1. **Retrocompatibilidad:**
   - El campo `carteraId` es opcional en todos los modelos
   - Los endpoints deben funcionar tanto con `carteraId` como sin él
   - Los datos existentes sin `carteraId` deben seguir funcionando

2. **Rendimiento:**
   - Usar índices compuestos para consultas eficientes
   - Considerar paginación si un usuario tiene muchas carteras

3. **Integridad de Datos:**
   - Al eliminar una cartera, decidir qué hacer con los datos asociados
   - Considerar restricciones de integridad referencial (opcional)

4. **Límites:**
   - Considerar un límite máximo de carteras por usuario (ej: 10-20)
   - Validar límites en el endpoint de creación

---

## 🔗 Referencias

- Modelos relacionados: `Gasto`, `Ingreso`, `Presupuesto`
- Endpoints relacionados: `/api/gastos`, `/api/ingresos`, `/api/presupuestos`
- Autenticación: JWT Bearer Token

---

## ✅ Checklist de Implementación

- [ ] Crear modelo `Cartera` en MongoDB/Mongoose
- [ ] Agregar campo `carteraId` (opcional) a modelos `Gasto`, `Ingreso`, `Presupuesto`
- [ ] Crear índices necesarios
- [ ] Implementar endpoints CRUD de carteras
- [ ] Modificar endpoints de gastos para aceptar `carteraId` en query params
- [ ] Modificar endpoints de ingresos para aceptar `carteraId` en query params
- [ ] Modificar endpoints de presupuestos para aceptar `carteraId` en query params
- [ ] Agregar validaciones de seguridad (autorización)
- [ ] Implementar lógica de eliminación de cartera (con opción deleteData)
- [ ] Crear script de migración (opcional)
- [ ] Escribir tests unitarios y de integración
- [ ] Documentar cambios en API

---

**Última actualización:** 2024-11-16

