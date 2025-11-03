# Requisitos Backend: Schema de Usuario para Perfil

## 📋 Resumen

El frontend necesita que el modelo de Usuario en MongoDB tenga los siguientes campos para que las actualizaciones de perfil persistan correctamente:

- ✅ `name` - Nombre completo del usuario (ya debería existir)
- ❌ `description` - Descripción del usuario (NUEVO, falta)
- ❌ `avatar` - URL de la imagen de perfil (puede faltar)

**Problema actual:** Cuando el usuario actualiza su perfil (nombre, descripción, avatar), los cambios no se guardan en la base de datos porque estos campos no existen en el schema o no se están actualizando correctamente.

---

## 🗄️ Schema de MongoDB Requerido

### Schema Completo del Modelo User

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Campos básicos (ya deberían existir)
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  
  // ⚠️ CAMPO NUEVO - Descripción del usuario
  description: {
    type: String,
    default: null,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    trim: true
  },
  
  // ⚠️ CAMPO A VERIFICAR - Avatar del usuario
  avatar: {
    type: String,
    default: null,
    trim: true
    // Puede ser una URL o una ruta de archivo según tu implementación
  },
  
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true
  },
  
  // Campos de fecha (Mongoose los maneja automáticamente con timestamps)
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // ... otros campos que puedas tener (isActive, isVerified, etc.)
}, {
  timestamps: true, // Esto automáticamente maneja createdAt y updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Asegurar que el formato de respuesta sea consistente
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Nunca devolver la contraseña
      return ret;
    }
  }
});

module.exports = mongoose.model('User', userSchema);
```

---

## 🔧 Script de Migración (Opcional)

Si ya tienes usuarios en la base de datos y necesitas agregar los campos `description` y `avatar` a usuarios existentes, usa este script:

### Migración para MongoDB

```javascript
// scripts/migrate-user-schema.js
const mongoose = require('mongoose');
const User = require('../models/User'); // Ajusta la ruta según tu proyecto

async function migrateUserSchema() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB');
    
    // Agregar campo description a usuarios que no lo tengan
    const updateDescription = await User.updateMany(
      { description: { $exists: false } },
      { $set: { description: null } }
    );
    console.log(`✅ Actualizados ${updateDescription.modifiedCount} usuarios con campo 'description'`);
    
    // Agregar campo avatar a usuarios que no lo tengan
    const updateAvatar = await User.updateMany(
      { avatar: { $exists: false } },
      { $set: { avatar: null } }
    );
    console.log(`✅ Actualizados ${updateAvatar.modifiedCount} usuarios con campo 'avatar'`);
    
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrateUserSchema();
```

**Ejecutar la migración:**
```bash
node scripts/migrate-user-schema.js
```

---

## 📝 Validaciones Requeridas

### 1. Campo `name`
- ✅ Requerido
- ✅ Máximo 100 caracteres
- ✅ No puede estar vacío

### 2. Campo `description` (NUEVO)
- ⚠️ Opcional (puede ser `null` o string vacío)
- ⚠️ Máximo 500 caracteres
- ⚠️ Si viene como string vacío `""`, debe guardarse como `null`

### 3. Campo `avatar` (VERIFICAR)
- ⚠️ Opcional (puede ser `null` o URL)
- ⚠️ Si viene un archivo, debe procesarse y guardarse como URL
- ⚠️ Validar formato de imagen (JPG, PNG, WebP)
- ⚠️ Validar tamaño máximo (recomendado: 5MB)

---

## 🔄 Actualización del Endpoint PATCH /api/profile

Asegúrate de que el endpoint esté actualizando estos campos en la base de datos:

### Ejemplo de Implementación

```javascript
// routes/profile.js o controllers/profileController.js
const User = require('../models/User');
const multer = require('multer'); // Para manejar archivos
const path = require('path');
const fs = require('fs');

// Configurar multer para subir avatares
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = 'uploads/avatars/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no válido. Use JPG, PNG o WebP.'));
    }
  }
});

// Endpoint PATCH /api/profile
router.patch('/api/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user.id; // Del middleware de autenticación
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const updateData = {};
    const errors = [];
    
    // 1. Procesar name
    if (req.body.name !== undefined) {
      const name = req.body.name?.trim();
      if (name && name.length > 0 && name.length <= 100) {
        updateData.name = name;
      } else if (name) {
        errors.push({
          field: 'name',
          message: 'El nombre debe tener entre 1 y 100 caracteres'
        });
      }
    }
    
    // 2. Procesar description (NUEVO)
    if (req.body.description !== undefined) {
      const description = req.body.description?.trim() || null;
      if (description === null || (description.length >= 0 && description.length <= 500)) {
        updateData.description = description || null; // Asegurar null si está vacío
      } else {
        errors.push({
          field: 'description',
          message: 'La descripción no puede exceder 500 caracteres'
        });
      }
    }
    
    // 3. Procesar avatar (NUEVO o VERIFICAR)
    if (req.file) {
      // Si se subió un nuevo archivo
      // Eliminar avatar anterior si existe
      if (user.avatar && fs.existsSync(user.avatar)) {
        fs.unlinkSync(user.avatar);
      }
      
      // Guardar URL del nuevo avatar
      // Ajusta según tu configuración de servidor de archivos
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      // O si usas un servicio cloud (AWS S3, Cloudinary, etc.):
      // updateData.avatar = await uploadToCloudStorage(req.file);
    } else if (req.body.avatar === null || req.body.avatar === '') {
      // Si se envía explícitamente null o string vacío, eliminar avatar
      if (user.avatar && fs.existsSync(user.avatar)) {
        fs.unlinkSync(user.avatar);
      }
      updateData.avatar = null;
    }
    
    // Si hay errores de validación, devolverlos
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors
      });
    }
    
    // Actualizar usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true } // new: true devuelve el documento actualizado
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Preparar respuesta
    const responseData = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      description: updatedUser.description || null,
      avatar: updatedUser.avatar || null,
      updatedAt: updatedUser.updatedAt.toISOString()
    };
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: responseData
    });
    
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});
```

---

## ✅ Checklist de Verificación

### Schema de Base de Datos
- [ ] El campo `name` existe y está validado (max 100 caracteres)
- [ ] El campo `description` existe y es opcional (max 500 caracteres)
- [ ] El campo `avatar` existe y es opcional (puede ser URL o null)
- [ ] Los campos tienen los tipos correctos (`String` para todos)
- [ ] Los campos opcionales tienen `default: null`

### Endpoint PATCH /api/profile
- [ ] El endpoint actualiza el campo `name` correctamente
- [ ] El endpoint actualiza el campo `description` correctamente
- [ ] El endpoint actualiza el campo `avatar` correctamente (si viene archivo)
- [ ] El endpoint devuelve los campos actualizados en la respuesta
- [ ] El endpoint valida la longitud de `description` (max 500)
- [ ] El endpoint valida la longitud de `name` (max 100)
- [ ] El endpoint maneja archivos de avatar correctamente

### Respuesta del Endpoint
- [ ] La respuesta incluye `description` en el objeto `data`
- [ ] La respuesta incluye `avatar` en el objeto `data`
- [ ] La respuesta incluye `name` en el objeto `data`
- [ ] Los campos opcionales devuelven `null` si no tienen valor

### Endpoint GET /api/auth/me (o GET /api/profile)
- [ ] El endpoint devuelve `description` en el objeto user
- [ ] El endpoint devuelve `avatar` en el objeto user
- [ ] El endpoint devuelve `name` en el objeto user

---

## 🧪 Pruebas Recomendadas

### Test 1: Actualizar solo nombre
```bash
curl -X PATCH http://localhost:5000/api/profile \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo Nombre"}'
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "...",
    "name": "Nuevo Nombre",
    "email": "...",
    "description": null,
    "avatar": null,
    "updatedAt": "..."
  }
}
```

### Test 2: Actualizar descripción
```bash
curl -X PATCH http://localhost:5000/api/profile \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Esta es mi descripción"}'
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "description": "Esta es mi descripción",
    ...
  }
}
```

### Test 3: Actualizar avatar
```bash
curl -X PATCH http://localhost:5000/api/profile \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "avatar=@/ruta/a/imagen.jpg"
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "avatar": "/uploads/avatars/avatar-1234567890.jpg",
    ...
  }
}
```

### Test 4: Verificar persistencia
1. Actualizar perfil con los cambios
2. Cerrar sesión
3. Iniciar sesión nuevamente
4. Verificar que los cambios persisten en `/api/auth/me`

---

## 🚨 Problemas Comunes

### 1. Los cambios no se guardan
**Causa:** El campo no existe en el schema o no se está actualizando en el endpoint.
**Solución:** Verificar que el campo existe en el modelo y que el endpoint lo está actualizando.

### 2. `description` siempre es `null`
**Causa:** El endpoint no está procesando el campo `description` del body.
**Solución:** Verificar que `req.body.description` se esté leyendo correctamente.

### 3. `avatar` no se guarda
**Causa:** Falta configuración de multer o el archivo no se está procesando.
**Solución:** Verificar que multer esté configurado y que el campo en FormData sea `avatar`.

### 4. Errores de validación
**Causa:** Los límites de caracteres no coinciden entre frontend y backend.
**Solución:** Asegurar que las validaciones del backend coincidan con las del frontend:
- `name`: max 100 caracteres
- `description`: max 500 caracteres

---

## 📊 Estructura de Datos Esperada

### Documento Usuario en MongoDB

```javascript
{
  _id: ObjectId("..."),
  email: "usuario@ejemplo.com",
  password: "$2b$10$...", // Hasheado
  name: "Juan Pérez",
  description: "Soy un viajero apasionado", // ⚠️ NUEVO
  avatar: "/uploads/avatars/avatar-123456.jpg", // ⚠️ VERIFICAR
  role: "user",
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T11:30:00.000Z")
}
```

### Respuesta del Endpoint PATCH /api/profile

```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "description": "Soy un viajero apasionado",
    "avatar": "/uploads/avatars/avatar-123456.jpg",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

---

## 📝 Notas Importantes

1. **Campo `name` vs `firstName`/`lastName`**: El frontend usa un solo campo `name`. Si tu backend usa `firstName` y `lastName`, puedes combinarlos al actualizar:
   ```javascript
   if (req.body.name) {
     const nameParts = req.body.name.split(' ');
     updateData.firstName = nameParts[0];
     updateData.lastName = nameParts.slice(1).join(' ') || '';
   }
   ```

2. **Manejo de archivos**: Si usas un servicio de almacenamiento en la nube (AWS S3, Cloudinary, etc.), ajusta la lógica de guardado del avatar según tu configuración.

3. **Validaciones**: Asegúrate de que las validaciones del backend coincidan exactamente con las del frontend para evitar errores.

4. **Migración**: Ejecuta el script de migración solo una vez en producción. Asegúrate de hacer backup de la base de datos antes.

---

**Fecha:** 2024-01-15  
**Prioridad:** 🔴 **ALTA** - Los cambios de perfil no persisten sin estos campos  
**Estado:** ⏳ Pendiente de implementación en backend

