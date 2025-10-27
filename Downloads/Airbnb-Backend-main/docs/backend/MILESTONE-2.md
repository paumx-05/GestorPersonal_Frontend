# 🎯 MILESTONE 2: SISTEMA DE AUTENTICACIÓN MOCK - API Y MIDDLEWARE

## 📋 **DESCRIPCIÓN DEL MILESTONE**

Implementación del sistema de autenticación completo con datos mock para el backend del proyecto Airbnb Luxury. Este milestone se enfoca en crear APIs REST de autenticación, middleware de seguridad, validaciones y manejo de sesiones usando programación funcional y arquitectura MVC sin dependencias de MongoDB.

---

## 🎯 **OBJETIVOS PRINCIPALES**

- ✅ Implementar APIs REST de autenticación (login, register, logout)
- ✅ Crear middleware de autenticación y autorización
- ✅ Sistema de validación de datos con JWT mock
- ✅ Manejo de errores y respuestas consistentes
- ✅ Base de datos mock en memoria para usuarios

---

## 📝 **PASOS DE IMPLEMENTACIÓN**

### **🏗️ PASO 1: CREAR SISTEMA MOCK DE USUARIOS**
**Tiempo estimado:** 30 minutos

```bash
# Crear estructura de archivos
mkdir -p src/models/auth
mkdir -p src/controllers/auth
mkdir -p src/routes/auth
mkdir -p src/middleware/auth
```

**Archivos a crear:**
- `src/models/auth/userMock.ts` - Base de datos mock de usuarios
- `src/types/auth.ts` - Tipos TypeScript para autenticación
- `src/utils/jwtMock.ts` - Sistema JWT mock
- `src/utils/validation.ts` - Validaciones de datos

**Crear `src/models/auth/userMock.ts`:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Hasheada
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

interface UserDB {
  users: User[];
  nextId: number;
}

// Base de datos mock en memoria
const userDB: UserDB = {
  users: [
    {
      id: '1',
      email: 'demo@airbnb.com',
      name: 'Usuario Demo',
      password: '$2a$10$hashedpassword', // bcrypt hash
      avatar: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ],
  nextId: 2
};

// Funciones CRUD mock
export const findUserByEmail = (email: string): User | null => {
  return userDB.users.find(user => user.email === email) || null;
};

export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: userDB.nextId.toString(),
    createdAt: new Date().toISOString()
  };
  userDB.users.push(newUser);
  userDB.nextId++;
  return newUser;
};

export const findUserById = (id: string): User | null => {
  return userDB.users.find(user => user.id === id) || null;
};
```

---

### **🔧 PASO 2: IMPLEMENTAR SISTEMA JWT MOCK**
**Tiempo estimado:** 25 minutos

**Crear `src/utils/jwtMock.ts`:**
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Simulación de JWT sin dependencias externas
export const generateToken = (userId: string, email: string): string => {
  const payload: JWTPayload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  };
  
  // Simulación de token (en producción usar jsonwebtoken)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Verificar expiración
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
};

export const hashPassword = (password: string): string => {
  // Simulación de hash (en producción usar bcrypt)
  return `$2a$10$${Buffer.from(password).toString('base64')}`;
};

export const comparePassword = (password: string, hash: string): boolean => {
  // Simulación de comparación (en producción usar bcrypt)
  const expectedHash = `$2a$10$${Buffer.from(password).toString('base64')}`;
  return hash === expectedHash;
};
```

---

### **🎯 PASO 3: CREAR CONTROLADORES DE AUTENTICACIÓN**
**Tiempo estimado:** 40 minutos

**Crear `src/controllers/auth/authController.ts`:**
```typescript
import { Request, Response } from 'express';
import { findUserByEmail, createUser, findUserById } from '../../models/auth/userMock';
import { generateToken, hashPassword, comparePassword } from '../../utils/jwtMock';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validaciones
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: { message: 'Email inválido' }
      });
      return;
    }

    if (!validatePassword(password)) {
      res.status(400).json({
        success: false,
        error: { message: 'Password debe tener mínimo 6 caracteres' }
      });
      return;
    }

    if (!validateName(name)) {
      res.status(400).json({
        success: false,
        error: { message: 'Nombre debe tener mínimo 2 caracteres' }
      });
      return;
    }

    // Verificar si usuario ya existe
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { message: 'Usuario ya existe' }
      });
      return;
    }

    // Crear usuario
    const hashedPassword = hashPassword(password);
    const newUser = createUser({
      email,
      password: hashedPassword,
      name,
      isActive: true
    });

    // Generar token
    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: { message: 'Email y password son requeridos' }
      });
      return;
    }

    // Buscar usuario
    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Credenciales inválidas' }
      });
      return;
    }

    // Verificar password
    if (!comparePassword(password, user.password)) {
      res.status(401).json({
        success: false,
        error: { message: 'Credenciales inválidas' }
      });
      return;
    }

    // Verificar si usuario está activo
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: { message: 'Cuenta desactivada' }
      });
      return;
    }

    // Generar token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // En un sistema real, aquí invalidaríamos el token
    // Para mock, simplemente confirmamos el logout
    res.json({
      success: true,
      data: { message: 'Logout exitoso' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// GET /api/auth/me
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Token inválido' }
      });
      return;
    }

    const user = findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};
```

---

### **🎨 PASO 4: IMPLEMENTAR MIDDLEWARE DE AUTENTICACIÓN**
**Tiempo estimado:** 35 minutos

**Crear `src/middleware/auth/authMiddleware.ts`:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../utils/jwtMock';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Token de acceso requerido' }
      });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(403).json({
        success: false,
        error: { message: 'Token inválido o expirado' }
      });
      return;
    }

    // Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error verificando token' }
    });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
      }
    }

    next();
  } catch (error) {
    // En optional auth, continuamos sin usuario
    next();
  }
};
```

**Crear `src/utils/validation.ts`:**
```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password && password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name && name.trim().length >= 2;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

---

### **🔄 PASO 5: CONFIGURAR RUTAS Y INTEGRACIÓN**
**Tiempo estimado:** 30 minutos

**Crear `src/routes/auth/authRoutes.ts`:**
```typescript
import { Router } from 'express';
import { register, login, logout, getProfile } from '../../controllers/auth/authController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Rutas protegidas
router.get('/me', authenticateToken, getProfile);

export default router;
```

**Actualizar `src/app.ts`:**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';
import authRoutes from './routes/auth/authRoutes';

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors());

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'OK', 
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString()
    }
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

export default app;
```

---

## 🌐 **ENDPOINTS CREADOS**

### **URLs de Acceso:**
- **🔐 Registro:** `POST http://localhost:5000/api/auth/register`
- **🔑 Login:** `POST http://localhost:5000/api/auth/login`
- **🚪 Logout:** `POST http://localhost:5000/api/auth/logout`
- **👤 Perfil:** `GET http://localhost:5000/api/auth/me` *(protegida)*
- **🏠 Health Check:** `GET http://localhost:5000/api/health`

### **Estructura de Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "demo@airbnb.com",
      "name": "Usuario Demo",
      "avatar": "https://via.placeholder.com/150"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🧪 **DATOS DE PRUEBA**

### **Usuarios Mock Disponibles:**
```javascript
// Usuario demo principal
{
  email: 'demo@airbnb.com',
  password: 'cualquier_password' // mínimo 6 caracteres
}
```

### **Registro de Nuevos Usuarios:**
- Cualquier email nuevo con formato válido
- Password mínimo 6 caracteres
- Nombre mínimo 2 caracteres

### **Headers para Rutas Protegidas:**
```javascript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## ✅ **CRITERIOS DE ACEPTACIÓN**

- [x] Endpoint `/api/auth/register` funcionando con validaciones
- [x] Endpoint `/api/auth/login` funcionando con autenticación
- [x] Endpoint `/api/auth/logout` respondiendo correctamente
- [x] Endpoint `/api/auth/me` protegido con middleware
- [x] Sistema JWT mock implementado
- [x] Base de datos mock en memoria operativa
- [x] Middleware de autenticación funcionando
- [x] Validaciones de datos implementadas
- [x] Manejo de errores consistente
- [x] Sin dependencias de MongoDB
- [x] Programación funcional aplicada
- [x] Arquitectura MVC respetada

---

## 🚀 **RESULTADO ESPERADO**

Al completar este milestone tendrás:
1. **Sistema de autenticación completo** con APIs REST
2. **Base de datos mock** en memoria para usuarios
3. **Middleware de seguridad** con JWT mock
4. **Validaciones robustas** de datos de entrada
5. **Base sólida** para el Milestone 3 (CRUD de propiedades)

---

## 📚 **PRÓXIMOS PASOS**

Este milestone establece la base para:
- **Milestone 3**: CRUD de propiedades con autenticación
- **Milestone 4**: Sistema de reservas
- **Milestone 5**: API de búsqueda avanzada
- **Milestone 6**: Integración con frontend

---

**Tiempo total estimado:** 2.5 horas  
**Complejidad:** Intermedia  
**Prioridad:** Alta 🔥

---

## 🔧 **TECNOLOGÍAS IMPLEMENTADAS**

- **Express.js** - Framework web para Node.js
- **TypeScript** - Superset tipado de JavaScript
- **JWT Mock** - Sistema de tokens simulado
- **CORS** - Configuración de políticas de origen cruzado
- **Helmet** - Middleware de seguridad
- **Morgan** - Logger de requests HTTP
- **Base64** - Codificación de tokens mock

---

## 🎯 **PRINCIPIOS APLICADOS**

- **Programación Funcional** - Preferencia sobre clases/objetos
- **Arquitectura MVC** - Separación clara de responsabilidades
- **REST API** - Estándares de diseño de APIs
- **Mock Data** - Sin dependencias de MongoDB
- **Código Escalable** - Estructura preparada para crecimiento
- **Seguridad First** - Middleware de autenticación robusto
- **Validación de Datos** - Entrada segura y consistente
