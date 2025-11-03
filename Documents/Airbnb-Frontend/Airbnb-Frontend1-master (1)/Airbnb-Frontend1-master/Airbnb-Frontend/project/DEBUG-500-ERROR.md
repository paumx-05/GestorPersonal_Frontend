# 🔍 Guía de Debugging para Error 500 en Reviews

## 📋 Información Necesaria

Para diagnosticar el error 500 al crear reviews, necesito que revises la **consola del navegador** y busques estos logs específicos:

### 1. Logs ANTES de enviar la request

Busca estos logs que muestran QUÉ se está enviando:

```
📤 [reviewService] ========================================
📤 [reviewService] ENVIANDO REQUEST:
📤 [reviewService] Endpoint: POST /api/reviews
📤 [reviewService] Body: { ... }
📤 [reviewService] Body keys: propertyId, rating
📤 [reviewService] Body propertyId type: string
📤 [reviewService] Body rating type: number
📤 [reviewService] Body comment type: undefined
📤 [reviewService] ========================================
```

**Copia el contenido completo de estos logs**, especialmente:
- El `Body:` completo en JSON
- Los tipos de datos

### 2. Logs del ApiClient cuando detecta el error 500

Busca estos logs:

```
💥 [ApiClient] Error 500 - Detalles completos: { ... }
❌ [ApiClient] Error response (status: 500): { ... }
```

**Copia el contenido completo de estos logs**, especialmente:
- Los `Detalles completos` del error
- El `Error response`

### 3. Logs del reviewService con el diagnóstico

Busca estos logs:

```
💥 [reviewService] ========================================
💥 [reviewService] ERROR 500 - DIAGNÓSTICO COMPLETO
💥 [reviewService] ========================================
💥 [reviewService] Mensaje completo del error: ...
💥 [reviewService] Body enviado: { ... }
💥 [reviewService] Mensaje del backend: ...
💥 [reviewService] Detalles del backend: ...
```

**Copia TODOS estos logs completos**.

## 🔍 Qué Buscar Específicamente

1. **El Body Exacto:**
   - ¿Tiene `propertyId`?
   - ¿Tiene `rating`?
   - ¿Tiene `comment`? (No debería si está vacío)

2. **El Mensaje del Backend:**
   - Busca "Mensaje del backend:" en los logs
   - Esto te dirá qué espera el backend o qué está fallando

3. **Los Detalles del Backend:**
   - Busca "Detalles:" en los logs
   - Esto puede contener el stack trace o error específico del backend

## 📝 Pasos para Compartir la Información

1. Abre la consola del navegador (F12)
2. Filtra por `[reviewService]` o `[ApiClient]`
3. Intenta crear una review
4. Copia TODOS los logs que aparezcan relacionados con el error
5. Pégalos aquí

## 🎯 Información Alternativa Útil

Si no encuentras los logs anteriores, también ayuda saber:

1. **¿Qué rating estás enviando?** (1-5)
2. **¿Estás enviando un comentario?** (Sí/No y cuántos caracteres)
3. **¿El propertyId parece correcto?** (Copia el ID de la propiedad)
4. **¿El usuario está autenticado?** (¿Puedes ver otras páginas que requieren login?)

---

**Nota:** El error 500 es del servidor, lo que significa que la request llega al backend pero algo falla al procesarla. Los logs del backend también serían útiles si tienes acceso a ellos.

