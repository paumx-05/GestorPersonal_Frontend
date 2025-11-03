# Verificación del Flujo de Creación de Propiedades

## 🎯 Objetivo

Verificar que tanto usuarios **admin** como usuarios **normales** pueden crear propiedades que se registren correctamente en MongoDB Atlas.

## 📋 Flujo Actual

### 1. Usuario Normal (Mis Propiedades)
- **Ruta:** `/my-properties`
- **Archivo:** `app/my-properties/page.tsx`
- **Método:** `handleSaveProperty()`
- **Endpoint usado:** `POST /api/host/properties` (a través de `propertyService.createProperty()`)

### 2. Usuario Admin (Gestión de Propiedades)
- **Ruta:** `/admin/properties`
- **Archivo:** `app/admin/properties/page.tsx`
- **Método:** `handleSaveProperty()`
- **Endpoint usado:** `POST /api/host/properties` (a través de `propertyService.createProperty()`)

## ✅ Implementación Actual

### Servicio de Creación (`lib/api/properties.ts`)

```typescript
async createProperty(propertyData: CreatePropertyRequest): Promise<{ success: boolean; data?: Property; message?: string }> {
  // Validación de campos requeridos
  // Preparación de datos
  // Endpoint: POST /api/host/properties
  // Logging extensivo
}
```

**Endpoint configurado:**
- Variable de entorno: `NEXT_PUBLIC_PROPERTIES_CREATE_ENDPOINT`
- Valor por defecto: `/api/host/properties`
- Método: `POST`
- Auth: Requerida (JWT token en header)

### Datos Enviados

```typescript
interface CreatePropertyRequest {
  title: string;              // ✅ Requerido
  location: string;           // ✅ Requerido
  city: string;               // ✅ Requerido
  pricePerNight: number;      // ✅ Requerido
  propertyType: 'entire' | 'private' | 'shared'; // ✅ Requerido
  amenities: string[];        // ✅ Array (puede estar vacío)
  instantBook: boolean;       // ✅ Requerido
  maxGuests: number;          // ✅ Requerido
  description: string;        // ✅ Requerido
  imageUrl?: string;          // ✅ Opcional (se asigna default si falta)
}
```

## 🔍 Verificaciones Realizadas

### ✅ 1. Endpoint Correcto
- [x] Admin usa `POST /api/host/properties`
- [x] Usuario normal usa `POST /api/host/properties`
- [x] Endpoint configurable vía variable de entorno

### ✅ 2. Datos Completos
- [x] Todos los campos requeridos se envían
- [x] Validación en frontend antes de enviar
- [x] `amenities` siempre es un array (incluso si está vacío)
- [x] `pricePerNight` y `maxGuests` se convierten a números
- [x] `imageUrl` tiene valor por defecto si falta

### ✅ 3. Manejo de Errores
- [x] Validación de campos requeridos antes de enviar
- [x] Mensajes de error específicos por tipo de error
- [x] Logs extensivos para debugging
- [x] Toast notifications para feedback al usuario

### ✅ 4. Actualización de UI
- [x] Recarga de propiedades después de crear
- [x] Cierre del diálogo al completar
- [x] Limpieza del formulario después de crear
- [x] Mensajes de éxito/error

## 🧪 Cómo Verificar Manualmente

### Test 1: Usuario Normal Crea Propiedad

1. **Login como usuario normal:**
   - Email: cualquier usuario con `role: 'user'`
   - Password: (la del usuario)

2. **Navegar a "Mis Propiedades":**
   - Click en menú del perfil → "Mis Propiedades"
   - O ir directamente a `/my-properties`

3. **Crear propiedad:**
   - Click en botón "Crear Propiedad"
   - Llenar formulario:
     - Título: "Apartamento en el centro"
     - Ubicación: "Calle Principal 123"
     - Ciudad: "Barcelona"
     - Precio por noche: 50
     - Tipo: "Apartamento completo"
     - Huéspedes: 2
     - Descripción: "Hermoso apartamento..."
     - Seleccionar amenidades (WiFi, Aire acondicionado, etc.)
   - Click en "Crear"

4. **Verificar:**
   - ✅ Toast de éxito: "Propiedad creada exitosamente"
   - ✅ La propiedad aparece en la lista
   - ✅ Verificar en MongoDB Atlas que la propiedad se guardó
   - ✅ La propiedad tiene el `userId` del usuario que la creó

### Test 2: Usuario Admin Crea Propiedad

1. **Login como admin:**
   - Email: `admin@airbnb.com` o cualquier usuario con `role: 'admin'`
   - Password: (la del admin)

2. **Navegar a "Gestión de Propiedades":**
   - Click en menú del perfil → "Administración" → "Gestión" → "Gestión de Propiedades"
   - O ir directamente a `/admin/properties`

3. **Crear propiedad:**
   - Click en botón "Crear Propiedad"
   - Llenar formulario completo
   - Click en "Crear"

4. **Verificar:**
   - ✅ Toast de éxito: "Propiedad creada exitosamente"
   - ✅ La propiedad aparece en la lista (todas las propiedades)
   - ✅ Verificar en MongoDB Atlas que la propiedad se guardó
   - ✅ La propiedad tiene el `userId` del admin que la creó

## 📊 Logs a Revisar en Consola

### Al crear una propiedad, deberías ver:

```
🔍 [MyProperties/AdminProperties] Creando nueva propiedad
📝 [MyProperties/AdminProperties] Datos a enviar: {...}
🔍 [propertyService] Creando propiedad con datos: {...}
📤 [propertyService] Enviando datos al backend: {...}
🌐 [propertyService] URL base configurada: http://localhost:5000
🔄 [propertyService] Usando endpoint: /api/host/properties
⏱️ [propertyService] Tiempo de respuesta: XXXms
📥 [propertyService] Respuesta del backend: {...}
✅ [propertyService] Propiedad creada exitosamente
```

### Si hay error:

```
❌ [propertyService] Error creando propiedad: {...}
💥 [propertyService] Error: {...}
```

## 🔧 Verificación en Backend

### Endpoint Esperado
```
POST /api/host/properties
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "title": "...",
  "location": "...",
  "city": "...",
  "pricePerNight": 50,
  "propertyType": "entire",
  "amenities": ["wifi", "airConditioning"],
  "instantBook": true,
  "maxGuests": 2,
  "description": "...",
  "imageUrl": "..."
}
```

### Verificación en MongoDB Atlas

1. **Conectarse a MongoDB Atlas**
2. **Buscar la colección de propiedades**
3. **Verificar que la nueva propiedad tenga:**
   - ✅ Todos los campos enviados
   - ✅ Campo `userId` con el ID del usuario que la creó
   - ✅ Campo `createdAt` con la fecha de creación
   - ✅ Campo `updatedAt` con la fecha de actualización

## ⚠️ Problemas Comunes

### 1. Error 401 (Unauthorized)
- **Causa:** Token JWT inválido o expirado
- **Solución:** Hacer logout y login nuevamente

### 2. Error 404 (Not Found)
- **Causa:** Endpoint incorrecto
- **Solución:** Verificar que el backend tenga `POST /api/host/properties`
- **Alternativa:** Configurar `NEXT_PUBLIC_PROPERTIES_CREATE_ENDPOINT` en `.env.local`

### 3. Error 400 (Bad Request)
- **Causa:** Faltan campos requeridos o formato incorrecto
- **Solución:** Verificar que todos los campos requeridos estén presentes y con el formato correcto

### 4. Propiedad no aparece en MongoDB
- **Causa:** Error en el backend al guardar
- **Solución:** Revisar logs del backend
- **Verificación:** El backend debe guardar en la colección correcta

## 📝 Checklist de Verificación

### Frontend
- [x] Endpoint correcto configurado (`/api/host/properties`)
- [x] Validación de campos antes de enviar
- [x] Manejo de errores implementado
- [x] Logs extensivos para debugging
- [x] Actualización de UI después de crear
- [x] Mensajes de éxito/error al usuario

### Backend (Verificar)
- [ ] Endpoint `POST /api/host/properties` existe
- [ ] Endpoint requiere autenticación (JWT)
- [ ] Endpoint guarda en MongoDB Atlas
- [ ] Endpoint asigna `userId` automáticamente del token
- [ ] Endpoint devuelve la propiedad creada con `success: true`

### MongoDB Atlas (Verificar)
- [ ] La colección de propiedades existe
- [ ] Las propiedades se guardan con todos los campos
- [ ] El campo `userId` se guarda correctamente
- [ ] Los campos `createdAt` y `updatedAt` se generan automáticamente

## 🎯 Resultado Esperado

✅ **Ambos usuarios (admin y normal) pueden crear propiedades**  
✅ **Las propiedades se guardan correctamente en MongoDB Atlas**  
✅ **Cada propiedad tiene el `userId` del usuario que la creó**  
✅ **Las propiedades aparecen en la lista después de crearlas**  
✅ **Los errores se muestran claramente al usuario**

## 📋 Próximos Pasos

1. **Ejecutar las pruebas manuales** descritas arriba
2. **Verificar en MongoDB Atlas** que las propiedades se guarden
3. **Revisar los logs** en consola para identificar problemas
4. **Ajustar el backend** si es necesario para asegurar que guarde correctamente

