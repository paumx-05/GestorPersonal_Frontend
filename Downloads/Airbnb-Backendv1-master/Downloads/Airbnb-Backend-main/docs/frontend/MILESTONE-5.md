# MILESTONE-5: Módulo de Detalle de Propiedades Airbnb

## Objetivo
Crear un módulo completo de detalle de propiedades que muestre toda la información disponible de un alojamiento específico cuando el usuario hace clic en una propiedad desde los resultados de búsqueda. El módulo debe incluir galería de imágenes, información del host, amenidades, fechas disponibles y funcionalidad de reserva.

## Pasos a Seguir

### ✅ Paso 1: Crear Componente Principal de Detalle de Propiedad
- [ ] Crear `components/PropertyDetail.tsx` como componente principal
- [ ] Implementar estructura básica con header, galería, información y sidebar de reserva
- [ ] Añadir props para recibir el ID de la propiedad desde la navegación
- [ ] Crear función para obtener datos de la propiedad por ID desde mockData
- [ ] Implementar estado de carga mientras se obtienen los datos

```tsx
// Estructura básica del componente de detalle
interface PropertyDetailProps {
  propertyId: string;
}

const PropertyDetail = ({ propertyId }: PropertyDetailProps) => {
  const [property, setProperty] = useState<AirbnbProperty | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Función para obtener datos de la propiedad por ID
  const getPropertyById = (id: string) => {
    return mockProperties.find(prop => prop.id === id);
  };
  
  useEffect(() => {
    const propertyData = getPropertyById(propertyId);
    setProperty(propertyData || null);
    setLoading(false);
  }, [propertyId]);
  
  if (loading) return <div>Cargando detalles...</div>;
  if (!property) return <div>Propiedad no encontrada</div>;
  
  return (
    <div className="property-detail-container">
      {/* Header con título y ubicación */}
      {/* Galería de imágenes */}
      {/* Información principal */}
      {/* Sidebar de reserva */}
    </div>
  );
};
```

### ✅ Paso 2: Implementar Galería de Imágenes y Header
- [ ] Crear componente `components/PropertyGallery.tsx` para mostrar imágenes
- [ ] Implementar imagen principal grande con thumbnails pequeños
- [ ] Añadir funcionalidad de navegación entre imágenes (anterior/siguiente)
- [ ] Crear header con título, ubicación, rating y número de reseñas
- [ ] Incluir botón de favoritos y compartir
- [ ] Añadir indicador de tipo de propiedad (Casa completa, Habitación privada, etc.)

```tsx
// Componente de galería de imágenes
const PropertyGallery = ({ images, title }: { images: string[], title: string }) => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <div className="property-gallery">
      <div className="main-image">
        <img src={images[currentImage]} alt={title} />
        <button onClick={prevImage}>‹</button>
        <button onClick={nextImage}>›</button>
      </div>
      <div className="thumbnails">
        {images.map((img, index) => (
          <img 
            key={index}
            src={img} 
            alt={`${title} ${index + 1}`}
            className={index === currentImage ? 'active' : ''}
            onClick={() => setCurrentImage(index)}
          />
        ))}
      </div>
    </div>
  );
};
```

### ✅ Paso 3: Crear Sección de Información del Host y Descripción
- [ ] Crear componente `components/HostInfo.tsx` para mostrar información del anfitrión
- [ ] Mostrar avatar, nombre, badge de Superhost si aplica
- [ ] Añadir sección de descripción detallada de la propiedad
- [ ] Incluir información sobre el barrio y ubicación específica
- [ ] Crear sección de amenidades con iconos y descripciones
- [ ] Añadir información sobre políticas de cancelación y reglas de la casa

```tsx
// Componente de información del host
const HostInfo = ({ host, description }: { host: Host, description: string }) => {
  return (
    <div className="host-info-section">
      <div className="host-card">
        <img src={host.avatar} alt={host.name} className="host-avatar" />
        <div className="host-details">
          <h3>Anfitrión: {host.name}</h3>
          {host.isSuperhost && <span className="superhost-badge">⭐ Superhost</span>}
        </div>
      </div>
      <div className="property-description">
        <h3>Acerca de este lugar</h3>
        <p>{description}</p>
      </div>
      <div className="amenities-section">
        <h3>¿Qué incluye este lugar?</h3>
        {/* Lista de amenidades con iconos */}
      </div>
    </div>
  );
};
```

### ✅ Paso 4: Implementar Sidebar de Reserva y Disponibilidad
- [ ] Crear componente `components/ReservationSidebar.tsx` para el panel de reserva
- [ ] Implementar selector de fechas de check-in y check-out
- [ ] Añadir selector de número de huéspedes con validación de máximo
- [ ] Mostrar precio por noche y cálculo de total con impuestos
- [ ] Incluir botón de "Reservar" con estado de disponibilidad
- [ ] Añadir información de políticas de cancelación y depósito de seguridad

```tsx
// Componente de sidebar de reserva
const ReservationSidebar = ({ property }: { property: AirbnbProperty }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  
  // Calcular precio total basado en fechas y huéspedes
  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return nights * property.pricePerNight;
  };
  
  return (
    <div className="reservation-sidebar">
      <div className="price-section">
        <span className="price-per-night">€{property.pricePerNight} por noche</span>
        <div className="rating-section">
          <span className="rating">⭐ {property.rating}</span>
          <span className="reviews">({property.reviewCount} reseñas)</span>
        </div>
      </div>
      
      <div className="date-selectors">
        <div className="check-in">
          <label>Check-in</label>
          <input 
            type="date" 
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div className="check-out">
          <label>Check-out</label>
          <input 
            type="date" 
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>
      
      <div className="guests-selector">
        <label>Huéspedes</label>
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
          {Array.from({ length: property.maxGuests }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1} huésped{i + 1 > 1 ? 'es' : ''}</option>
          ))}
        </select>
      </div>
      
      <button className="reserve-button" disabled={!checkIn || !checkOut}>
        Reservar - €{calculateTotal()}
      </button>
    </div>
  );
};
```

### ✅ Paso 5: Integrar Navegación y Conectar con Resultados de Búsqueda
- [ ] Modificar `components/PropertyCard.tsx` para hacer clickeable y navegar al detalle
- [ ] Crear página `app/detail/[id]/page.tsx` para mostrar el detalle de propiedad con ruta `/detail/[id]`
- [ ] Implementar navegación desde resultados de búsqueda al detalle usando la ruta `/detail/[id]`
- [ ] Añadir breadcrumb para navegación de regreso a resultados
- [ ] Incluir botón "Volver a resultados" en el detalle
- [ ] Asegurar que la URL sea SEO-friendly con el formato `/detail/[id]`

```tsx
// Página de detalle de propiedad con ruta /detail/[id]
// app/detail/[id]/page.tsx
import PropertyDetail from '@/components/PropertyDetail';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

const PropertyPage = ({ params }: PropertyPageProps) => {
  return (
    <div className="property-page">
      <PropertyDetail propertyId={params.id} />
    </div>
  );
};

export default PropertyPage;
```

## Notas Técnicas
- Usar datos mock existentes de `lib/mockData.ts` para todas las propiedades
- Mantener diseño responsive que funcione en móviles y desktop
- Implementar navegación con Next.js App Router usando la ruta `/detail/[id]`
- Asegurar accesibilidad básica (alt text, labels, navegación por teclado)
- No implementar funcionalidad de reserva real en esta versión (solo UI)
- Comentarios claros en cada función para facilitar el aprendizaje
- Enfocarse en la experiencia de usuario similar a Airbnb
- **IMPORTANTE**: La URL de cada anuncio debe seguir el formato `/detail/[id]` donde `[id]` es el ID único de la propiedad

## Criterios de Aceptación
- [ ] El usuario puede hacer clic en una propiedad desde los resultados y ver el detalle completo
- [ ] La galería de imágenes funciona correctamente con navegación
- [ ] Se muestra toda la información del host y amenidades
- [ ] El sidebar de reserva calcula precios correctamente
- [ ] La navegación de regreso a resultados funciona
- [ ] El diseño es responsive en móviles y desktop
- [ ] No hay errores en la consola del navegador
- [ ] La interfaz se parece visualmente a Airbnb
- [ ] **Las URLs de los anuncios siguen el formato `/detail/[id]` correctamente**

---

## REFACTORIZACIÓN DEL HEADER - To-Do List Completado ✅

### Objetivo
Refactorizar el componente Header siguiendo las reglas de `check-components.mdc` para mejorar legibilidad, escalabilidad y robustez para programadores junior.

### Tareas Implementadas

#### ✅ 1. Extraer el componente Header en componentes más pequeños y específicos
- [x] **Logo.tsx** - Componente reutilizable para el logo de Airbnb
- [x] **NavigationLinks.tsx** - Enlaces de navegación separados para desktop y móvil
- [x] **SearchBar.tsx** - Barra de búsqueda reutilizable
- [x] **AuthSection.tsx** - Sección de autenticación con navegación implementada
- [x] **Header.tsx** - Componente principal refactorizado y simplificado

#### ✅ 2. Simplificar el estado del menú móvil con hook personalizado
- [x] **useMobileMenu.ts** - Hook personalizado para manejar estado del menú móvil
- [x] Lógica extraída y reutilizable
- [x] Métodos simplificados: `toggleMenu`, `closeMenu`, `openMenu`

#### ✅ 3. Crear constantes para textos y estilos repetidos
- [x] **constants.ts** - Archivo centralizado con:
  - Colores principales (COLORS)
  - Estilos comunes (COMMON_STYLES)
  - Textos de la aplicación (TEXT)
- [x] Mejor mantenibilidad y consistencia

#### ✅ 4. Implementar navegación del icono de usuario según memoria
- [x] Icono de usuario navega a `/account` (o `/login` si no autenticado)
- [x] Implementado en AuthSection.tsx
- [x] Funciona tanto en desktop como móvil

#### ✅ 5. Agregar icono de logout (DoorOpen) y remover textos
- [x] Icono DoorOpen agregado en la parte derecha
- [x] Textos "Mi cuenta" y "Salir" removidos según memoria
- [x] Implementado en AuthSection.tsx
- [x] Funcionalidad de logout integrada

### Beneficios Obtenidos

1. **Legibilidad Mejorada**: Componentes más pequeños y específicos (de 254 líneas a ~20 líneas cada uno)
2. **Escalabilidad**: Separación de responsabilidades y reutilización de componentes
3. **Robustez**: Lógica centralizada en hooks y constantes
4. **Mantenibilidad**: Código más fácil de entender para programadores junior
5. **Cumplimiento de Memorias**: Navegación del usuario y logout implementados según especificaciones

### Archivos Creados/Modificados

**Nuevos Archivos:**
- `components/header/Logo.tsx`
- `components/header/NavigationLinks.tsx`
- `components/header/SearchBar.tsx`
- `components/header/AuthSection.tsx`
- `hooks/useMobileMenu.ts`
- `lib/constants.ts`

**Archivos Modificados:**
- `components/Header.tsx` (refactorizado completamente)

### Resultado Final
El componente Header ahora es mucho más legible, escalable y mantenible, cumpliendo con todos los estándares de React/Next.js y siendo fácil de entender para programadores junior con menos de 1 año de experiencia.