# MILESTONE - Sistema de Resend Email para Recuperación de Contraseña

## Objetivo del Producto
Implementar funcionalidad de reenvío de emails para el sistema de recuperación de contraseña, permitiendo a los usuarios solicitar múltiples intentos de recuperación de forma segura y controlada.

## Criterios de Aceptación
- Los usuarios pueden solicitar reenvío de email de recuperación
- Implementar rate limiting para prevenir spam
- Mostrar mensajes claros de confirmación y límites
- Mantener seguridad y evitar abuso del sistema
- Interfaz simple y comprensible para cualquier usuario

---

## Tareas de Implementación

### 1. **Crear Endpoint de Resend Email en Backend**
**Objetivo:** Implementar API para reenvío de emails de recuperación

**Implementación:**
```javascript
// POST /api/auth/resend-recovery-email
// Body: { email: "user@example.com" }
// Response: { success: true, message: "Email enviado" }
```

**Criterios:**
- Validar que el email existe en la base de datos
- Implementar rate limiting (máximo 3 intentos por hora)
- Generar nuevo token de recuperación
- Enviar email con nuevo enlace
- Registrar intentos en base de datos

**Comentarios para el desarrollador:**
```javascript
// Función principal para resend email
async function resendRecoveryEmail(email) {
  // 1. Verificar rate limiting
  // 2. Validar email existe
  // 3. Generar nuevo token
  // 4. Enviar email
  // 5. Registrar intento
}
```

---

### 2. **Implementar Rate Limiting y Validaciones**
**Objetivo:** Prevenir abuso del sistema de resend

**Implementación:**
```javascript
// Middleware de rate limiting
const rateLimit = {
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hora
  message: "Demasiados intentos. Intenta en 1 hora."
}
```

**Criterios:**
- Máximo 3 intentos por email por hora
- Bloquear temporalmente emails que excedan límite
- Mostrar tiempo restante hasta próximo intento
- Registrar todos los intentos para auditoría

**Comentarios para el desarrollador:**
```javascript
// Verificar límites antes de enviar
function checkRateLimit(email) {
  // 1. Consultar intentos recientes
  // 2. Calcular tiempo restante
  // 3. Retornar si puede enviar
}
```

---

### 3. **Crear Interfaz de Usuario para Resend**
**Objetivo:** Permitir a usuarios solicitar reenvío desde la interfaz

**Implementación:**
```jsx
// Componente ResendEmailButton
function ResendEmailButton({ email, onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  // Lógica de resend con rate limiting visual
}
```

**Criterios:**
- Botón "Reenviar Email" en página de forgot-password
- Mostrar estado de carga durante envío
- Deshabilitar botón durante rate limiting
- Mostrar contador de tiempo restante
- Mensajes de éxito y error claros

**Comentarios para el desarrollador:**
```jsx
// Manejar estados del botón
const handleResend = async () => {
  setIsLoading(true);
  try {
    // Llamar API de resend
    await resendRecoveryEmail(email);
    onSuccess("Email reenviado correctamente");
  } catch (error) {
    onError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

### 4. **Integrar con Sistema de Emails Existente**
**Objetivo:** Reutilizar infraestructura de emails actual

**Implementación:**
```javascript
// Servicio de email unificado
class EmailService {
  async sendRecoveryEmail(email, token) {
    // 1. Generar template de email
    // 2. Configurar destinatario
    // 3. Enviar via servicio de email
    // 4. Registrar envío en logs
  }
}
```

**Criterios:**
- Reutilizar templates de email existentes
- Mantener consistencia en diseño de emails
- Registrar todos los envíos para auditoría
- Manejar errores de envío gracefully
- Soporte para múltiples proveedores de email

**Comentarios para el desarrollador:**
```javascript
// Template de email de recuperación
const recoveryEmailTemplate = {
  subject: "Recupera tu contraseña - Airbnb Clone",
  html: `
    <h1>Recupera tu contraseña</h1>
    <p>Haz clic en el enlace para restablecer tu contraseña:</p>
    <a href="${resetLink}">Restablecer Contraseña</a>
  `
};
```

---

### 5. **Implementar Seguridad y Auditoría**
**Objetivo:** Asegurar el sistema contra abuso y mantener trazabilidad

**Implementación:**
```javascript
// Sistema de auditoría
const auditLog = {
  logResendAttempt: (email, ip, userAgent) => {
    // Registrar intento con timestamp
    // Incluir información de seguridad
    // Alertar sobre patrones sospechosos
  }
}
```

**Criterios:**
- Registrar todos los intentos de resend
- Incluir IP y User-Agent en logs
- Alertar sobre patrones de abuso
- Invalidar tokens anteriores al generar nuevos
- Implementar CAPTCHA para casos sospechosos

**Comentarios para el desarrollador:**
```javascript
// Función de seguridad
function validateResendRequest(email, ip) {
  // 1. Verificar rate limiting
  // 2. Analizar patrones de IP
  // 3. Validar formato de email
  // 4. Retornar si es seguro proceder
}
```

---

## Criterios de Éxito

### Funcionalidad
- ✅ Usuarios pueden solicitar reenvío de email
- ✅ Rate limiting previene abuso
- ✅ Emails se envían correctamente
- ✅ Interfaz es intuitiva y clara

### Seguridad
- ✅ Máximo 3 intentos por hora por email
- ✅ Tokens anteriores se invalidan
- ✅ Logs de auditoría completos
- ✅ Protección contra ataques de fuerza bruta

### Experiencia de Usuario
- ✅ Mensajes claros de confirmación
- ✅ Indicadores de tiempo restante
- ✅ Estados de carga apropiados
- ✅ Manejo de errores user-friendly

---

## Notas de Implementación

### Consideraciones Técnicas
- Usar Redis para rate limiting distribuido
- Implementar queue para envío de emails
- Configurar timeouts apropiados
- Manejar fallos de servicios de email

### Consideraciones de UX
- Mantener consistencia con diseño actual
- Usar iconos y colores apropiados
- Proporcionar feedback inmediato
- Incluir instrucciones claras

### Consideraciones de Seguridad
- Validar todos los inputs
- Implementar CSRF protection
- Usar HTTPS para todos los enlaces
- Monitorear patrones de abuso

---

**Responsable:** Equipo de Desarrollo  
**Fecha de Inicio:** [Fecha]  
**Fecha de Entrega:** [Fecha + 1 semana]  
**Prioridad:** Alta  
**Complejidad:** Media
