# MILESTONE-4: Módulo de Búsqueda Airbnb (Airbnb Search Module)

## Objetivo
Implementar un módulo de búsqueda completo estilo Airbnb que permita a los usuarios buscar alojamientos con filtros específicos de hospedaje: ubicación, fechas de check-in/check-out, número de huéspedes y tipo de propiedad.

## Pasos a Seguir

### ✅ Paso 1: Crear Componente de Búsqueda Principal Estilo Airbnb
- [ ] Crear `components/AirbnbSearchModule.tsx` con diseño tipo Airbnb
- [ ] Implementar campo de ubicación con placeholder "¿A dónde vas?"
- [ ] Añadir selector de fechas con "Check-in" y "Check-out"
- [ ] Incluir selector de huéspedes con "¿Cuántos huéspedes?"
- [ ] Crear botón de búsqueda con icono de lupa y texto "Buscar"
- [ ] Aplicar estilos Airbnb con bordes redondeados y sombras

```tsx
// Estructura básica del buscador Airbnb
const AirbnbSearchModule = () => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  
  const handleSearch = () => {
    // Lógica de búsqueda Airbnb
    console.log('Buscando alojamiento:', { location, checkIn, checkOut, guests });
  };
  
  return (
    <div className="airbnb-search-module">
      <div className="location-field">
        <label>¿A dónde vas?</label>
        <input 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Buscar destinos"
        />
      </div>
      <div className="dates-field">
        <input 
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          placeholder="Check-in"
        />
        <input 
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          placeholder="Check-out"
        />
      </div>
      <div className="guests-field">
        <input 
          type="number"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          placeholder="¿Cuántos huéspedes?"
        />
      </div>
      <button onClick={handleSearch}>🔍 Buscar</button>
    </div>
  );
};
```

### ✅ Paso 2: Implementar Filtros Airbnb Específicos
- [ ] Crear componente `components/AirbnbFilters.tsx`
- [ ] Añadir filtro por tipo de alojamiento (Casa completa, Habitación privada, Habitación compartida)
- [ ] Implementar filtro por rango de precio por noche
- [ ] Incluir filtro por amenidades (WiFi, Cocina, Piscina, etc.)
- [ ] Añadir filtro por calificación mínima (estrellas)
- [ ] Crear estado para manejar todos los filtros activos

```tsx
// Estructura de filtros Airbnb
interface AirbnbFilters {
  propertyType: 'entire' | 'private' | 'shared';
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  minRating: number;
  instantBook: boolean;
}
```

### ✅ Paso 3: Crear Sistema de Resultados Airbnb
- [ ] Crear componente `components/AirbnbResults.tsx`
- [ ] Implementar grid de resultados con cards estilo Airbnb
- [ ] Mostrar precio por noche, calificación y ubicación en cada card
- [ ] Añadir mensaje cuando no hay alojamientos disponibles
- [ ] Incluir indicador de carga durante la búsqueda
- [ ] Mostrar número total de resultados encontrados

### ✅ Paso 4: Integrar Búsqueda Airbnb en Página Principal
- [ ] Importar `AirbnbSearchModule` en `app/page.tsx`
- [ ] Posicionar el módulo de búsqueda en la parte superior como hero section
- [ ] Conectar con el estado global de alojamientos si existe
- [ ] Asegurar que la búsqueda funcione con datos mock de Airbnb inicialmente
- [ ] Implementar navegación a página de resultados al hacer búsqueda

### ✅ Paso 5: Añadir Funcionalidad de Búsqueda Airbnb en Tiempo Real
- [ ] Implementar búsqueda mientras el usuario escribe ubicación (debounce)
- [ ] Crear función `debounceLocationSearch` con delay de 300ms
- [ ] Mostrar sugerencias de ubicación mientras se escribe
- [ ] Filtrar resultados en tiempo real al cambiar fechas o huéspedes
- [ ] Añadir indicador visual de búsqueda activa

```tsx
// Función de debounce para búsqueda de ubicación en tiempo real
const debounceLocationSearch = useCallback(
  debounce((location: string) => {
    // Lógica de búsqueda de ubicación con delay
    searchLocations(location);
  }, 300),
  []
);
```

## Notas Técnicas
- Usar datos mock de Airbnb para las primeras pruebas
- Mantener la interfaz simple y responsive estilo Airbnb
- Asegurar accesibilidad básica (labels, alt text)
- No implementar funcionalidades avanzadas en esta primera versión
- Comentarios claros en cada función para facilitar el aprendizaje
- Enfocarse en la experiencia de usuario similar a Airbnb

## Criterios de Aceptación
- [ ] El usuario puede buscar por ubicación, fechas y huéspedes
- [ ] Los filtros Airbnb funcionan correctamente
- [ ] Los resultados se muestran con información relevante (precio/noche, rating)
- [ ] La búsqueda es responsive en móviles
- [ ] No hay errores en la consola del navegador
- [ ] La interfaz se parece visualmente a Airbnb
