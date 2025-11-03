# Propiedades - Actualización (Update): Reporte de Integración

## 📋 Resumen

Este reporte documenta la integración del módulo de **actualización de propiedades** en el panel de administración. El módulo permite a los usuarios admin actualizar cualquier propiedad registrada en la base de datos MongoDB Atlas, independientemente de quién la creó.

**Alcance:** Actualización de propiedades existentes mediante formulario modal en `/admin/properties`.

---

## 🔗 Endpoints

### Endpoint Principal
- **Método:** `PUT`
- **Path:** `/api/host/properties/:id`
- **Auth:** Requerida (JWT token en header `Authorization: Bearer <token>`)
- **Content-Type:** `application/json`

### Endpoint Alternativo (Fallback)
- **Método:** `PUT`
- **Path:** `/api/properties/:id`
- **Uso:** Se intenta automáticamente si el endpoint principal devuelve 404

### Configuración
El endpoint puede configurarse mediante variable de entorno:
```env
NEXT_PUBLIC_PROPERTIES_UPDATE_ENDPOINT=/ruta/correcta/:id
```

### Request Body
```typescript
interface UpdatePropertyRequest {
  title?: string;
  location?: string;
  city?: string;
  pricePerNight?: number;
  propertyType?: 'entire' | 'private' | 'shared';
  amenities?: string[];
  instantBook?: boolean;
  maxGuests?: number;
  description?: string;
  imageUrl?: string;
}
```

**Nota:** Todos los campos son opcionales (parcial update).

### Response Esperado

#### Éxito (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "location": "string | object",
    "city": "string",
    "pricePerNight": number,
    "propertyType": "entire" | "private" | "shared",
    "amenities": string[],
    "instantBook": boolean,
    "maxGuests": number,
    "description": "string",
    "imageUrl": "string",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "message": "Propiedad actualizada exitosamente"
}
```

#### Error - Propiedad no encontrada (404)
```json
{
  "success": false,
  "message": "Propiedad no encontrada"
}
```

#### Error - Sin permisos (403)
```json
{
  "success": false,
  "message": "No tienes permisos para actualizar esta propiedad"
}
```

#### Error - No autenticado (401)
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

#### Error - Validación (400)
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": {
    "field": "mensaje de error"
  }
}
```

---

## 🔧 Cambios en Frontend

### Archivos Modificados

#### 1. `lib/api/properties.ts`
**Líneas:** 523-612

**Cambios:**
- ✅ Implementado `updateProperty()` con logs detallados
- ✅ Fallback automático a `/api/properties/:id` si el endpoint principal devuelve 404
- ✅ Manejo exhaustivo de errores con mensajes específicos
- ✅ Logging completo de request/response para debugging
- ✅ Medición de tiempo de respuesta

**Interface TypeScript:**
```typescript
async updateProperty(
  id: string, 
  propertyData: UpdatePropertyRequest
): Promise<{ success: boolean; data?: Property; message?: string }>
```

#### 2. `app/admin/properties/page.tsx`
**Líneas:** 307-414

**Cambios:**
- ✅ Validación de campos requeridos antes de enviar
- ✅ Construcción correcta de `UpdatePropertyRequest` con datos del formulario
- ✅ Manejo de estados (loading, success, error)
- ✅ Recarga automática de propiedades después de actualizar exitosamente
- ✅ Logs detallados en cada paso del proceso
- ✅ Mensajes de error específicos según tipo de error (401, 403, 404, network)

**Flujo:**
1. Usuario hace click en botón "Editar" (ícono lápiz)
2. Se abre diálogo modal con formulario pre-poblado
3. Usuario modifica campos
4. Click en "Actualizar"
5. Validación client-side
6. Llamada a `propertyService.updateProperty()`
7. Si éxito → cierra diálogo, recarga lista, muestra toast de éxito
8. Si error → muestra toast con mensaje específico

**Función clave:**
```typescript
const handleSaveProperty = async () => {
  // Validación
  // Construcción de UpdatePropertyRequest
  // Llamada a propertyService.updateProperty()
  // Manejo de respuesta (success/error)
  // Recarga de propiedades
}
```

#### 3. `lib/api/config.ts`
**Líneas:** 212-222

**Estado:** ✅ Ya implementado correctamente
- Método PUT envía body como JSON
- Headers de autenticación se agregan automáticamente
- Logs de request/response disponibles

---

## 📐 Tipos/Validaciones

### TypeScript Interfaces

```typescript
export interface UpdatePropertyRequest {
  title?: string;
  location?: string;
  city?: string;
  pricePerNight?: number;
  propertyType?: 'entire' | 'private' | 'shared';
  amenities?: string[];
  instantBook?: boolean;
  maxGuests?: number;
  description?: string;
  imageUrl?: string;
}
```

**Características:**
- Todos los campos son opcionales (permite actualización parcial)
- `propertyType` tiene valores específicos (union type)
- `amenities` es un array de strings
- Tipos numéricos validados antes de enviar

### Validación Client-Side

En `app/admin/properties/page.tsx`:

```typescript
// Validación antes de enviar
if (!formData.title?.trim()) {
  toast.error('El título es requerido');
  return;
}
if (!formData.location?.trim()) {
  toast.error('La ubicación es requerida');
  return;
}
// ... más validaciones
```

**Nota:** La validación del backend puede diferir. Los errores de validación del backend se muestran al usuario a través del campo `response.message` y `response.errors`.

---

## 🎯 Estados y Errores

### Estados UI

#### Loading
- **Estado:** `isSubmitting === true`
- **Indicador:** Botón muestra spinner y texto "Actualizando..."
- **Bloqueo:** Formulario deshabilitado durante la petición

#### Success
- **Estado:** `response.success === true`
- **Acción:** 
  - Cierra diálogo modal
  - Recarga lista de propiedades (`getAllProperties()`)
  - Muestra toast de éxito: "Propiedad actualizada exitosamente"

#### Error
- **Estados posibles:**
  - `401 Unauthorized` → "Sesión expirada. Por favor, inicia sesión nuevamente"
  - `403 Forbidden` → "No tienes permisos para actualizar esta propiedad"
  - `404 Not Found` → Mensaje detallado indicando que el endpoint no existe
  - `Network Error` → "Error de conexión. Verifica que el backend esté corriendo"
  - `Otros` → Muestra mensaje del backend o mensaje genérico

#### Empty State
- No aplica (esta operación no tiene estado vacío)

### Estrategia de Retry

**No implementado actualmente.** Las peticiones fallidas requieren intervención manual del usuario (reintentar haciendo click nuevamente).

**Mejora futura recomendada:**
- Reintentar automáticamente en caso de error de red
- Máximo 3 intentos con backoff exponencial

---

## 📊 Observabilidad

### Logs Implementados

#### En `lib/api/properties.ts` (updateProperty)

**Request:**
```
🔍 [propertyService] ============================================
🔍 [propertyService] ACTUALIZANDO PROPIEDAD
🔍 [propertyService] ID de propiedad: <id>
🔍 [propertyService] Datos a actualizar: {...}
🔍 [propertyService] URL base: http://localhost:5000
🔄 [propertyService] Endpoint completo: <full-url>
🔄 [propertyService] Método: PUT
🔄 [propertyService] Body: {...}
```

**Response:**
```
⏱️ [propertyService] Tiempo de respuesta: XXXms
📥 [propertyService] Respuesta completa del backend: {...}
✅ [propertyService] Propiedad actualizada exitosamente
```

**Error:**
```
💥 [propertyService] ERROR ACTUALIZANDO PROPIEDAD
💥 [propertyService] Mensaje: <error-message>
💥 [propertyService] Stack: <stack-trace>
❌ [propertyService] ERROR 404: Endpoint no encontrado (si aplica)
```

#### En `app/admin/properties/page.tsx` (handleSaveProperty)

**Request:**
```
📝 [AdminProperties] ============================================
📝 [AdminProperties] ACTUALIZANDO PROPIEDAD
📝 [AdminProperties] ID: <id>
📝 [AdminProperties] Título: <title>
📝 [AdminProperties] Datos a enviar: {...}
```

**Response:**
```
📥 [AdminProperties] Respuesta del backend: {...}
✅ [AdminProperties] Propiedad actualizada exitosamente
🔄 [AdminProperties] Recargando lista de propiedades...
✅ [AdminProperties] Propiedades actualizadas: X propiedades
```

**Error:**
```
💥 [AdminProperties] ERROR GUARDANDO PROPIEDAD
💥 [AdminProperties] Mensaje: <error-message>
💥 [AdminProperties] Stack: <stack-trace>
```

### Métricas Registradas

- ⏱️ **Tiempo de respuesta** (latencia) de cada petición
- 📊 **Status code** HTTP de la respuesta
- 🔄 **Uso de endpoint fallback** (si el principal falla con 404)

### Dónde Ver los Logs

**Navegador:**
- Abrir DevTools (F12)
- Pestaña "Console"
- Filtrar por `[propertyService]` o `[AdminProperties]`

**Network Tab:**
- Pestaña "Network"
- Filtrar por método `PUT`
- Ver request/response completa, headers, timing

---

## ⚠️ Riesgos y Next Steps

### Riesgos Identificados

1. **Endpoint no implementado en backend**
   - **Riesgo:** El backend podría no tener `PUT /api/host/properties/:id` implementado
   - **Mitigación:** Fallback automático a `/api/properties/:id` si recibe 404
   - **Solución definitiva:** Verificar en Postman y actualizar endpoint o solicitar implementación

2. **Validación inconsistente**
   - **Riesgo:** Validación client-side puede diferir del backend
   - **Mitigación:** Mostrar errores de validación del backend al usuario
   - **Mejora:** Alinear validaciones o usar Zod para validación compartida

3. **Permisos insuficientes**
   - **Riesgo:** Usuario admin podría no tener permisos para actualizar propiedades de otros usuarios
   - **Mitigación:** Backend debe verificar `role: 'admin'` y permitir actualización de cualquier propiedad
   - **Verificación:** Probar actualizando propiedad creada por otro usuario

4. **Token expirado durante la operación**
   - **Riesgo:** Token JWT puede expirar entre carga de página y actualización
   - **Mitigación:** `apiClient` intenta renovar token automáticamente si recibe 401/403
   - **Mejora:** Pre-renovar token antes de operaciones críticas

### Próximos Pasos

#### Inmediatos
1. ✅ **Verificar endpoint en Postman**
   - Confirmar que `PUT /api/host/properties/:id` existe
   - Si no existe, identificar el endpoint correcto
   - Actualizar código o variable de entorno

2. ✅ **Probar flujo completo**
   - Login como admin
   - Editar propiedad propia
   - Editar propiedad de otro usuario
   - Verificar que los cambios se reflejan en MongoDB Atlas

#### Mejoras Futuras
1. **Implementar retry automático**
   - Reintentar en caso de error de red
   - Backoff exponencial (1s, 2s, 4s)

2. **Validación con Zod**
   - Crear schema Zod para `UpdatePropertyRequest`
   - Validar tanto en cliente como compartir con backend
   - Mejorar mensajes de error de validación

3. **Optimistic Updates**
   - Actualizar UI inmediatamente antes de confirmación del backend
   - Revertir si falla la petición

4. **Detección de cambios**
   - Mostrar advertencia si el usuario intenta salir con cambios sin guardar
   - Comparar `formData` con `editingProperty` original

5. **Historial de cambios**
   - Guardar historial de modificaciones en backend
   - Mostrar quién y cuándo actualizó cada propiedad

---

## ✅ Checklist de Integración

### Código
- [x] Sin usos de mock en código activo
- [x] Contratos tipados (`UpdatePropertyRequest`, `Property`)
- [x] Validación client-side de campos requeridos
- [x] Manejo completo de estados (loading, success, error)
- [x] Errores manejados con mensajes útiles
- [x] Logs detallados para debugging
- [x] Fallback a endpoint alternativo si el principal falla
- [x] Recarga de lista después de actualización exitosa

### Endpoints
- [ ] Endpoint `PUT /api/host/properties/:id` verificado en Postman
- [ ] Auth (JWT token) funcionando correctamente
- [ ] Permisos verificados (admin puede actualizar cualquier propiedad)
- [ ] Response format validado (success, data, message)

### Testing
- [ ] Actualizar propiedad propia (admin)
- [ ] Actualizar propiedad de otro usuario (admin)
- [ ] Verificar que cambios se reflejan en MongoDB Atlas
- [ ] Probar con campos opcionales solamente
- [ ] Probar con validación fallida (campos inválidos)
- [ ] Probar con token expirado (debe renovar automáticamente)

### Documentación
- [x] Reporte `report-properties-update.md` generado
- [x] Logs documentados
- [x] Endpoints documentados
- [x] Riesgos y próximos pasos identificados

---

## 📝 Notas Técnicas

### Configuración de Endpoint

El endpoint puede configurarse mediante variable de entorno:

```env
# .env.local
NEXT_PUBLIC_PROPERTIES_UPDATE_ENDPOINT=/api/host/properties/:id
```

**Nota:** El `:id` en la variable de entorno se reemplaza dinámicamente con el ID real de la propiedad.

### Flujo de Datos

```
Usuario (UI) 
  → handleEditProperty() [pre-llena formulario]
  → Usuario modifica campos
  → handleSaveProperty() [valida campos]
  → propertyService.updateProperty() [construye request]
  → apiClient.put() [envía petición HTTP]
  → Backend API
  → MongoDB Atlas (actualiza documento)
  → Backend API (devuelve response)
  → propertyService.updateProperty() [procesa response]
  → handleSaveProperty() [actualiza UI]
  → Recarga lista de propiedades
```

### Dependencias

- `@/lib/api/config` → `ApiClient` (cliente HTTP)
- `@/lib/api/properties` → `propertyService` (servicio de propiedades)
- `@/context/AuthContext` → `useAuth()` (autenticación)
- `sonner` → `toast` (notificaciones)

---

## 🎯 Conclusión

El módulo de actualización de propiedades está **implementado correctamente** con:
- ✅ Logs exhaustivos para debugging
- ✅ Manejo robusto de errores
- ✅ Fallback automático a endpoint alternativo
- ✅ Validación client-side
- ✅ Estados de UI completos

**Pendiente de verificación:**
- ⚠️ Confirmar que el endpoint `PUT /api/host/properties/:id` existe en el backend
- ⚠️ Probar actualización de propiedades de otros usuarios (permisos admin)
- ⚠️ Verificar que los cambios se persisten en MongoDB Atlas

**Una vez verificados estos puntos, el módulo estará completamente funcional.**

