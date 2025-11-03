# Fix: Error CORS en Avatar (ERR_BLOCKED_BY_RESPONSE.NotSameOrigin)

## 🔴 Problema Identificado

**Error:** `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin 200 (OK)`

**Causa:** El navegador bloquea la carga de imágenes desde `http://localhost:5000` porque el backend no tiene los headers CORS correctos configurados.

**Síntoma:**
- La imagen se descarga correctamente (200 OK)
- Pero el navegador la bloquea por políticas de CORS
- El avatar no se muestra en la UI

---

## ✅ Solución Implementada

### 1. Proxy API Route en Next.js

**Archivo:** `app/api/proxy/avatar/route.ts`

Creado un endpoint proxy que:
- Recibe la ruta del avatar como parámetro `path`
- Hace fetch al backend
- Devuelve la imagen con headers CORS apropiados
- Evita problemas de CORS completamente

**Uso:**
```
/api/proxy/avatar?path=/uploads/avatars/avatar.jpg
```

**Ventajas:**
- ✅ Las imágenes se cargan desde el mismo origen (`localhost:3000`)
- ✅ No hay problemas de CORS
- ✅ Funciona en desarrollo y producción

### 2. Conversión Automática de URLs

**Archivos:**
- `lib/api/profile.ts`
- `lib/api/auth.ts`

Todas las URLs de avatar se convierten automáticamente a usar el proxy:

**Antes:**
```typescript
avatar: "http://localhost:5000/uploads/avatars/avatar.jpg"
// ❌ Error CORS
```

**Después:**
```typescript
avatar: "/api/proxy/avatar?path=/uploads/avatars/avatar.jpg"
// ✅ Sin error CORS
```

### 3. Función Helper

**Archivo:** `lib/utils/avatar.ts`

Función helper `getAvatarUrl()` que:
- Detecta el tipo de URL (relativa, localhost, externa)
- Convierte automáticamente a proxy si es necesario
- Mantiene URLs externas (CDN) sin modificar

---

## 📊 Flujo Corregido

```
1. Backend devuelve: "/uploads/avatars/avatar.jpg"
   ↓
2. Frontend convierte a: "/api/proxy/avatar?path=/uploads/avatars/avatar.jpg"
   ↓
3. Navegador solicita: http://localhost:3000/api/proxy/avatar?path=...
   ↓
4. Next.js API Route hace fetch a: http://localhost:5000/uploads/avatars/avatar.jpg
   ↓
5. API Route devuelve imagen con headers CORS: ✅
   ↓
6. Avatar se muestra correctamente: ✅
```

---

## 🧪 Verificación

### Test 1: Verificar Proxy

1. Abre DevTools → Network
2. Actualiza el avatar
3. Busca la petición a `/api/proxy/avatar?path=...`
4. Verifica:
   - ✅ Status: 200 OK
   - ✅ Content-Type: image/jpeg (o similar)
   - ✅ Sin errores de CORS

### Test 2: Verificar URL Convertida

1. Abre DevTools → Console
2. Busca logs:
   ```
   🔍 [profileService] Avatar URL convertida: /uploads/avatars/... → /api/proxy/avatar?path=...
   ```
3. Verifica que la conversión sea correcta

### Test 3: Verificar Imagen

1. Reinicia la página
2. El avatar debería mostrarse correctamente
3. No debería haber errores en la consola

---

## 🔧 Configuración Requerida

### Backend

El backend NO necesita cambios. El proxy maneja todo.

### Frontend

La solución es completamente transparente. No requiere configuración adicional.

---

## 📝 Archivos Modificados

1. **`app/api/proxy/avatar/route.ts`** (NUEVO)
   - Proxy API route para servir avatares

2. **`lib/utils/avatar.ts`** (NUEVO)
   - Función helper para convertir URLs

3. **`lib/api/profile.ts`**
   - Conversión automática de URLs de avatar

4. **`lib/api/auth.ts`**
   - Conversión automática en `checkAuthStatus()` y `getProfile()`

5. **`app/profile/page.tsx`**
   - Mejora en el cache buster

---

## ✅ Resultado Esperado

**ANTES:**
- Avatar URL: `http://localhost:5000/uploads/...`
- Error: `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`
- Avatar no se muestra ❌

**DESPUÉS:**
- Avatar URL: `/api/proxy/avatar?path=/uploads/...`
- Sin errores de CORS ✅
- Avatar se muestra correctamente ✅

---

## 🚨 Notas Importantes

1. **URLs Externas**: Si el avatar es una URL externa (ej: `https://cdn.example.com/avatar.jpg`), se usa directamente sin proxy.

2. **Cache**: El proxy incluye headers de cache apropiados para optimizar el rendimiento.

3. **Seguridad**: El proxy valida que solo se puedan cargar imágenes, no otros tipos de archivos.

---

**Fecha:** 2024-01-15  
**Estado:** ✅ **FIX IMPLEMENTADO**  
**Prioridad:** 🔴 **ALTA**

