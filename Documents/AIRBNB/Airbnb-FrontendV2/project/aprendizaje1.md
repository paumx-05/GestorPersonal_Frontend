# 📚 **Guía de Aprendizaje: Conceptos Esenciales de Programación Web**

## **🎯 Objetivo de esta Guía**
Esta guía te enseñará los 4 conceptos más importantes de programación web, desde lo más básico hasta lo más avanzado, usando ejemplos reales del proyecto Airbnb que estamos desarrollando.

---

## **🎯 Concepto 1: Estructura de Archivos y Carpetas** ⭐ (FÁCIL)

### **¿Qué aprenderás?**
- Cómo se organizan los archivos en un proyecto web
- Qué significa cada carpeta (`app/`, `components/`, `lib/`)
- Cómo los archivos se conectan entre sí

### **📁 Estructura de la Carpeta `app/`**
```
app/
├── layout.tsx          ← El "esqueleto" de toda la aplicación
├── page.tsx            ← La página principal (home)
├── globals.css         ← Los estilos globales
├── login/
│   └── page.tsx        ← Página de login (/login)
├── about/
│   └── page.tsx        ← Página sobre nosotros (/about)
├── profile/
│   └── page.tsx        ← Página de perfil (/profile)
└── detail/
    └── [id]/
        └── page.tsx    ← Página dinámica (/detail/madrid-1)
```

### **🔍 Archivos Clave a Estudiar:**

#### **1. `app/layout.tsx` - El Esqueleto de la App**
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotificationsProvider>
            <SearchProvider>
              {children}  ← Aquí se renderizan todas las páginas
            </SearchProvider>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**¿Qué hace?**
- Envuelve TODAS las páginas de la aplicación
- Define la estructura HTML básica (`<html>`, `<body>`)
- Proporciona contextos globales (autenticación, notificaciones, búsqueda)

#### **2. `app/page.tsx` - La Página Principal**
```typescript
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <OfferTopBar />
      <Header />
      <section className="bg-gradient-to-r from-red-500 to-red-600">
        <AirbnbSearchModule />
      </section>
      <AirbnbResults />
    </main>
  );
}
```

**¿Qué hace?**
- Define la página principal (URL: `/`)
- Combina múltiples componentes para crear la página completa
- Cada componente tiene una responsabilidad específica

#### **3. `app/globals.css` - Estilos Globales**
```css
:root {
  --airbnb-rausch: #FF385C;
  --airbnb-babu: #00A699;
}

body {
  @apply bg-slate-800 text-slate-400 font-jost;
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 50%, #2d3748 100%);
}
```

**¿Qué hace?**
- Define variables de color para toda la aplicación
- Establece estilos base para el cuerpo de la página
- Afecta a TODAS las páginas de la aplicación

### **✅ Preguntas de Comprensión:**
1. ¿Entiendes por qué `layout.tsx` envuelve todas las páginas?
2. ¿Puedes explicar qué hace `page.tsx` en la carpeta `app/`?
3. ¿Sabes por qué `globals.css` afecta a toda la aplicación?

---

## **🎯 Concepto 2: Componentes y Reutilización** ⭐⭐ (INTERMEDIO)

### **¿Qué aprenderás?**
- Qué es un componente (como piezas de LEGO)
- Cómo crear componentes reutilizables
- Cómo pasar información entre componentes

### **🧩 ¿Qué es un Componente?**
Un componente es como una pieza de LEGO que puedes usar una y otra vez. Cada componente tiene:
- **Props**: Información que recibe desde afuera
- **Estado**: Información interna que puede cambiar
- **Render**: Cómo se ve en pantalla

### **🔍 Archivos Clave a Estudiar:**

#### **1. `app/login/page.tsx` - Página como Componente**
```typescript
export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Lógica del componente
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Render del componente
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-md w-full">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
```

**¿Qué hace?**
- Es un componente completo que representa una página
- Usa otros componentes más pequeños (`LoginForm`)
- Tiene lógica específica (redirección si ya está autenticado)

#### **2. `app/about/page.tsx` - Componente Complejo**
```typescript
export default function AboutPage() {
  const stats = [
    { number: '4M+', label: 'Huéspedes felices' },
    { number: '220+', label: 'Países y regiones' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <section className="py-20">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-[#FF385C]">
                {stat.number}
              </div>
              <div className="text-slate-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

**¿Qué hace?**
- Organiza información en secciones lógicas
- Usa datos estáticos (array `stats`)
- Renderiza elementos dinámicamente con `.map()`

#### **3. `app/profile/page.tsx` - Componente con Estado**
```typescript
export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Estado del componente
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Render condicional
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{user.name}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
```

**¿Qué hace?**
- Maneja el estado de autenticación
- Renderiza contenido diferente según el estado
- Protege la página (solo usuarios autenticados)

### **✅ Preguntas de Comprensión:**
1. ¿Puedes identificar qué partes de `login/page.tsx` podrían ser componentes separados?
2. ¿Entiendes cómo `about/page.tsx` organiza la información en secciones?
3. ¿Sabes por qué `profile/page.tsx` tiene lógica especial para usuarios autenticados?

---

## **🎯 Concepto 3: Rutas Dinámicas y Navegación** ⭐⭐⭐ (INTERMEDIO-AVANZADO)

### **¿Qué aprenderás?**
- Cómo crear páginas que cambian según la URL
- Qué son las rutas dinámicas `[id]`
- Cómo funciona la navegación entre páginas

### **🛣️ ¿Qué son las Rutas Dinámicas?**
Las rutas dinámicas permiten crear páginas que cambian según la URL. Por ejemplo:
- `/detail/madrid-1` → Muestra detalles de la propiedad "madrid-1"
- `/detail/barcelona-1` → Muestra detalles de la propiedad "barcelona-1"
- `/detail/valencia-1` → Muestra detalles de la propiedad "valencia-1"

### **🔍 Archivos Clave a Estudiar:**

#### **1. `app/detail/[id]/page.tsx` - Ruta Dinámica**
```typescript
// Interfaz para las props de la página
interface PropertyPageProps {
  params: {
    id: string;  ← El ID viene de la URL
  };
}

// Función especial para generar rutas estáticas
export async function generateStaticParams() {
  return mockProperties.map((property) => ({
    id: property.id,  ← Genera: madrid-1, barcelona-1, etc.
  }));
}

// Componente de la página
const PropertyPage = ({ params }: PropertyPageProps) => {
  return (
    <div className="property-page min-h-screen bg-gray-50">
      <PropertyDetail propertyId={params.id} />
    </div>
  );
};
```

**¿Qué hace?**
- `[id]` en el nombre de la carpeta significa "parámetro dinámico"
- `generateStaticParams()` le dice a Next.js qué páginas generar
- `params.id` contiene el valor de la URL

#### **2. Navegación entre Páginas**
```typescript
// En un componente
const router = useRouter();

const handleCardClick = () => {
  router.push(`/detail/${property.id}`);  ← Navega a la página de detalle
};
```

**¿Qué hace?**
- `useRouter()` permite navegar entre páginas
- `router.push()` cambia la URL y carga la nueva página
- La URL cambia a `/detail/madrid-1` por ejemplo

### **✅ Preguntas de Comprensión:**
1. ¿Entiendes por qué `[id]` está entre corchetes en la carpeta?
2. ¿Puedes explicar qué hace `generateStaticParams()`?
3. ¿Sabes cómo el `id` llega desde la URL hasta el componente?

---

## **🎯 Concepto 4: Estado Global y Contexto** ⭐⭐⭐⭐ (AVANZADO)

### **¿Qué aprenderás?**
- Cómo compartir información entre componentes
- Qué es el contexto de React
- Cómo manejar el estado de autenticación globalmente

### **🌐 ¿Qué es el Estado Global?**
El estado global es información que necesita estar disponible en múltiples componentes sin tener que pasarla manualmente entre cada uno.

### **🔍 Archivos Clave a Estudiar:**

#### **1. `app/layout.tsx` - Proveedores de Contexto**
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>           ← Proporciona estado de autenticación
          <NotificationsProvider> ← Proporciona estado de notificaciones
            <SearchProvider>      ← Proporciona estado de búsqueda
              {children}          ← Todas las páginas tienen acceso
            </SearchProvider>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**¿Qué hace?**
- Envuelve toda la aplicación con proveedores de contexto
- Cada proveedor hace disponible su estado a todos los componentes hijos
- Los componentes pueden acceder al estado sin pasarlo manualmente

#### **2. Uso del Contexto en Componentes**
```typescript
// En cualquier componente
const { user, isAuthenticated, logout } = useAuth();
const { notifications } = useNotifications();
const { searchData, performSearch } = useSearch();
```

**¿Qué hace?**
- `useAuth()` accede al estado de autenticación
- `useNotifications()` accede al estado de notificaciones
- `useSearch()` accede al estado de búsqueda
- No necesitas pasar estos datos como props

#### **3. Ejemplo Práctico - Página de Perfil**
```typescript
export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();  ← Accede al contexto
  
  useEffect(() => {
    if (!isAuthenticated) {  ← Usa el estado global
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;  ← Renderiza según el estado global
  }

  return (
    <div>
      <h1>{user.name}</h1>  ← Muestra datos del estado global
    </div>
  );
}
```

### **✅ Preguntas de Comprensión:**
1. ¿Entiendes por qué `AuthProvider` envuelve toda la aplicación?
2. ¿Puedes explicar cómo un componente hijo accede al contexto?
3. ¿Sabes por qué necesitamos múltiples proveedores de contexto?

---

## **📋 Lista de Tareas de Aprendizaje**

### **✅ Fase 1: Fundamentos**
- [ ] **Tarea 1.1**: Crear una nueva página simple en `app/mi-pagina/page.tsx`
- [ ] **Tarea 1.2**: Modificar `globals.css` para cambiar el color de fondo
- [ ] **Tarea 1.3**: Entender la diferencia entre `layout.tsx` y `page.tsx`

### **✅ Fase 2: Componentes**
- [ ] **Tarea 2.1**: Extraer una sección de `about/page.tsx` como componente separado
- [ ] **Tarea 2.2**: Crear un componente de botón reutilizable
- [ ] **Tarea 2.3**: Entender cómo pasar datos entre componentes

### **✅ Fase 3: Rutas**
- [ ] **Tarea 3.1**: Crear una nueva ruta dinámica `app/producto/[slug]/page.tsx`
- [ ] **Tarea 3.2**: Implementar `generateStaticParams()` para tu nueva ruta
- [ ] **Tarea 3.3**: Entender cómo navegar entre páginas

### **✅ Fase 4: Estado Global**
- [ ] **Tarea 4.1**: Crear un contexto simple para compartir datos
- [ ] **Tarea 4.2**: Usar el contexto en múltiples componentes
- [ ] **Tarea 4.3**: Entender el flujo de datos en la aplicación

---

## **🎯 Resumen de Conceptos**

| Concepto | Dificultad | ¿Qué Aprenderás? | Archivo Principal |
|----------|------------|------------------|-------------------|
| **Estructura** | ⭐ Fácil | Organización de archivos | `layout.tsx` |
| **Componentes** | ⭐⭐ Intermedio | Reutilización de código | `login/page.tsx` |
| **Rutas** | ⭐⭐⭐ Avanzado | Navegación dinámica | `detail/[id]/page.tsx` |
| **Estado Global** | ⭐⭐⭐⭐ Experto | Compartir datos globalmente | `layout.tsx` |

---

## **🚀 Próximos Pasos**

1. **Lee este documento completo**
2. **Elige un concepto para empezar**
3. **Responde las preguntas de comprensión**
4. **Completa las tareas de aprendizaje**
5. **Pregúntame cualquier duda**

---

## **💡 Consejos de Aprendizaje**

- **No te preocupes si no entiendes todo de inmediato**
- **Practica modificando el código existente**
- **Haz preguntas específicas cuando tengas dudas**
- **Empieza por lo más fácil y ve avanzando gradualmente**

---

**¡Recuerda: La programación es como aprender un nuevo idioma. Con práctica y paciencia, ¡lo dominarás! 🎉**
