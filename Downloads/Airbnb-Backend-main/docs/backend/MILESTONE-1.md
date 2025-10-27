# 🎯 MILESTONE 1: CONFIGURACIÓN INICIAL DEL BACKEND - SETUP Y ESTRUCTURA BASE

## 📋 **DESCRIPCIÓN DEL MILESTONE**

Configuración inicial del backend para el proyecto Airbnb Luxury con MongoDB, Express.js y TypeScript. Este milestone se enfoca en la estructura fundamental del servidor, configuración de base de datos, middleware básico y rutas de prueba siguiendo principios de programación funcional y arquitectura MVC.

---

## 🎯 **OBJETIVOS PRINCIPALES**

- ✅ Configurar servidor Express.js con TypeScript
- ✅ Conectar con base de datos MongoDB
- ✅ Implementar arquitectura MVC básica
- ✅ Crear middleware de seguridad y validación
- ✅ Establecer rutas de prueba y documentación API

---

## 📝 **PASOS DE IMPLEMENTACIÓN**

### **🏗️ PASO 1: CONFIGURAR ESTRUCTURA DEL PROYECTO**
**Tiempo estimado:** 30 minutos

```bash
# Crear estructura de directorios
mkdir -p src/{controllers,models,routes,middleware,utils,types,config}
mkdir -p src/{controllers/auth,controllers/properties}
mkdir -p src/{models/auth,models/properties}
mkdir -p src/{routes/auth,routes/properties}
```

**Archivos a crear:**
- `src/app.ts` - Configuración principal del servidor
- `src/server.ts` - Punto de entrada del servidor
- `src/config/database.ts` - Configuración de MongoDB
- `src/config/environment.ts` - Variables de entorno
- `src/types/index.ts` - Tipos TypeScript globales
- `src/middleware/errorHandler.ts` - Manejo de errores
- `src/middleware/cors.ts` - Configuración CORS
- `src/utils/logger.ts` - Sistema de logging

---

### **🔧 PASO 2: CONFIGURAR DEPENDENCIAS Y TYPESCRIPT**
**Tiempo estimado:** 25 minutos

**Instalar dependencias necesarias:**
```bash
npm install express mongoose cors helmet morgan dotenv bcryptjs jsonwebtoken
npm install -D @types/express @types/mongoose @types/cors @types/morgan @types/bcryptjs @types/jsonwebtoken @types/node typescript ts-node nodemon
```

**Configurar `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### **🎯 PASO 3: IMPLEMENTAR CONFIGURACIÓN DE BASE DE DATOS**
**Tiempo estimado:** 35 minutos

**Crear `src/config/database.ts`:**
```typescript
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend';
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
```

**Crear `src/config/environment.ts`:**
```typescript
export const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  nodeEnv: process.env.NODE_ENV || 'development'
};
```

---

### **🎨 PASO 4: CREAR SERVIDOR EXPRESS BÁSICO**
**Tiempo estimado:** 40 minutos

**Crear `src/app.ts`:**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';

const app = express();

// Conectar a base de datos
connectDB();

// Middleware de seguridad
app.use(helmet());
app.use(cors());

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

export default app;
```

**Crear `src/server.ts`:**
```typescript
import app from './app';
import { config } from './config/environment';
import logger from './utils/logger';

const startServer = (): void => {
  app.listen(config.port, () => {
    logger.info(`🚀 Servidor ejecutándose en puerto ${config.port}`);
    logger.info(`📊 Entorno: ${config.nodeEnv}`);
    logger.info(`🔗 URL: http://localhost:${config.port}`);
  });
};

startServer();
```

---

### **🔄 PASO 5: IMPLEMENTAR MIDDLEWARE Y UTILIDADES**
**Tiempo estimado:** 30 minutos

**Crear `src/middleware/errorHandler.ts`:**
```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  logger.error(`Error ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export default errorHandler;
```

**Crear `src/utils/logger.ts`:**
```typescript
const logger = {
  info: (message: string): void => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  error: (message: string): void => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  },
  warn: (message: string): void => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }
};

export default logger;
```

---

## 🌐 **ENDPOINTS CREADOS**

### **URLs de Acceso:**
- **🏠 Health Check:** `GET http://localhost:5000/api/health`
- **📊 Status:** `GET http://localhost:5000/api/status`
- **🔧 Config:** `GET http://localhost:5000/api/config` *(solo desarrollo)*

### **Estructura de Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "message": "Servidor funcionando correctamente",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🧪 **CONFIGURACIÓN DE DESARROLLO**

### **Variables de Entorno (.env):**
```bash
# Puerto del servidor
PORT=5000

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/airbnb-backend

# JWT Secret (cambiar en producción)
JWT_SECRET=your-super-secret-jwt-key

# Entorno
NODE_ENV=development
```

### **Scripts de Package.json:**
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## ✅ **CRITERIOS DE ACEPTACIÓN**

- [x] Servidor Express.js funcionando en puerto 5000
- [x] Conexión a MongoDB establecida
- [x] Endpoint `/api/health` respondiendo correctamente
- [x] Middleware de seguridad (CORS, Helmet) configurado
- [x] Sistema de logging implementado
- [x] Manejo de errores funcionando
- [x] TypeScript compilando sin errores
- [x] Estructura MVC básica establecida
- [x] Variables de entorno configuradas
- [x] Sin errores de consola

---

## 🚀 **RESULTADO ESPERADO**

Al completar este milestone tendrás:
1. **Servidor backend** funcionando con Express.js y TypeScript
2. **Base de datos MongoDB** conectada y configurada
3. **Arquitectura MVC** básica implementada
4. **Middleware de seguridad** y manejo de errores
5. **Base sólida** para el Milestone 2 (Autenticación)

---

## 📚 **PRÓXIMOS PASOS**

Este milestone establece la base para:
- **Milestone 2**: Sistema de autenticación con JWT
- **Milestone 3**: CRUD de propiedades
- **Milestone 4**: Sistema de reservas
- **Milestone 5**: API de búsqueda avanzada

---

**Tiempo total estimado:** 2.5 horas  
**Complejidad:** Básica  
**Prioridad:** Alta 🔥

---

## 🔧 **TECNOLOGÍAS IMPLEMENTADAS**

- **Express.js** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **TypeScript** - Superset tipado de JavaScript
- **CORS** - Configuración de políticas de origen cruzado
- **Helmet** - Middleware de seguridad
- **Morgan** - Logger de requests HTTP
- **Bcryptjs** - Hashing de contraseñas
- **JSON Web Tokens** - Autenticación stateless

---

## 🎯 **PRINCIPIOS APLICADOS**

- **Programación Funcional** - Preferencia sobre clases/objetos
- **Arquitectura MVC** - Separación clara de responsabilidades
- **REST API** - Estándares de diseño de APIs
- **Código Escalable** - Estructura preparada para crecimiento
- **Seguridad First** - Middleware de seguridad desde el inicio
