# MILESTONE: Herramientas de Debug para Problema de JWT

## Problema Identificado

El usuario reporta que **NO se envían JWT en los headers** de las peticiones HTTP, lo cual es crítico para el funcionamiento de la autenticación.

## Herramientas de Debug Implementadas

### 1. AuthDebugger Component
- ✅ Muestra el estado del AuthContext (isAuthenticated, user, isLoading)
- ✅ Muestra el contenido de localStorage (airbnb_auth_token, user)
- ✅ Muestra el token del apiClient
- ✅ Permite probar llamadas API manualmente
- ✅ Se actualiza automáticamente cada segundo

### 2. ApiClientTester Component
- ✅ Compara llamadas con apiClient vs fetch directo
- ✅ Muestra si el token está en localStorage
- ✅ Permite probar ambos métodos para identificar diferencias
- ✅ Muestra respuestas detalladas

### 3. Correcciones Implementadas
- ✅ Corregido `checkAuthStatus()` para usar apiClient en lugar de fetch directo
- ✅ Agregado logging detallado en todos los procesos
- ✅ Configuración automática de interceptores

## Cómo Usar las Herramientas

1. **Ir a `/test-token-refresh`** en el navegador
2. **Ver AuthDebugger** - muestra el estado actual de autenticación
3. **Hacer login** con credenciales válidas
4. **Verificar en AuthDebugger** que:
   - `isAuthenticated: ✅ SÍ`
   - `airbnb_auth_token: ✅ [token]...`
   - `user: ✅ [nombre]`
5. **Usar ApiClientTester** para probar:
   - "Probar ApiClient" - debe funcionar con token automático
   - "Probar Fetch Directo" - debe funcionar con token manual
6. **Verificar en Network tab** que las peticiones incluyan `Authorization: Bearer ...`

## Posibles Problemas a Identificar

### Si AuthDebugger muestra:
- ❌ `isAuthenticated: NO` → Problema en AuthContext
- ❌ `airbnb_auth_token: null` → Token no se guarda
- ❌ `user: null` → Usuario no se guarda

### Si ApiClientTester muestra:
- ❌ "Error" en ApiClient → Problema en configuración de apiClient
- ❌ "Error" en Fetch Directo → Problema en el backend
- ✅ Ambos funcionan → Problema en el uso de apiClient en la aplicación

## Próximos Pasos

1. **Probar login** y verificar AuthDebugger
2. **Usar ApiClientTester** para identificar dónde está el problema
3. **Revisar Network tab** para ver si se envían headers
4. **Corregir** el problema específico identificado

## Archivos Creados/Modificados

- ✅ `components/auth/AuthDebugger.tsx` - Debugger principal
- ✅ `components/auth/ApiClientTester.tsx` - Tester de API
- ✅ `app/test-token-refresh/page.tsx` - Página de test actualizada
- ✅ `lib/api/auth.ts` - Corregido checkAuthStatus()
