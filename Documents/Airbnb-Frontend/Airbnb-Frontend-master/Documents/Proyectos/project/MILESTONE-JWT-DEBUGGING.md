# Milestone: Debugging de Problema JWT - Acceso a Perfil

## Problema Reportado
El usuario puede crear cuentas y hacer login sin problema, pero no puede acceder al apartado de perfil del usuario. Se sospecha que el problema está en el JWT que no se está creando o entregando correctamente.

## Análisis del Problema

### Posibles Causas Identificadas:

1. **Backend no genera JWT**: El endpoint de login no está devolviendo el token
2. **Frontend no recibe JWT**: El token se genera pero no llega al frontend
3. **Frontend no guarda JWT**: El token llega pero no se almacena correctamente
4. **Frontend no envía JWT**: El token se guarda pero no se envía en las peticiones
5. **Backend no valida JWT**: El token se envía pero el backend no lo valida correctamente

### Endpoints Críticos para Verificar:

- `POST /api/auth/login` - Debe devolver JWT
- `GET /api/auth/me` - Debe validar JWT y devolver perfil
- `POST /api/auth/register` - Debe devolver JWT

## Herramientas de Debugging Creadas

### 1. JWTDebugger Component
**Archivo**: `components/auth/JWTDebugger.tsx`

**Funcionalidades**:
- Muestra el estado completo del AuthContext
- Verifica el token en localStorage
- Verifica el token en cookies
- Permite hacer login de prueba
- Permite limpiar todos los datos de autenticación

**Ubicación**: Fixed bottom-right en la página principal

### 2. ProfileEndpointTester Component
**Archivo**: `components/auth/ProfileEndpointTester.tsx`

**Funcionalidades**:
- Testea específicamente el endpoint `/api/auth/me`
- Verifica si el token se está enviando correctamente
- Testea el flujo completo: Login + Profile
- Muestra respuestas raw del backend

**Ubicación**: Fixed bottom-left en la página principal

### 3. BackendResponseTester (Existente)
**Archivo**: `components/auth/BackendResponseTester.tsx`

**Funcionalidades**:
- Testea la respuesta del endpoint de login
- Verifica si el backend está devolviendo JWT
- Análisis detallado de la respuesta

## Pasos para Debugging

### Paso 1: Verificar Backend Response
1. Usar `BackendResponseTester` para verificar que el backend devuelve JWT
2. Verificar que `response.success = true`
3. Verificar que `response.token` existe y no es null/undefined
4. Verificar que `response.user` existe

### Paso 2: Verificar Frontend Storage
1. Usar `JWTDebugger` para verificar el estado del AuthContext
2. Verificar que el token se guarda en localStorage
3. Verificar que el token se guarda en cookies
4. Verificar que `isAuthenticated = true`

### Paso 3: Verificar Profile Endpoint
1. Usar `ProfileEndpointTester` para verificar `/api/auth/me`
2. Verificar que el token se envía en el header Authorization
3. Verificar que el backend valida el token correctamente
4. Verificar que devuelve el perfil del usuario

### Paso 4: Verificar Middleware
1. Verificar que el middleware lee el token de las cookies
2. Verificar que redirige correctamente a rutas protegidas
3. Verificar que permite acceso cuando hay token válido

## Configuración de URLs

### Backend URL
- **Configuración**: `lib/api/config.ts`
- **Variable**: `NEXT_PUBLIC_API_URL`
- **Default**: `http://localhost:5000`
- **Archivo env**: `.env.local` (crear si no existe)

### Endpoints Críticos
- `POST http://localhost:5000/api/auth/login`
- `GET http://localhost:5000/api/auth/me`
- `POST http://localhost:5000/api/auth/register`

## Sincronización de Tokens

### Sistemas de Almacenamiento
1. **localStorage**: Para el AuthContext
2. **Cookies**: Para el middleware
3. **apiClient**: Para las peticiones HTTP

### Sincronización Implementada
- `tokenStorage.set()` actualiza los 3 sistemas
- `tokenStorage.remove()` limpia los 3 sistemas
- `apiClient` se sincroniza automáticamente

## Próximos Pasos

1. **Ejecutar las herramientas de debugging**
2. **Identificar exactamente dónde falla el flujo**
3. **Corregir el problema específico encontrado**
4. **Verificar que el acceso al perfil funciona**
5. **Remover las herramientas de debugging**

## Archivos Modificados

- `app/page.tsx` - Agregados componentes de debugging
- `components/auth/JWTDebugger.tsx` - Nuevo componente
- `components/auth/ProfileEndpointTester.tsx` - Nuevo componente
- `MILESTONE-JWT-DEBUGGING.md` - Este archivo

## Testing

Para usar las herramientas de debugging:

1. Abrir la página principal
2. Usar los componentes en las esquinas inferiores
3. Ejecutar los tests en orden
4. Revisar los logs en la consola del navegador
5. Identificar el punto exacto del fallo
