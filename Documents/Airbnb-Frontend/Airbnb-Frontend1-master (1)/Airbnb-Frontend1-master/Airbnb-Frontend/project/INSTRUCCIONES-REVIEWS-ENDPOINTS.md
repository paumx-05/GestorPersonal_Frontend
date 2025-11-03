# 🔧 Instrucciones: Endpoints de Reviews - Backend

## 📋 Problema Identificado

El frontend está recibiendo errores de validación porque el formato de respuesta del backend no coincide con lo esperado.

**Error actual:**
```
Expected object, received array at path ["data"]
```

Esto significa que el backend está devolviendo:
```json
{
  "success": true,
  "data": [...]  // ← Array directo
}
```

Pero el frontend espera:
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "averageRating": 4.8
  }
}
```

---

## ✅ Solución Implementada

El código del frontend ahora **normaliza automáticamente** diferentes formatos de respuesta del backend. Sin embargo, para una integración más estable, es recomendable que el backend devuelva un formato consistente.

---

## 🔗 Endpoints Requeridos

Según la documentación de Postman de tu backend, los siguientes endpoints deben estar implementados:

### 1. **GET Reviews de una Propiedad**

#### Opción A (Recomendada):
```
GET /api/reviews?propertyId={propertyId}&page={page}&limit={limit}&sort={sort}
```

**Query Params:**
- `propertyId` (requerido): ID de la propiedad
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Cantidad por página (default: 10)
- `sort` (opcional): `newest` | `oldest` | `highest` | `lowest` (default: newest)

**Response Esperado:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "string",
        "propertyId": "string",
        "userId": "string",
        "user": {
          "id": "string",
          "name": "string",
          "avatar": "string (opcional)"
        },
        "rating": 5,
        "comment": "string (opcional)",
        "createdAt": "ISO datetime",
        "updatedAt": "ISO datetime (opcional)"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "averageRating": 4.8
  },
  "message": "Reviews obtenidas exitosamente"
}
```

#### Opción B (Alternativa):
```
GET /api/reviews/property/{propertyId}?page={page}&limit={limit}
```

#### Opción C (Alternativa):
```
GET /api/properties/{propertyId}/reviews?page={page}&limit={limit}
```

---

### 2. **POST Crear Review**

#### Opción A (Recomendada):
```
POST /api/reviews
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "propertyId": "string",
  "rating": 5,
  "comment": "Excelente experiencia, muy recomendado."
}
```

**Response Esperado:**
```json
{
  "success": true,
  "message": "Review creada exitosamente",
  "data": {
    "review": {
      "id": "string",
      "propertyId": "string",
      "userId": "string",
      "rating": 5,
      "comment": "Excelente experiencia, muy recomendado.",
      "createdAt": "ISO datetime"
    }
  }
}
```

#### Opción B (Alternativa):
```
POST /api/reviews/create
```
Con el mismo body y response.

#### Opción C (Alternativa):
```
POST /api/reviews/add
```
Con el mismo body y response.

#### Opción D (Alternativa):
```
POST /api/properties/{propertyId}/reviews
```
**Request Body (sin propertyId, va en la URL):**
```json
{
  "rating": 5,
  "comment": "Excelente experiencia, muy recomendado."
}
```

#### Opción E (Alternativa):
```
POST /api/reviews/property/{propertyId}
```
**Request Body (sin propertyId, va en la URL):**
```json
{
  "rating": 5,
  "comment": "Excelente experiencia, muy recomendado."
}
```

---

### 3. **PUT Actualizar Review**
```
PUT /api/reviews/{reviewId}
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Actualizado: Muy bueno pero podría mejorar."
}
```

**Response Esperado:**
```json
{
  "success": true,
  "message": "Review actualizada exitosamente",
  "data": {
    "review": {
      "id": "string",
      "rating": 4,
      "comment": "Actualizado: Muy bueno pero podría mejorar.",
      "updatedAt": "ISO datetime"
    }
  }
}
```

---

### 4. **DELETE Eliminar Review**
```
DELETE /api/reviews/{reviewId}
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response Esperado:**
```json
{
  "success": true,
  "message": "Review eliminada exitosamente"
}
```

---

## 🔍 Cómo Verificar en Postman

1. **Abre Postman** y busca la colección de tu backend
2. **Busca endpoints relacionados con reviews** en las siguientes ubicaciones:
   - `/api/reviews`
   - `/api/properties/.../reviews`
   - `/api/reviews/...`

3. **Verifica el formato de respuesta:**
   - Si el endpoint devuelve `{ success: true, data: [...] }` (array), el frontend lo normalizará automáticamente
   - Si el endpoint devuelve `{ success: true, data: { reviews: [...] } }` (objeto), funcionará directamente

4. **Prueba crear una review:**
   - Verifica qué endpoint acepta POST
   - Verifica si requiere `propertyId` en el body o en la URL

---

## 📝 Notas Importantes

### Formato de Respuesta Flexible

El frontend ahora acepta **múltiples formatos** de respuesta:

✅ **Formato 1 (Ideal):**
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "total": 25,
    "averageRating": 4.8
  }
}
```

✅ **Formato 2 (También funciona):**
```json
{
  "success": true,
  "data": [...]  // Array directo
}
```

✅ **Formato 3 (También funciona):**
```json
{
  "success": true,
  "reviews": [...]  // Array en propiedad reviews
}
```

✅ **Formato 4 (También funciona):**
```json
[...]  // Array directo sin wrapper
```

### Validaciones del Backend

Asegúrate de que el backend valide:

- `rating`: número entre 1 y 5 (requerido)
- `comment`: string, mínimo 10 caracteres, máximo 1000 (opcional)
- `propertyId`: string válido (requerido)
- `userId`: extraído del token JWT (NO del body)

### Permisos

- **Crear review:** Usuario autenticado (puede requerir que haya reservado la propiedad)
- **Actualizar review:** Solo el autor de la review
- **Eliminar review:** Solo el autor o admin

---

## 🚀 Próximos Pasos

1. **Verifica en Postman** cuál de los endpoints listados arriba está implementado
2. **Revisa el formato de respuesta** que devuelve cada endpoint
3. **Prueba crear una review** y verifica que el frontend la reciba correctamente
4. **Si ningún endpoint funciona**, comparte:
   - El endpoint exacto que aparece en Postman
   - El formato de request/response que espera el backend
   - Y lo actualizaré en el código del frontend

---

## 💡 Tip: Endpoints Más Probables

Basándome en los patrones de tu backend (como `/api/favorites/add`), los endpoints más probables son:

1. **GET reviews:** `GET /api/reviews?propertyId={id}`
2. **POST create:** `POST /api/reviews` (con `propertyId` en body)

Verifica estos primero en Postman.

