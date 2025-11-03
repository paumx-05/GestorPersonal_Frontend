# 🚀 MIGRATION PLAN: MOCK TO MONGODB
## Plan Detallado para Migración sin Breaking Changes

### 📋 **RESUMEN EJECUTIVO**
Este documento describe el plan detallado para migrar el sistema Airbnb Backend de datos Mock a MongoDB, manteniendo **100% compatibilidad** y **cero breaking changes** durante todo el proceso.

---

## 🎯 **OBJETIVOS**
- ✅ Migrar de Mock a MongoDB sin interrumpir funcionalidad
- ✅ Mantener compatibilidad total con API existente
- ✅ Permitir alternancia entre Mock y MongoDB
- ✅ Preservar todas las funciones y interfaces actuales
- ✅ Implementar capa de abstracción con Repository Pattern

---

## 🏗️ **ARQUITECTURA PROPUESTA**

### **Estructura de Archivos:**
```
src/
├── models/
│   ├── interfaces/          # 🎯 CAPA ABSTRACTA
│   │   ├── IUserRepository.ts
│   │   ├── IHostRepository.ts
│   │   ├── IPropertyRepository.ts
│   │   ├── IReservationRepository.ts
│   │   ├── IReviewRepository.ts
│   │   ├── IPaymentRepository.ts
│   │   ├── ICartRepository.ts
│   │   ├── IFavoriteRepository.ts
│   │   └── INotificationRepository.ts
│   ├── repositories/        # 🔧 IMPLEMENTACIONES
│   │   ├── mock/           # Implementaciones Mock (actuales)
│   │   │   ├── UserRepositoryMock.ts
│   │   │   ├── HostRepositoryMock.ts
│   │   │   └── ...
│   │   └── mongodb/         # Implementaciones MongoDB
│   │       ├── UserRepositoryMongo.ts
│   │       ├── HostRepositoryMongo.ts
│   │       └── ...
│   ├── factories/          # 🏭 SELECTORES
│   │   ├── UserRepositoryFactory.ts
│   │   ├── HostRepositoryFactory.ts
│   │   └── ...
│   ├── schemas/            # 📊 ESQUEMAS MONGOOSE
│   │   ├── UserSchema.ts
│   │   ├── HostSchema.ts
│   │   └── ...
│   └── index.ts            # 📦 EXPORTADOR PRINCIPAL
├── config/
│   └── database.ts         # 🔧 CONFIGURACIÓN DB
└── utils/
    └── databaseFactory.ts  # 🏭 FACTORY GLOBAL
```

---

## 📋 **PLAN DETALLADO - 8 PASOS**

### **PASO 1: Configuración de Variables de Entorno y Dependencias**

#### **1.1 Variables de Entorno**
```bash
# .env
DB_TYPE=mock  # o 'mongodb'
MONGODB_URI=mongodb://localhost:27017/airbnb-backend
NODE_ENV=development

# .env.production
DB_TYPE=mongodb
MONGODB_URI=mongodb://production-url
NODE_ENV=production
```

#### **1.2 Verificar Dependencias**
```json
// package.json - Ya tienes mongoose instalado ✅
{
  "dependencies": {
    "mongoose": "^8.18.2"  // ✅ Ya instalado
  }
}
```

#### **1.3 Actualizar Configuración de Base de Datos**
```typescript
// src/config/database.ts
export const getDatabaseConfig = () => ({
  type: process.env.DB_TYPE || 'mock',
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend',
  useMock: process.env.DB_TYPE === 'mock' || process.env.NODE_ENV === 'development'
});
```

---

### **PASO 2: Crear Interfaces Comunes (Capa Abstracta)**

#### **2.1 Interface de Usuario**
```typescript
// src/models/interfaces/IUserRepository.ts
export interface IUserRepository {
  // Funciones existentes - MANTENER COMPATIBILIDAD
  findById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  createUser(userData: CreateUserData): Promise<User>;
  updateUser(id: string, updates: UpdateUserData): Promise<User>;
  deleteUser(id: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  verifyCredentials(email: string, password: string): Promise<User | null>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  isPasswordValid(password: string): boolean;
  isEmailAvailable(email: string, excludeUserId?: string): boolean;
  removePasswordFromUser(user: User): Omit<User, 'password'>;
  getUserStats(): Promise<{total: number; active: number; inactive: number}>;
  updateUserPassword(id: string, newPassword: string): Promise<User>;
}
```

#### **2.2 Interfaces para Otros Modelos**
```typescript
// src/models/interfaces/IHostRepository.ts
export interface IHostRepository {
  createHostProperty(property: Omit<HostProperty, 'id' | 'createdAt' | 'updatedAt'>): HostProperty;
  getHostProperties(hostId: string): HostProperty[];
  getHostPropertyById(id: string): HostProperty | null;
  updateHostProperty(id: string, updates: Partial<HostProperty>): HostProperty | null;
  deleteHostProperty(id: string): boolean;
  getHostStats(hostId: string): HostStats;
}

// Repetir para: IPropertyRepository, IReservationRepository, etc.
```

---

### **PASO 3: Crear Esquemas Mongoose**

#### **3.1 Esquema de Usuario**
```typescript
// src/models/schemas/UserSchema.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  avatar: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

// Índices para optimización
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
```

#### **3.2 Esquemas para Otros Modelos**
```typescript
// src/models/schemas/HostSchema.ts
// src/models/schemas/PropertySchema.ts
// src/models/schemas/ReservationSchema.ts
// etc.
```

---

### **PASO 4: Implementar Repository Mock (Migrar Lógica Actual)**

#### **4.1 UserRepositoryMock**
```typescript
// src/models/repositories/mock/UserRepositoryMock.ts
import { IUserRepository } from '../../interfaces/IUserRepository';
import { User, CreateUserData, UpdateUserData } from '../../../types/auth';
// Migrar TODA la lógica actual de src/models/auth/user.ts aquí

export class UserRepositoryMock implements IUserRepository {
  private userDB = {
    users: [] as User[],
    nextId: 1
  };

  async findById(id: string): Promise<User | null> {
    // Migrar lógica de findUserById
  }

  async findUserByEmail(email: string): Promise<User | null> {
    // Migrar lógica de findUserByEmail
  }

  async createUser(userData: CreateUserData): Promise<User> {
    // Migrar lógica de createUser
  }

  // ... implementar TODAS las funciones existentes
}
```

#### **4.2 Repositories Mock para Otros Modelos**
```typescript
// src/models/repositories/mock/HostRepositoryMock.ts
// src/models/repositories/mock/PropertyRepositoryMock.ts
// etc.
```

---

### **PASO 5: Implementar Repository MongoDB**

#### **5.1 UserRepositoryMongo**
```typescript
// src/models/repositories/mongodb/UserRepositoryMongo.ts
import { IUserRepository } from '../../interfaces/IUserRepository';
import { UserModel } from '../../schemas/UserSchema';
import bcrypt from 'bcryptjs';

export class UserRepositoryMongo implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.mapToUser(user) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? this.mapToUser(user) : null;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    const user = new UserModel({
      ...userData,
      password: hashedPassword,
      email: userData.email.toLowerCase()
    });
    const savedUser = await user.save();
    return this.mapToUser(savedUser);
  }

  // ... implementar TODAS las funciones de la interfaz

  private mapToUser(mongoUser: any): User {
    return {
      id: mongoUser._id.toString(),
      email: mongoUser.email,
      name: mongoUser.name,
      password: mongoUser.password,
      avatar: mongoUser.avatar,
      createdAt: mongoUser.createdAt.toISOString(),
      isActive: mongoUser.isActive
    };
  }
}
```

---

### **PASO 6: Crear Factory Pattern**

#### **6.1 UserRepositoryFactory**
```typescript
// src/models/factories/UserRepositoryFactory.ts
import { IUserRepository } from '../interfaces/IUserRepository';
import { UserRepositoryMock } from '../repositories/mock/UserRepositoryMock';
import { UserRepositoryMongo } from '../repositories/mongodb/UserRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class UserRepositoryFactory {
  private static instance: IUserRepository;

  static create(): IUserRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new UserRepositoryMongo();
      } else {
        this.instance = new UserRepositoryMock();
      }
    }
    
    return this.instance;
  }

  static reset(): void {
    this.instance = null as any;
  }
}
```

#### **6.2 Factory Global**
```typescript
// src/utils/databaseFactory.ts
export const getRepository = <T>(factory: () => T): T => {
  return factory();
};
```

---

### **PASO 7: Crear Exportador Principal**

#### **7.1 Index Principal**
```typescript
// src/models/index.ts
import { UserRepositoryFactory } from './factories/UserRepositoryFactory';
import { HostRepositoryFactory } from './factories/HostRepositoryFactory';
// ... otros factories

// Exportar funciones con compatibilidad total
const userRepo = UserRepositoryFactory.create();
const hostRepo = HostRepositoryFactory.create();

// MANTENER EXACTAMENTE LAS MISMAS FUNCIONES EXPORTADAS
export const findUserByEmail = userRepo.findUserByEmail.bind(userRepo);
export const createUser = userRepo.createUser.bind(userRepo);
export const findUserById = userRepo.findById.bind(userRepo);
export const updateUser = userRepo.updateUser.bind(userRepo);
export const deleteUser = userRepo.deleteUser.bind(userRepo);
export const getAllUsers = userRepo.getAllUsers.bind(userRepo);
export const verifyCredentials = userRepo.verifyCredentials.bind(userRepo);
export const hashPassword = userRepo.hashPassword.bind(userRepo);
export const comparePassword = userRepo.comparePassword.bind(userRepo);
export const isPasswordValid = userRepo.isPasswordValid.bind(userRepo);
export const isEmailAvailable = userRepo.isEmailAvailable.bind(userRepo);
export const removePasswordFromUser = userRepo.removePasswordFromUser.bind(userRepo);
export const getUserStats = userRepo.getUserStats.bind(userRepo);
export const updateUserPassword = userRepo.updateUserPassword.bind(userRepo);

// Exportar tipos
export type { CreateUserData, UpdateUserData } from '../types/auth';

// Host functions
export const createHostProperty = hostRepo.createHostProperty.bind(hostRepo);
export const getHostProperties = hostRepo.getHostProperties.bind(hostRepo);
// ... etc para todos los modelos
```

---

### **PASO 8: Actualizar Controladores (CERO BREAKING CHANGES)**

#### **8.1 Cambiar Imports en Controladores**
```typescript
// src/controllers/auth/authController.ts
// CAMBIAR DE:
import { findUserByEmail, createUser, findUserById, updateUserPassword, hashPassword, comparePassword, isPasswordValid } from '../../models/auth/user';

// A:
import { findUserByEmail, createUser, findUserById, updateUserPassword, hashPassword, comparePassword, isPasswordValid } from '../../models';

// ✅ CERO CAMBIOS EN EL RESTO DEL CÓDIGO
```

#### **8.2 Actualizar Todos los Controladores**
```typescript
// src/controllers/host/hostController.ts
// CAMBIAR DE:
import { createHostProperty, getHostProperties } from '../../models/host/hostMock';

// A:
import { createHostProperty, getHostProperties } from '../../models';

// ✅ CERO CAMBIOS EN EL RESTO DEL CÓDIGO
```

---

## 🔧 **CONFIGURACIÓN DE CONEXIÓN**

### **Conexión MongoDB**
```typescript
// src/config/database.ts
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const config = getDatabaseConfig();
  
  if (config.type === 'mongodb') {
    try {
      await mongoose.connect(config.mongoURI);
      console.log('✅ MongoDB conectado exitosamente');
    } catch (error) {
      console.warn('⚠️ MongoDB no disponible - usando Mock');
      console.warn('Para conectar MongoDB, asegúrate de que esté ejecutándose');
    }
};
```

### **Actualizar server.ts**
```typescript
// src/server.ts
import { connectDB } from './config/database';

const startServer = async (): Promise<void> => {
  await connectDB(); // Conectar DB antes de iniciar servidor
  
  app.listen(config.port, () => {
    // ... resto del código existente
  });
};
```

---

## 🚀 **SCRIPTS DE DESARROLLO**

### **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "DB_TYPE=mock nodemon src/server.ts",
    "dev:mongo": "DB_TYPE=mongodb nodemon src/server.ts",
    "start": "DB_TYPE=mongodb node dist/server.js",
    "test:mock": "DB_TYPE=mock npm test",
    "test:mongo": "DB_TYPE=mongodb npm test"
  }
}
```

---

## 🧪 **TESTING Y VALIDACIÓN**

### **Tests de Compatibilidad**
```typescript
// tests/compatibility.test.ts
describe('Repository Compatibility', () => {
  it('should work with Mock implementation', async () => {
    process.env.DB_TYPE = 'mock';
    const { createUser } = require('../src/models');
    // Test functionality
  });

  it('should work with MongoDB implementation', async () => {
    process.env.DB_TYPE = 'mongodb';
    const { createUser } = require('../src/models');
    // Test functionality
  });
});
```

---

## 📊 **ORDEN DE MIGRACIÓN RECOMENDADO**

### **Fase 1: Core Models**
1. ✅ **User** (ya preparado)
2. 🔄 **Host**
3. 🔄 **Property**
4. 🔄 **Reservation**

### **Fase 2: Feature Models**
5. 🔄 **Review**
6. 🔄 **Payment**
7. 🔄 **Cart**
8. 🔄 **Favorite**
9. 🔄 **Notification**

---

## ⚠️ **GARANTÍAS DE COMPATIBILIDAD**

### **✅ CERO BREAKING CHANGES:**
- ✅ Mismas funciones exportadas
- ✅ Mismos parámetros de entrada
- ✅ Mismos tipos de retorno
- ✅ Misma API de controladores
- ✅ Mismos endpoints HTTP
- ✅ Misma estructura de respuestas

### **✅ MIGRACIÓN GRADUAL:**
- ✅ Modelo por modelo
- ✅ Rollback inmediato si hay problemas
- ✅ Testing continuo
- ✅ Documentación actualizada

### **✅ FLEXIBILIDAD TOTAL:**
- ✅ Mock para desarrollo local
- ✅ MongoDB para producción
- ✅ Cambio con variable de entorno
- ✅ Testing con ambos sistemas

---

## 🎯 **RESULTADO FINAL**

Al completar esta migración tendrás:

1. **🔄 Sistema Híbrido**: Mock + MongoDB
2. **📦 Repository Pattern**: Capa de abstracción robusta
3. **🏭 Factory Pattern**: Selección automática de implementación
4. **✅ Cero Breaking Changes**: Compatibilidad total
5. **🧪 Testing Flexible**: Ambos sistemas disponibles
6. **🚀 Producción Lista**: MongoDB para datos reales
7. **📚 Documentación Completa**: Proceso documentado

---

## 🚨 **NOTAS IMPORTANTES**

- ⚠️ **NO eliminar archivos Mock** hasta confirmar que MongoDB funciona
- ⚠️ **Mantener backups** de la implementación actual
- ⚠️ **Testing exhaustivo** antes de producción
- ⚠️ **Documentar cambios** en cada paso
- ⚠️ **Rollback plan** preparado

---

*Este plan garantiza una migración segura y sin interrupciones del servicio.*
