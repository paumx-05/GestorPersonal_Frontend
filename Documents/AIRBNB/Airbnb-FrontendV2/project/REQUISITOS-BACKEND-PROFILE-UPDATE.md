# Requisitos del Backend para Actualización de Perfil de Usuario

## 📋 Resumen

El frontend necesita una ruta unificada para actualizar el perfil del usuario autenticado que permita modificar:
- **Nombre** (`name`)
- **Descripción/Bio** (`description`) - nuevo campo
- **Avatar/Foto de perfil** (`avatar`)

**Recomendación técnica**: Una sola ruta `PATCH /api/profile` o `PATCH /api/users/me` es más eficiente y mantiene el código simple y escalable.

---

## 🎯 Endpoint Recomendado

### `PATCH /api/profile` (o `PATCH /api/users/me`)

**Razón**: 
- Un solo endpoint evita duplicación de código
- El usuario autenticado siempre modifica su propio perfil (se obtiene del JWT)
- Más fácil de mantener y extender en el futuro
- Sigue el principio REST de recursos anidados bajo `/profile`

---

## 📝 Especificación Técnica

### Autenticación

**Requerido**: Bearer Token JWT en el header `Authorization`

```
Authorization: Bearer <jwt-token>
```

El `userId` se obtiene del token JWT decodificado. El usuario solo puede modificar su propio perfil.

---

## 🔄 Request Body

### Opción 1: JSON (para name y description)

**Content-Type**: `application/json`

```json
{
  "name": "Juan Pérez",
  "description": "Amante de los viajes y la aventura. Me encanta conocer nuevos lugares y compartir experiencias únicas."
}
```

**Campos**:
- `name` (string, opcional): Nombre completo del usuario. Máximo 100 caracteres.
- `description` (string, opcional): Descripción breve del perfil. Máximo 500 caracteres.

### Opción 2: FormData (para avatar o todos los campos)

**Content-Type**: `multipart/form-data`

```javascript
FormData {
  name: "Juan Pérez",
  description: "Amante de los viajes...",
  avatar: File // archivo de imagen
}
```

**Campos**:
- `name` (string, opcional): Nombre completo del usuario. Máximo 100 caracteres.
- `description` (string, opcional): Descripción breve. Máximo 500 caracteres.
- `avatar` (File, opcional): Archivo de imagen. Formatos: JPG, PNG, WebP. Tamaño máximo: 5MB.

---

## ✅ Validaciones

### Name
- Tipo: `string`
- Longitud: 1-100 caracteres
- Requerido si se envía, debe tener contenido (no solo espacios)
- Trim: eliminar espacios al inicio y final

### Description
- Tipo: `string`
- Longitud: 0-500 caracteres (puede estar vacío para eliminar descripción)
- Opcional: puede ser `null` o cadena vacía
- Trim: eliminar espacios al inicio y final

### Avatar
- Tipo: `File` (multipart/form-data) o `string` (URL base64)
- Formatos permitidos: `image/jpeg`, `image/png`, `image/webp`
- Tamaño máximo: **5MB** (5,242,880 bytes)
- Dimensiones recomendadas: máximo 2000x2000px
- Si es base64: debe comenzar con `data:image/...`

---

## 📤 Response

### Éxito (200 OK)

```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "description": "Amante de los viajes y la aventura...",
    "avatar": "https://storage.example.com/avatars/user-123.jpg",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error - Campos Inválidos (400 Bad Request)

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "name",
      "message": "El nombre debe tener entre 1 y 100 caracteres"
    },
    {
      "field": "description",
      "message": "La descripción no puede exceder 500 caracteres"
    },
    {
      "field": "avatar",
      "message": "El archivo excede el tamaño máximo de 5MB"
    }
  ]
}
```

### Error - No Autenticado (401 Unauthorized)

```json
{
  "success": false,
  "message": "Token de autorización inválido o expirado"
}
```

### Error - Usuario No Encontrado (404 Not Found)

```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### Error - Servidor (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

---

## 🗄️ Modelo de Base de Datos (MongoDB)

### Actualización del Schema de Usuario

El modelo debe incluir los siguientes campos:

```javascript
{
  _id: ObjectId,
  email: String,           // requerido, único
  name: String,            // requerido, máx 100 chars
  password: String,        // hasheado
  description: String,     // opcional, máx 500 chars
  avatar: String,          // opcional, URL de la imagen
  role: String,            // 'admin' | 'user'
  createdAt: Date,
  updatedAt: Date,
  // ... otros campos existentes
}
```

**Nota**: El campo `description` es nuevo y debe agregarse al schema si no existe.

---

## 🔧 Implementación Recomendada (Pseudocódigo)

```javascript
// PATCH /api/profile
async function updateProfile(req, res) {
  try {
    // 1. Verificar autenticación
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    // 2. Obtener usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // 3. Determinar tipo de contenido (JSON o FormData)
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    
    let updateData = {};
    const errors = [];

    // 4. Procesar name (si viene en request)
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

    // 5. Procesar description (si viene en request)
    if (req.body.description !== undefined) {
      const description = req.body.description?.trim() || null;
      if (description === null || (description.length >= 0 && description.length <= 500)) {
        updateData.description = description || null;
      } else {
        errors.push({
          field: 'description',
          message: 'La descripción no puede exceder 500 caracteres'
        });
      }
    }

    // 6. Procesar avatar (si viene en request)
    if (req.file || req.body.avatar) {
      // Validar archivo
      const file = req.file || req.body.avatar;
      
      // Validar tipo MIME
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        errors.push({
          field: 'avatar',
          message: 'Formato de imagen no válido. Use JPG, PNG o WebP'
        });
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        errors.push({
          field: 'avatar',
          message: 'El archivo excede el tamaño máximo de 5MB'
        });
      }

      if (errors.length === 0) {
        // Subir imagen a storage (S3, Cloudinary, etc.)
        const avatarUrl = await uploadImageToStorage(file);
        updateData.avatar = avatarUrl;
        
        // Opcional: eliminar avatar anterior si existe
        if (user.avatar) {
          await deleteImageFromStorage(user.avatar);
        }
      }
    }

    // 7. Si hay errores, retornarlos
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    // 8. Actualizar usuario
    updateData.updatedAt = new Date();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // 9. Retornar respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        description: updatedUser.description,
        avatar: updatedUser.avatar,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
```

---

## 🔐 Middleware de Autenticación

Asegúrate de tener un middleware que valide el JWT:

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autorización requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    req.userId = decoded.userId || decoded.id;
    next();
  });
}
```

---

## 📦 Almacenamiento de Imágenes

### Opciones Recomendadas:

1. **Cloudinary** (recomendado para desarrollo rápido)
   - CDN automático
   - Optimización de imágenes
   - Transformaciones on-the-fly

2. **AWS S3** (producción)
   - Escalable y confiable
   - Requiere más configuración

3. **MongoDB GridFS** (solo si es necesario)
   - Solo para archivos pequeños
   - No recomendado para producción

### Ejemplo con Cloudinary:

```javascript
const cloudinary = require('cloudinary').v2;

async function uploadImageToStorage(file) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'avatars',
    width: 400,
    height: 400,
    crop: 'limit',
    format: 'webp'
  });
  return result.secure_url;
}
```

---

## 🧪 Casos de Prueba Sugeridos

1. ✅ Actualizar solo nombre
2. ✅ Actualizar solo descripción
3. ✅ Actualizar solo avatar
4. ✅ Actualizar nombre + descripción
5. ✅ Actualizar todos los campos (name + description + avatar)
6. ❌ Nombre vacío (debe fallar)
7. ❌ Nombre > 100 caracteres (debe fallar)
8. ❌ Descripción > 500 caracteres (debe fallar)
9. ❌ Avatar > 5MB (debe fallar)
10. ❌ Avatar formato inválido (debe fallar)
11. ❌ Sin token de autenticación (debe fallar)
12. ❌ Token inválido (debe fallar)

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Actualización exitosa |
| 400 | Bad Request | Error de validación |
| 401 | Unauthorized | Token inválido o faltante |
| 404 | Not Found | Usuario no encontrado |
| 413 | Payload Too Large | Archivo demasiado grande |
| 500 | Internal Server Error | Error del servidor |

---

## 🚀 Consideraciones de Performance

1. **Compresión de imágenes**: Redimensionar y optimizar avatares antes de guardar
2. **Cache**: Considerar cachear URLs de avatares
3. **Límites de rate**: Implementar rate limiting para evitar abusos
4. **Validación temprana**: Validar tamaño de archivo antes de subirlo completamente

---

## 📝 Notas para el Frontend

- El frontend enviará los campos que desea actualizar (no todos son requeridos)
- Para el avatar, el frontend puede enviar:
  - FormData con archivo (recomendado)
  - Base64 string (alternativa, menos eficiente)
- El campo `description` puede ser `null` o cadena vacía para eliminar la descripción
- El frontend debe manejar errores de validación y mostrar mensajes específicos por campo

---

## ✅ Checklist de Implementación

- [ ] Crear endpoint `PATCH /api/profile`
- [ ] Agregar campo `description` al schema de Usuario en MongoDB
- [ ] Implementar validación de campos (name, description, avatar)
- [ ] Configurar middleware de autenticación JWT
- [ ] Configurar almacenamiento de imágenes (Cloudinary/S3)
- [ ] Implementar lógica de actualización parcial (solo campos enviados)
- [ ] Agregar manejo de errores con mensajes específicos
- [ ] Actualizar timestamp `updatedAt` automáticamente
- [ ] Eliminar avatar anterior cuando se sube uno nuevo
- [ ] Probar casos de error y éxito
- [ ] Documentar en Postman/Swagger

---

## 📚 Referencias

- Estructura similar a: `PUT /api/users/:id` pero para usuario autenticado
- Seguir convenciones REST existentes en el proyecto
- Mantener consistencia con otros endpoints del backend

---

**Última actualización**: 2024-01-15  
**Versión**: 1.0

