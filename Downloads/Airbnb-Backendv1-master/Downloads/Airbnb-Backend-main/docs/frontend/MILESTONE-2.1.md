# MILESTONE 2.1 - Refactorización del Header: Componente Único

## 📋 Objetivo
Eliminar la repetición de código en el apartado header creando un componente único y reutilizable que mantenga toda la funcionalidad existente mientras mejora la mantenibilidad del código.

## 🔍 Análisis del Problema Actual

### Código Repetido Identificado:
1. **Logo SVG de Airbnb** se repite en:
   - `components/Header.tsx` (líneas 26-34)
   - `app/login/page.tsx` (líneas 46-54)
   - `app/register/page.tsx` (líneas 46-54)

2. **Botón "Volver al inicio"** se repite en:
   - `app/login/page.tsx` (líneas 82-88)
   - `app/register/page.tsx` (líneas 89-95)
   - `app/profile/page.tsx` (líneas 75-81)

3. **Estructura del header** varía entre páginas:
   - **Página principal**: Header completo con búsqueda, menú usuario, carrito
   - **Páginas de auth**: Logo centrado + título + subtítulo
   - **Página de perfil**: Header simple con botón back + título

## 🎯 TO-DO List: Primeros 5 Pasos para la Solución

### **Paso 1: Crear componente Logo reutilizable**
- ✅ **Estado**: Pendiente
- **Archivo**: `components/ui/Logo.tsx`
- **Funcionalidad**:
  - Extraer el SVG del logo que se repite en múltiples archivos
  - Props para tamaño personalizable (`sm`, `md`, `lg`)
  - Props para href opcional (Link wrapper)
  - Props para className personalizable
- **Impacto**: Elimina duplicación en 3 archivos

### **Paso 2: Crear componente BackButton reutilizable**
- ✅ **Estado**: Pendiente
- **Archivo**: `components/ui/BackButton.tsx`
- **Funcionalidad**:
  - Botón con icono ArrowLeft y texto personalizable
  - Props para destino (href) y texto
  - Props para onClick personalizable
  - Estilos consistentes con el diseño actual
- **Impacto**: Elimina duplicación en 3 archivos

### **Paso 3: Crear componente PageHeader flexible**
- ✅ **Estado**: Pendiente
- **Archivo**: `components/layout/PageHeader.tsx`
- **Funcionalidad**:
  - Sistema de variantes: `main`, `auth`, `profile`, `simple`
  - Auto-detección de variante basada en pathname
  - Props condicionales según la variante
  - Mantiene toda la funcionalidad del Header actual
- **Variantes**:
  - **main**: Header completo (búsqueda, menú usuario, carrito)
  - **auth**: Logo + título + subtítulo centrados
  - **profile**: Header con botón back + título
  - **simple**: Header básico para otras páginas

### **Paso 4: Implementar sistema de layout condicional**
- ✅ **Estado**: Pendiente
- **Archivo**: `app/layout.tsx` (modificación)
- **Funcionalidad**:
  - Integrar PageHeader en el layout principal
  - Lógica para detectar tipo de página actual
  - Usar `usePathname()` para configuración automática
  - Mantener compatibilidad con todas las rutas existentes

### **Paso 5: Refactorizar páginas existentes**
- ✅ **Estado**: Pendiente
- **Archivos a modificar**:
  - `app/page.tsx` → usar PageHeader variante "main"
  - `app/login/page.tsx` → usar PageHeader variante "auth"
  - `app/register/page.tsx` → usar PageHeader variante "auth"
  - `app/profile/page.tsx` → usar PageHeader variante "profile"
  - `app/forgot-password/page.tsx` → usar PageHeader variante "auth"
- **Funcionalidad**:
  - Reemplazar código duplicado con componentes reutilizables
  - Mantener toda la funcionalidad existente
  - Verificar que no se rompa ninguna característica

## 📁 Estructura de Archivos Propuesta

```
components/
├── ui/
│   ├── Logo.tsx              # ✅ Componente logo reutilizable
│   └── BackButton.tsx        # ✅ Componente botón back reutilizable
├── layout/
│   └── PageHeader.tsx        # ✅ Header flexible con variantes
└── Header.tsx                # ❌ Será reemplazado por PageHeader
```

## 🔧 Especificaciones Técnicas

### Logo Component Interface
```typescript
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}
```

### BackButton Component Interface
```typescript
interface BackButtonProps {
  href?: string;
  text?: string;
  className?: string;
  onClick?: () => void;
}
```

### PageHeader Component Interface
```typescript
interface PageHeaderProps {
  variant?: 'main' | 'auth' | 'profile' | 'simple';
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}
```

## 🎨 Diseño y UX

### Principios de Diseño:
- **Consistencia**: Mismo logo y estilos en todas las páginas
- **Flexibilidad**: Componente adaptable a diferentes contextos
- **Mantenibilidad**: Un solo lugar para cambios de header
- **Performance**: Componentes optimizados y reutilizables

### Estados y Comportamientos:
- **Autenticado**: Mostrar UserMenu y carrito
- **No autenticado**: Mostrar botones Login/Register
- **Mobile**: Menú hamburguesa responsive
- **Hover states**: Transiciones suaves en todos los elementos

## ✅ Criterios de Éxito

### Funcionalidad:
- [ ] Logo aparece consistente en todas las páginas
- [ ] Botón back funciona correctamente en páginas que lo requieren
- [ ] Header principal mantiene toda su funcionalidad (búsqueda, menú, etc.)
- [ ] Páginas de auth muestran logo + título correctamente
- [ ] Página de perfil muestra header con botón back
- [ ] Responsive design funciona en todos los breakpoints

### Código:
- [ ] Eliminación completa del código duplicado
- [ ] Componentes reutilizables bien documentados
- [ ] Props interfaces bien definidas
- [ ] TypeScript sin errores
- [ ] Mantiene compatibilidad con AuthContext

### Testing:
- [ ] Navegación entre páginas funciona correctamente
- [ ] Estados de autenticación se reflejan correctamente
- [ ] No hay regresiones en funcionalidad existente

## 🚀 Beneficios Esperados

### Para Desarrollo:
- **-60% código duplicado** en headers
- **Mantenimiento centralizado** de estilos y funcionalidad
- **Consistencia automática** en toda la aplicación
- **Facilidad para agregar nuevas páginas** con header apropiado

### Para Usuario:
- **Experiencia consistente** en toda la aplicación
- **Navegación intuitiva** con elementos familiares
- **Performance mejorada** por reutilización de componentes

## 📝 Notas de Implementación

### Orden de Implementación:
1. Crear componentes base (Logo, BackButton)
2. Crear PageHeader con todas las variantes
3. Probar PageHeader en una página de prueba
4. Refactorizar páginas existentes una por una
5. Eliminar código duplicado y Header.tsx original

### Consideraciones Especiales:
- Mantener compatibilidad con `useAuth()` hook
- Preservar todos los estilos Tailwind existentes
- Asegurar que UserMenu siga funcionando correctamente
- Verificar que el carrito (ShoppingCart) aparezca solo cuando corresponde

### Pruebas Requeridas:
- Navegación entre todas las páginas
- Login/logout flow completo
- Responsive design en móvil y desktop
- Estados de hover y transiciones

---

**📅 Fecha de Creación**: $(date)  
**👨‍💻 Desarrollador**: Claude Assistant  
**🎯 Milestone**: 2.1 - Header Refactorization  
**⏱️ Tiempo Estimado**: 2-3 horas de desarrollo  
**🔄 Estado**: Documentación creada, implementación pendiente
