# Guía de Prueba Manual: Menú "Gestión de Propiedades"

## Objetivo
Verificar que un usuario admin puede acceder al menú "Gestión de Propiedades" desde el menú desplegable del perfil.

## Pasos a Seguir

### 1. Preparación
- ✅ Asegúrate de que el servidor de desarrollo esté corriendo: `npm run dev`
- ✅ Asegúrate de que el backend esté corriendo en `http://localhost:5000`
- ✅ Abre el navegador en `http://localhost:3000`

### 2. Login como Admin
1. Ve a la página de login: `http://localhost:3000/login`
2. Ingresa las credenciales:
   - **Email:** `admin@airbnb.com`
   - **Contraseña:** `456789Aa`
3. Haz clic en "Iniciar sesión"
4. Espera a ser redirigido a la página principal

### 3. Verificar el Menú del Perfil
1. En la parte superior derecha de la pantalla, busca el **botón del menú del perfil**
   - Debería tener un icono de menú (☰) y un avatar/imagen de perfil o iniciales
   - Está ubicado en el header, lado derecho

2. **Haz clic** en el botón del menú del perfil

### 4. Verificar que Aparece "Administración"
Una vez abierto el menú desplegable, deberías ver:

- ✅ **Mi Perfil**
- ✅ **Mis Reservas**
- ✅ **Favoritos**
- ✅ **Administración** (esta sección debe aparecer)

### 5. Verificar el Submenú "Gestión"
Dentro de la sección "Administración", deberías ver:

- ✅ **Panel de Admin**
- ✅ **Gestionar Usuarios**
- ✅ **Gestión** (submenú con flecha/triángulo indicando que tiene submenú)

### 6. Acceder a "Gestión de Propiedades"
1. **Pasa el mouse sobre "Gestión"** (o haz clic según el comportamiento del menú)
2. Debería aparecer un submenú con:
   - ✅ **Gestión de Propiedades**
3. **Haz clic en "Gestión de Propiedades"**

### 7. Verificar la Página de Administración de Propiedades
Después de hacer clic, deberías:

1. ✅ Ser redirigido a: `http://localhost:3000/admin/properties`
2. ✅ Ver el título: **"Gestión de Propiedades"**
3. ✅ Ver un botón: **"Crear Propiedad"**
4. ✅ Ver una barra de búsqueda
5. ✅ Ver una tabla o lista con todas las propiedades (si hay propiedades en la BD)

### 8. Verificar la Consola del Navegador
Abre la consola del navegador (F12 → Console) y verifica:

1. ✅ Debería aparecer: `🔍 [UserMenu] Navegando a /admin/properties`
2. ✅ Debería aparecer: `🔍 [AdminProperties] Verificando rol de admin...`
3. ✅ Debería aparecer: `✅ [AdminProperties] Usuario es admin según email (admin@airbnb.com)`
4. ✅ Debería aparecer: `🔍 [AdminProperties] Endpoint: GET /api/host/properties`
5. ✅ Debería aparecer una petición GET a `/api/host/properties` en la pestaña Network

### 9. Verificar la Petición al Backend
En la pestaña Network (F12 → Network):

1. ✅ Busca una petición `GET /api/host/properties`
2. ✅ Verifica que tenga estado `200 OK`
3. ✅ Verifica que devuelva un array de propiedades

## Problemas Comunes y Soluciones

### Problema 1: No aparece "Administración" en el menú
**Solución:**
1. Abre la consola (F12) y busca logs que empiecen con `🔍 [UserMenu]`
2. Verifica que aparezca: `✅ [UserMenu] Usuario es admin según email`
3. Si no aparece, verifica que el email en localStorage sea `admin@airbnb.com`

### Problema 2: Al hacer clic en "Gestión de Propiedades" no navega
**Solución:**
1. Verifica en la consola si aparece: `🔍 [UserMenu] Navegando a /admin/properties`
2. Si no aparece, el click no se está ejecutando correctamente
3. Intenta hacer clic directamente con el botón derecho → "Inspeccionar" para ver el elemento

### Problema 3: Se muestra "Verificando permisos de administrador..." indefinidamente
**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica en la consola si hay errores en la petición a `/api/users/me`
3. Revisa la pestaña Network para ver si hay peticiones fallidas

### Problema 4: Redirige a la página principal en lugar de /admin/properties
**Solución:**
1. Verifica en la consola los logs de `[AdminProperties]`
2. Debería aparecer: `✅ [AdminProperties] Usuario es admin... PERMITIENDO ACCESO`
3. Si aparece `❌ [AdminProperties] Usuario NO es admin`, el problema está en la verificación del rol

## Código Verificado

El siguiente código está implementado y debería funcionar:

### 1. UserMenu.tsx
- ✅ Verifica rol de admin por email `admin@airbnb.com`
- ✅ Muestra submenú "Gestión" para admins
- ✅ Navega a `/admin/properties` con `router.push()`

### 2. app/admin/properties/page.tsx
- ✅ Verifica rol de admin antes de mostrar la página
- ✅ Usa `propertyService.getMyProperties()` que llama a `GET /api/host/properties`
- ✅ Muestra todas las propiedades en una tabla
- ✅ Permite crear, editar y eliminar propiedades

### 3. lib/api/properties.ts
- ✅ `getMyProperties()` usa el endpoint `/api/host/properties`
- ✅ Maneja diferentes formatos de respuesta del backend

## Estado Actual

✅ **Completado:**
- Verificación de rol de admin por email
- Menú "Gestión" en el menú desplegable
- Submenú "Gestión de Propiedades"
- Navegación a `/admin/properties`
- Página de administración de propiedades
- Carga de propiedades desde `/api/host/properties`

⚠️ **Pendiente de verificación manual:**
- Que el menú se abra correctamente al hacer clic
- Que la navegación funcione correctamente
- Que la página cargue todas las propiedades

## Próximos Pasos

1. Ejecutar la prueba manual siguiendo esta guía
2. Documentar cualquier error encontrado
3. Revisar los logs de la consola si hay problemas
4. Verificar las peticiones en la pestaña Network

