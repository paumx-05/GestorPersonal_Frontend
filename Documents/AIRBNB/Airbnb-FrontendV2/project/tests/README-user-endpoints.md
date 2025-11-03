# 🧪 Pruebas Individuales de Endpoints de Usuarios

Este directorio contiene las pruebas individuales para cada endpoint de la colección de usuarios, siguiendo la regla @playwright-test.

## 📋 Endpoints Probados

### **Autenticación**
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `GET /api/auth/me` - Obtener perfil del usuario
- `POST /api/auth/refresh` - Renovar token JWT

### **Recuperación de Contraseña**
- `POST /api/auth/forgot-password` - Solicitar recuperación
- `POST /api/auth/reset-password` - Restablecer contraseña

## 🚀 Cómo Ejecutar las Pruebas

### **Prerequisitos**
1. **Backend corriendo** en puerto 5000
2. **Frontend corriendo** en puerto 3000
3. **Playwright instalado** (`npm install @playwright/test`)

### **Ejecutar Todas las Pruebas**
```bash
npx playwright test tests/user-endpoints-individual.spec.ts
```

### **Ejecutar Pruebas Específicas**
```bash
# Solo pruebas de registro
npx playwright test tests/user-endpoints-individual.spec.ts --grep "User Registration"

# Solo pruebas de login
npx playwright test tests/user-endpoints-individual.spec.ts --grep "User Login"

# Solo pruebas de perfil
npx playwright test tests/user-endpoints-individual.spec.ts --grep "User Profile"

# Solo pruebas de logout
npx playwright test tests/user-endpoints-individual.spec.ts --grep "User Logout"

# Solo pruebas de recuperación de contraseña
npx playwright test tests/user-endpoints-individual.spec.ts --grep "Password Reset"

# Solo pruebas de persistencia de sesión
npx playwright test tests/user-endpoints-individual.spec.ts --grep "Session Persistence"

# Solo pruebas de manejo de errores
npx playwright test tests/user-endpoints-individual.spec.ts --grep "Error Handling"

# Solo pruebas cross-browser
npx playwright test tests/user-endpoints-individual.spec.ts --grep "Cross-Browser"

# Solo pruebas móviles
npx playwright test tests/user-endpoints-individual.spec.ts --grep "Mobile"
```

### **Usar el Script de Ejecución**
```bash
# Hacer ejecutable (Linux/Mac)
chmod +x scripts/run-user-endpoint-tests.sh

# Ejecutar pruebas específicas
./scripts/run-user-endpoint-tests.sh login
./scripts/run-user-endpoint-tests.sh registration
./scripts/run-user-endpoint-tests.sh all
```

## 🔧 Configuración de Pruebas

### **Archivos de Configuración**
- `playwright.user-endpoints.config.ts` - Configuración específica para pruebas de endpoints
- `env.test` - Variables de entorno para pruebas
- `playwright-flow-user-endpoints-individual.md` - Reporte de pruebas

### **Credenciales de Prueba**
```bash
# Usuario administrador
Email: admin@airbnb.com
Password: Admin1234!

# Usuario regular
Email: ana1@gmail.com
Password: 123456789

# Usuario de prueba
Email: testuser@example.com
Password: TestPass123
```

## 📊 Tipos de Pruebas

### **1. Pruebas Positivas**
- ✅ Registro exitoso de nuevo usuario
- ✅ Login con credenciales válidas
- ✅ Acceso a perfil autenticado
- ✅ Logout exitoso
- ✅ Solicitud de recuperación de contraseña
- ✅ Persistencia de sesión

### **2. Pruebas Negativas**
- ❌ Registro con email duplicado
- ❌ Login con credenciales inválidas
- ❌ Acceso a perfil sin autenticación
- ❌ Reset de contraseña con token inválido
- ❌ Manejo de errores de red

### **3. Pruebas de Validación**
- 🔍 Validación de contraseñas (mínimo 6 caracteres)
- 🔍 Validación de formato de email
- 🔍 Validación de campos requeridos
- 🔍 Validación de confirmación de contraseña

### **4. Pruebas de Seguridad**
- 🔒 Mensajes de error seguros (no revelan información)
- 🔒 Tokens JWT manejados correctamente
- 🔒 Redirección automática en caso de no autenticación
- 🔒 Limpieza de tokens al hacer logout

### **5. Pruebas de Compatibilidad**
- 🌐 Chrome, Firefox, Safari
- 📱 Dispositivos móviles (iPhone, Android)
- 📱 Responsive design
- 🌐 Cross-browser functionality

## 📈 Métricas de Pruebas

### **Cobertura de Endpoints**
- **Registro:** 3 casos de prueba
- **Login:** 3 casos de prueba
- **Perfil:** 2 casos de prueba
- **Logout:** 1 caso de prueba
- **Recuperación:** 2 casos de prueba
- **Reset:** 2 casos de prueba
- **Refresh:** 1 caso de prueba
- **Sesión:** 2 casos de prueba
- **Errores:** 2 casos de prueba
- **Cross-browser:** 1 caso de prueba
- **Móvil:** 1 caso de prueba

**Total:** 20 casos de prueba individuales

### **Tiempos de Respuesta Esperados**
- **Registro:** 300-500ms
- **Login:** 200-400ms
- **Perfil:** 150-300ms
- **Logout:** 100-200ms
- **Recuperación:** 400-600ms

## 🐛 Manejo de Errores

### **Errores de Red**
- Simulación de fallos de conexión
- Timeouts de red
- Servidor no disponible

### **Errores de Validación**
- Campos requeridos vacíos
- Formatos de email inválidos
- Contraseñas muy cortas
- Confirmación de contraseña no coincide

### **Errores de Autenticación**
- Credenciales incorrectas
- Tokens expirados
- Usuario no encontrado
- Email ya registrado

## 📋 Reportes Generados

### **Reportes HTML**
- `playwright-report-user-endpoints/index.html` - Reporte visual detallado
- Screenshots de fallos
- Videos de ejecución
- Trazas de red

### **Reportes JSON/XML**
- `test-results-user-endpoints.json` - Resultados en formato JSON
- `test-results-user-endpoints.xml` - Resultados en formato JUnit

### **Logs de Consola**
- Errores de API
- Warnings de validación
- Información de debugging

## 🔍 Debugging

### **Ejecutar en Modo Debug**
```bash
npx playwright test tests/user-endpoints-individual.spec.ts --debug
```

### **Ejecutar con UI de Playwright**
```bash
npx playwright test tests/user-endpoints-individual.spec.ts --ui
```

### **Ejecutar en Modo Headed**
```bash
npx playwright test tests/user-endpoints-individual.spec.ts --headed
```

## 📚 Documentación Adicional

- [Playwright Documentation](https://playwright.dev/)
- [API Documentation Backend](https://documenter.getpostman.com/view/48917645/2sB3Wjz3yS)
- [Reporte de Pruebas](./playwright-flow-user-endpoints-individual.md)
- [Configuración de Pruebas](./playwright.user-endpoints.config.ts)

## 🎯 Criterios de Éxito

- ✅ Todos los endpoints funcionan correctamente
- ✅ Manejo apropiado de errores
- ✅ Persistencia de sesión entre navegaciones
- ✅ Compatibilidad cross-browser
- ✅ Responsive design en móviles
- ✅ Tiempos de respuesta aceptables
- ✅ Sin errores en consola
- ✅ Experiencia de usuario fluida

---

*Documentación generada para pruebas de endpoints de usuarios*  
*Basado en la regla @playwright-test*  
*Última actualización: 2025-01-27*
