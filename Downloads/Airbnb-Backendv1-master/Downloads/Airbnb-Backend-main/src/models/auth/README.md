# 📁 Models - Auth

Este directorio contiene los modelos relacionados con la autenticación de usuarios.

## 📄 Archivos

### `user.ts` (Principal - MongoDB)
- **Propósito**: Modelo principal con encriptación real de contraseñas
- **Características**: 
  - ✅ Encriptación real con bcryptjs
  - ✅ Validaciones de negocio completas
  - ✅ Conectado a MongoDB Atlas
  - ✅ Funciones CRUD completas
  - ✅ Manejo de errores robusto

### `userExample.ts` (Documentación)
- **Propósito**: Ejemplos de uso del modelo user.ts
- **Uso**: Solo para documentación y aprendizaje

## 🔐 Características de Seguridad

### Encriptación de Contraseñas
```typescript
// Encriptación automática al crear usuario
const result = await createUser({
  email: 'usuario@ejemplo.com',
  name: 'Usuario',
  password: 'Password123' // Se encripta automáticamente
});

// Verificación de contraseñas
const isValid = await verifyCredentials(email, password);
```

### Validaciones de Contraseña
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula  
- Al menos un número
- Caracteres especiales opcionales: @$!%*?&

### Validaciones de Email
- Formato válido de email
- Unicidad en la base de datos
- Normalización a minúsculas

## 🚀 Uso Básico

### Crear Usuario
```typescript
import { createUser } from './user';

const result = await createUser({
  email: 'nuevo@ejemplo.com',
  name: 'Usuario Nuevo',
  password: 'Password123'
});

if (result.success) {
  console.log('Usuario creado:', result.data);
} else {
  console.log('Error:', result.error);
}
```

### Verificar Credenciales
```typescript
import { verifyCredentials } from './user';

const user = await verifyCredentials('usuario@ejemplo.com', 'Password123');
if (user) {
  console.log('Login exitoso:', user.name);
}
```

### Buscar Usuario
```typescript
import { findUserByEmail, findUserById } from './user';

const userByEmail = await findUserByEmail('usuario@ejemplo.com');
const userById = await findUserById('1');
```

### Actualizar Usuario
```typescript
import { updateUser } from './user';

const result = await updateUser('1', {
  name: 'Nuevo Nombre',
  avatar: 'https://nueva-imagen.com'
});
```

### Eliminar Usuario (Soft Delete)
```typescript
import { deleteUser } from './user';

const result = await deleteUser('1');
// El usuario se marca como inactivo, no se elimina físicamente
```

## 🔧 Configuración

### Variables de Entorno
```env
# Para bcrypt (opcional, usa valores por defecto)
BCRYPT_SALT_ROUNDS=12
```

### Dependencias Requeridas
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

## 🗄️ MongoDB Atlas (Producción)

El sistema está conectado a **MongoDB Atlas**:

1. ✅ **Esquema de Mongoose configurado** en `UserSchema.ts`
2. ✅ **Repositorio MongoDB** - `UserRepositoryMongo`
3. ✅ **Factory Pattern** - Selección automática de MongoDB
4. ✅ **Contraseñas encriptadas** con bcrypt
5. ✅ **Validaciones completas** en todas las operaciones

### Conexión a MongoDB
- **URI**: Configurada en `.env` con `MONGODB_URI`
- **Database**: `airbnb-backend` en MongoDB Atlas
- **Atlas Cluster**: ClusterAirBnb

## 🧪 Testing

### Usuario Demo Disponible
```typescript
// Email: demo@airbnb.com
// Password: demo123 (en texto plano, se compara con hash)
```

### Funciones de Utilidad
```typescript
import { getUserStats, removePasswordFromUser } from './user';

// Obtener estadísticas
const stats = await getUserStats();

// Remover contraseña de objeto usuario
const safeUser = removePasswordFromUser(user);
```

## ⚠️ Consideraciones Importantes

1. **Contraseñas**: Siempre se almacenan encriptadas, nunca en texto plano
2. **Emails**: Se normalizan a minúsculas automáticamente
3. **Soft Delete**: Los usuarios se marcan como inactivos, no se eliminan
4. **Validaciones**: Se realizan antes de cualquier operación
5. **Errores**: Todas las funciones manejan errores apropiadamente

## 🔄 Sistema Actual

El sistema ahora está conectado a **MongoDB Atlas** (producción):

1. **Los datos se almacenan** en MongoDB Atlas
2. **No hay datos mock** - todo es persistente en la base de datos
3. **Contraseñas encriptadas** con bcrypt
4. **Validaciones completas** en todos los endpoints

## 📞 Soporte

Para dudas sobre el uso del modelo, consulta:
- `userExample.ts` para ejemplos prácticos
- Este README para documentación completa
- Los comentarios en `user.ts` para detalles técnicos
