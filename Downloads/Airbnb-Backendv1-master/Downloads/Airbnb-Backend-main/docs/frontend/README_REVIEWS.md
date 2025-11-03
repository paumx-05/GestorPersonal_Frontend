# 📘 Documentación de Reviews API - Frontend

Esta carpeta contiene toda la documentación y ejemplos necesarios para integrar la API de Reviews en el frontend.

## 📁 Archivos Disponibles

### 1. **FRONTEND_REVIEWS_API.md** (Principal)
📖 **Documentación completa y detallada**
- Descripción de todos los endpoints
- Formatos de request/response exactos
- Ejemplos de uso completos
- Manejo de errores
- Validaciones
- Casos de uso comunes

👉 **Empieza aquí para entender toda la API**

---

### 2. **reviews-api-example.js**
🔧 **Funciones helper listas para usar**
- Funciones JavaScript/TypeScript listas para copiar
- Validaciones incluidas
- Manejo de errores
- Funciones utilitarias (formateo de fechas, ratings, etc.)

👉 **Copia estas funciones a tu proyecto**

---

### 3. **react-reviews-example.tsx**
⚛️ **Componentes React completos**
- Componentes listos para usar con React
- TypeScript incluido
- Ejemplos de formularios, listas, paginación
- Manejo de estado

👉 **Usa estos componentes como base para React**

---

### 4. **REVIEWS_QUICK_REFERENCE.md**
⚡ **Referencia rápida**
- Endpoints principales
- Ejemplos básicos
- Validaciones rápidas

👉 **Consulta rápida durante el desarrollo**

---

## 🚀 Inicio Rápido

### Paso 1: Lee la documentación completa
```bash
docs/FRONTEND_REVIEWS_API.md
```

### Paso 2: Copia las funciones helper
```bash
docs/frontend/reviews-api-example.js
```

### Paso 3: Adapta según tu framework
- **React:** Usa `react-reviews-example.tsx`
- **Vue/Angular:** Adapta los ejemplos de JavaScript
- **Vanilla JS:** Usa directamente `reviews-api-example.js`

### Paso 4: Consulta rápida
```bash
docs/frontend/REVIEWS_QUICK_REFERENCE.md
```

---

## 📋 Endpoints Disponibles

### Públicos (No requieren autenticación)
- `GET /api/reviews?propertyId={id}&page={page}&limit={limit}&sort={sort}`
- `GET /api/reviews/property/{id}?page={page}&limit={limit}&sort={sort}`
- `GET /api/reviews/property/{id}/stats`

### Protegidos (Requieren autenticación)
- `POST /api/reviews` - Crear review
- `PUT /api/reviews/{id}` - Actualizar review
- `DELETE /api/reviews/{id}` - Eliminar review
- `GET /api/reviews/user/{id}` - Reviews de usuario

---

## ✅ Checklist de Implementación

- [ ] Leer documentación completa
- [ ] Configurar función `getAuthToken()` en helpers
- [ ] Implementar obtención de reviews
- [ ] Implementar creación de reviews
- [ ] Implementar actualización de reviews
- [ ] Implementar eliminación de reviews
- [ ] Agregar paginación
- [ ] Agregar ordenamiento
- [ ] Mostrar estadísticas
- [ ] Manejar errores correctamente
- [ ] Validar datos antes de enviar

---

## 💡 Tips

1. **Autenticación:** Asegúrate de incluir el token JWT en el header `Authorization: Bearer <token>` para endpoints protegidos.

2. **Validaciones:** Valida los datos en el frontend antes de enviar al backend para mejor UX.

3. **Paginación:** Usa los valores `total`, `page`, `limit` para implementar paginación correcta.

4. **Ordenamiento:** El valor por defecto es `newest`, pero puedes usar `oldest`, `highest`, `lowest`.

5. **Comentarios:** Son opcionales, pero si se proporcionan, deben tener entre 10-1000 caracteres.

---

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que el token JWT esté incluido en los headers
2. Verifica que los datos cumplan las validaciones
3. Revisa los códigos de error HTTP en la documentación
4. Consulta los ejemplos de código

---

## 📞 Contacto

Para más información sobre la API, consulta la documentación general del backend.

