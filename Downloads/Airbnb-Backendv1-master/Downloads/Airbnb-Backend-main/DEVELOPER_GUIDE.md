# 🏠 Airbnb Backend - Guía para Desarrolladores

## 📋 Descripción del Proyecto

Este es el backend de una aplicación tipo Airbnb construido con **Node.js**, **Express** y **TypeScript**. El proyecto sigue el patrón arquitectónico **MVC (Model-View-Controller)** para mantener una estructura clara y escalable.

## 🏗️ Arquitectura MVC

### 📁 Estructura de Directorios

```
src/
├── config/           # Configuración de la aplicación
│   ├── database.ts   # Conexión a MongoDB
│   └── environment.ts # Variables de entorno
├── controllers/      # Lógica de negocio (C)
│   └── auth/         # Controladores de autenticación
├── middleware/       # Middlewares personalizados
│   ├── auth/         # Middleware de autenticación
│   └── errorHandler.ts # Manejo global de errores
├── models/           # Modelos de datos (M)
│   └── auth/         # Modelos de usuario
├── routes/           # Definición de rutas (V)
│   └── auth/         # Rutas de autenticación
├── types/            # Definiciones de tipos TypeScript
├── utils/            # Utilidades y helpers
├── app.ts            # Configuración principal de Express
└── server.ts         # Punto de entrada del servidor
```

### 🔄 Flujo MVC

1. **Routes (V)**: Recibe las peticiones HTTP y las dirige al controlador apropiado
2. **Controllers (C)**: Procesa la lógica de negocio y coordina con los modelos
3. **Models (M)**: Maneja los datos y la interacción con la base de datos

## 🚀 Comandos Disponibles

```bash
# Desarrollo (con hot reload)
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/airbnb-backend
JWT_SECRET=tu-secreto-jwt-aqui
```

## 📡 Endpoints Disponibles

### 🔐 Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Inicio de sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | No |
| POST | `/api/auth/refresh` | Renovar token | No |
| GET | `/api/auth/me` | Obtener perfil | Sí |
| GET | `/api/auth/test` | Prueba de middleware | Opcional |

### 🏥 Utilidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información de la API |
| GET | `/api/health` | Health check |
| GET | `/api/status` | Estado del servidor |

## 🔒 Autenticación

### Headers Requeridos

Para rutas protegidas, incluye el header:

```
Authorization: Bearer <tu-token-jwt>
```

### 🔄 Renovación Automática de Tokens

El sistema incluye renovación automática de tokens para mantener sesiones activas:

#### Endpoint de Refresh
```
POST /api/auth/refresh
Content-Type: application/json

{
  "token": "tu-token-actual"
}
```

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "token": "nuevo-token-jwt",
    "message": "Token renovado exitosamente"
  }
}
```

#### Middleware de Renovación Automática
- **`authenticateWithAutoRefresh`**: Autentica y renueva automáticamente tokens próximos a expirar
- **Headers de respuesta**: `X-New-Token` y `X-Token-Refreshed` cuando se renueva un token
- **Umbral de renovación**: 15 minutos antes de la expiración

### Respuesta de Error de Autenticación

```json
{
  "success": false,
  "error": {
    "message": "Token de acceso requerido"
  }
}
```

## 📝 Formato de Respuestas

### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "usuario@ejemplo.com",
      "name": "Nombre Usuario"
    },
    "token": "jwt-token"
  }
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "message": "Descripción del error"
  }
}
```

## 🛠️ Middlewares

### 1. `authenticateToken`
Verifica que el token JWT sea válido.

### 2. `optionalAuth`
Permite acceso tanto a usuarios autenticados como anónimos.

### 3. `errorHandler`
Maneja errores globalmente y los formatea consistentemente.

## 🧪 Validaciones

El proyecto incluye validaciones para:

- **Email**: Formato válido de email
- **Password**: Mínimo 6 caracteres
- **Name**: Mínimo 2 caracteres
- **Campos requeridos**: Verificación de campos obligatorios
- **Sanitización**: Limpieza de inputs para prevenir XSS

## 🔍 Debugging

### Logs Disponibles

- **Morgan**: Registra todas las peticiones HTTP
- **Logger personalizado**: Para logs de aplicación
- **Console.error**: Para errores en middleware de autenticación

### Herramientas de Desarrollo

```bash
# Ver logs en tiempo real
npm run dev

# Compilar y verificar TypeScript
npm run build
```

## 🚨 Errores Comunes

### 1. Puerto en Uso
```bash
Error: listen EADDRINUSE :::3000
```
**Solución**: Cambia el puerto en `.env` o termina el proceso que usa el puerto.

### 2. Token Inválido
```json
{
  "success": false,
  "error": {
    "message": "Token inválido o expirado"
  }
}
```
**Solución**: Verifica que el token esté bien formateado y no haya expirado.

### 3. Campos Faltantes
```json
{
  "success": false,
  "error": {
    "message": "Campos requeridos: email, password"
  }
}
```
**Solución**: Asegúrate de enviar todos los campos requeridos en el body de la petición.

## 📚 Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Guía de TypeScript](https://www.typescriptlang.org/docs/)
- [Patrón MVC](https://developer.mozilla.org/es/docs/Glossary/MVC)

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes dudas o encuentras problemas:

1. Revisa esta documentación
2. Verifica los logs del servidor
3. Consulta la documentación de los endpoints
4. Abre un issue en el repositorio

---

**¡Happy Coding! 🚀**
