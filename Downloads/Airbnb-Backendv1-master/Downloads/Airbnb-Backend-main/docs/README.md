# 📚 Airbnb Backend API - Documentación Completa

## 🎯 **BIENVENIDO**

Esta carpeta contiene toda la documentación completa del backend de Airbnb, incluyendo colecciones de Postman, referencias de endpoints y ejemplos de uso.

---

## 📁 **ESTRUCTURA DE DOCUMENTOS**

### **🔧 Para Desarrolladores**

| Archivo | Descripción | Uso Recomendado |
|---------|-------------|-----------------|
| [`airbnb-api-postman-collection.json`](./airbnb-api-postman-collection.json) | **Colección completa de Postman** | Importar directamente a Postman para testing |
| [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) | **Documentación API completa** | Referencia detallada de todos los endpoints |
| [`ENDPOINTS_REFERENCE.md`](./ENDPOINTS_REFERENCE.md) | **Referencia rápida de endpoints** | Consulta rápida de rutas y métodos |
| [`API_EXAMPLES.md`](./API_EXAMPLES.md) | **Ejemplos de uso completos** | Ejemplos prácticos con curl y respuestas |

### **📖 Documentación de Milestones**

| Carpeta | Descripción |
|---------|-------------|
| [`backend/`](./backend/) | Documentación de milestones del backend |
| [`frontend/`](./frontend/) | Documentación de milestones del frontend |

---

## 🚀 **INICIO RÁPIDO**

### **1. Para Testing con Postman**
1. Abre Postman
2. Importa el archivo `airbnb-api-postman-collection.json`
3. Configura la variable `base_url` como `http://localhost:5000`
4. Ejecuta "Login" o "Registrar Usuario" para obtener token automáticamente
5. ¡Todos los endpoints estarán listos para usar!

### **2. Para Desarrollo**
1. Lee `API_DOCUMENTATION.md` para entender la estructura completa
2. Usa `ENDPOINTS_REFERENCE.md` para consultas rápidas
3. Consulta `API_EXAMPLES.md` para ejemplos prácticos

### **3. Para Integración Frontend**
1. Revisa los ejemplos de autenticación
2. Implementa los flujos de reserva y carrito
3. Usa la referencia de endpoints para implementar todas las funcionalidades

---

## 🌟 **CARACTERÍSTICAS PRINCIPALES**

### **✅ Funcionalidades Implementadas**

- **🔐 Autenticación Completa**: Registro, login, recuperación de contraseña
- **👥 Gestión de Usuarios**: CRUD completo con paginación
- **🛒 Sistema de Carrito**: Agregar, actualizar, eliminar items
- **❤️ Favoritos y Wishlists**: Sistema completo de favoritos
- **🏠 Gestión de Hosts**: CRUD de propiedades, reservas, estadísticas
- **🔔 Notificaciones**: Sistema completo con configuración
- **💳 Pagos**: Cálculo, procesamiento y historial
- **👤 Perfiles**: Actualización y configuración de usuarios
- **🏘️ Propiedades**: Consulta pública de propiedades
- **📅 Reservas**: Sistema completo de reservas
- **⭐ Reviews**: Creación, consulta y estadísticas
- **🔍 Búsqueda**: Búsqueda avanzada con filtros
- **📊 Estadísticas**: Métricas del sistema (admin)

### **🛡️ Seguridad y Validación**

- **JWT Authentication**: Tokens seguros para autenticación
- **Rate Limiting**: Protección contra spam y ataques
- **Input Validation**: Validación completa de datos de entrada
- **Error Handling**: Manejo consistente de errores
- **CORS**: Configurado para desarrollo frontend

---

## 📋 **ENDPOINTS POR CATEGORÍA**

### **🔐 Autenticación (7 endpoints)**
- Registro, login, logout
- Perfil de usuario
- Recuperación de contraseña
- Ruta de prueba

### **👥 Usuarios (6 endpoints)**
- CRUD completo
- Estadísticas
- Paginación y búsqueda

### **🛒 Carrito (9 endpoints)**
- Gestión completa del carrito
- Verificación de disponibilidad
- Estadísticas (admin)

### **❤️ Favoritos (13 endpoints)**
- Sistema de favoritos
- Wishlists públicas y privadas
- Estadísticas

### **🏠 Host (8 endpoints)**
- Gestión de propiedades
- Reservas y reviews
- Estadísticas del host

### **🔔 Notificaciones (8 endpoints)**
- CRUD de notificaciones
- Configuración de usuario
- Notificaciones de prueba

### **💳 Pagos (6 endpoints)**
- Cálculo y procesamiento
- Historial de transacciones
- Reembolsos

### **👤 Perfil (4 endpoints)**
- Actualización de perfil
- Cambio de contraseña
- Configuración

### **🏘️ Propiedades (2 endpoints)**
- Consulta pública
- Propiedades populares

### **📅 Reservas (4 endpoints)**
- Verificación de disponibilidad
- CRUD de reservas
- Actualización de estado

### **⭐ Reviews (7 endpoints)**
- CRUD de reviews
- Estadísticas por propiedad
- Reviews de usuarios

### **🔍 Búsqueda (3 endpoints)**
- Búsqueda avanzada
- Sugerencias
- Filtros disponibles

### **📊 Estadísticas (3 endpoints)**
- Métricas del sistema
- Logs (admin)
- Limpieza de logs

### **🔧 Utilidades (2 endpoints)**
- Información de la API
- Health check

**Total: 81 endpoints implementados**

---

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **Base URL**
```
http://localhost:5000
```

### **Headers Comunes**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

### **Formato de Respuesta**
```json
{
  "success": true|false,
  "data": {...},
  "message": "Descripción del resultado",
  "error": {...}
}
```

### **Códigos de Estado**
- `200`: Éxito
- `201`: Creado
- `400`: Error de validación
- `401`: No autenticado
- `403`: Sin permisos
- `404`: No encontrado
- `409`: Conflicto
- `429`: Rate limit
- `500`: Error interno

---

## 🚀 **FLUJOS PRINCIPALES**

### **1. Flujo de Autenticación**
```
Registro/Login → Obtener Token → Usar en Requests
```

### **2. Flujo de Reserva**
```
Buscar → Verificar Disponibilidad → Agregar al Carrito → 
Calcular Total → Procesar Pago → Crear Reserva
```

### **3. Flujo de Host**
```
Crear Propiedad → Recibir Reservas → Gestionar Reviews → 
Ver Estadísticas
```

### **4. Flujo de Favoritos**
```
Agregar a Favoritos → Crear Wishlist → Compartir Wishlist → 
Ver Estadísticas
```

---

## 📊 **ESTADÍSTICAS DE LA API**

| Métrica | Valor |
|---------|-------|
| **Total de Endpoints** | 81 |
| **Endpoints Públicos** | 8 |
| **Endpoints Autenticados** | 71 |
| **Endpoints Admin** | 3 |
| **Categorías** | 14 |
| **Métodos HTTP** | 6 (GET, POST, PUT, PATCH, DELETE) |

---

## 🎯 **PRÓXIMOS PASOS**

### **Para Desarrolladores**
1. **Importar colección de Postman** y comenzar testing
2. **Revisar documentación completa** para entender la arquitectura
3. **Implementar autenticación** en el frontend
4. **Integrar endpoints** según necesidades del proyecto

### **Para Testing**
1. **Configurar entorno** con variables de Postman
2. **Ejecutar flujos completos** usando los ejemplos
3. **Probar casos de error** con datos inválidos
4. **Verificar validaciones** de todos los endpoints

### **Para Integración**
1. **Implementar interceptors** para manejo de tokens
2. **Configurar manejo de errores** consistente
3. **Implementar loading states** para mejor UX
4. **Agregar retry logic** para requests fallidos

---

## 📞 **SOPORTE**

### **Documentación Adicional**
- Revisa los archivos de milestones en `backend/` y `frontend/`
- Consulta los ejemplos en `API_EXAMPLES.md`
- Usa la referencia rápida en `ENDPOINTS_REFERENCE.md`

### **Testing**
- Importa la colección de Postman
- Usa los scripts automáticos para tokens
- Ejecuta los flujos de ejemplo

### **Desarrollo**
- Sigue las convenciones de la documentación
- Implementa validaciones del lado cliente
- Maneja errores según los códigos de estado

---

## 🏆 **LOGROS**

✅ **API REST Completa** con 81 endpoints  
✅ **Autenticación JWT** implementada  
✅ **Sistema de Carrito** funcional  
✅ **Gestión de Hosts** completa  
✅ **Sistema de Notificaciones** avanzado  
✅ **Pagos y Transacciones** implementados  
✅ **Búsqueda Avanzada** con filtros  
✅ **Reviews y Calificaciones** funcionales  
✅ **Documentación Completa** para Postman  
✅ **Ejemplos Prácticos** para todos los endpoints  

---

**🎉 ¡La API de Airbnb está lista para producción!**

---

**Versión**: 1.0.0  
**Última actualización**: 2024-01-15  
**Autor**: Equipo de Desarrollo Airbnb Backend
