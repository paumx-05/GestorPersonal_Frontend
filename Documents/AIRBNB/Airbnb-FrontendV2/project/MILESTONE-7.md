# MILESTONE-7: Funcionalidad "Guardar en el Carrito" con Fechas de Estancia

## Objetivo
Implementar una funcionalidad que permita a los usuarios seleccionar fechas de estancia y guardar la reserva en el carrito del header, mostrando un contador dinámico y persistencia de datos.

## Pasos a Seguir

### ✅ Paso 1: Crear Contexto del Carrito de Reservas
- [x] Crear `context/ReservationCartContext.tsx` para manejar el estado global del carrito
- [x] Implementar funciones básicas: `addToCart`, `removeFromCart`, `getCartItems`
- [x] Definir interfaz `CartItem` reutilizando `ReservationData` existente
- [x] Agregar persistencia en localStorage para mantener datos entre sesiones
- [x] Incluir comentarios explicativos para que el programador junior entienda cada función

```tsx
// Estructura básica del contexto del carrito
interface ReservationItem {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pricePerNight: number;
  totalNights: number;
  totalPrice: number;
}

const ReservationCartContext = createContext({
  items: [],
  addToCart: (item) => {},
  removeFromCart: (id) => {},
  getTotalItems: () => 0,
  getTotalPrice: () => 0
});
```

### ✅ Paso 2: Reutilizar Componente Existente de Selección de Fechas
- [x] **REUTILIZADO:** `components/ReservationSidebar.tsx` ya existente con selección de fechas
- [x] **REUTILIZADO:** Funciones de cálculo de precios y validaciones ya implementadas
- [x] **AGREGADO:** Botón "Guardar en el Carrito" debajo del selector de fechas
- [x] **AGREGADO:** Estados de carga y confirmación para mejor UX
- [x] **AGREGADO:** Validación para evitar duplicados en el carrito

```tsx
// Componente de selección de fechas
const DateSelector = ({ propertyId, onReservationAdd }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  
  // Función para calcular precio total
  const calculateTotal = () => {
    const nights = calculateNights(checkIn, checkOut);
    return nights * property.pricePerNight;
  };
  
  // Función para agregar al carrito
  const handleAddToCart = () => {
    const reservation = {
      id: generateId(),
      propertyId,
      checkIn,
      checkOut,
      guests,
      totalPrice: calculateTotal()
    };
    onReservationAdd(reservation);
  };
};
```

### ✅ Paso 3: Integrar Botón "Guardar en el Carrito" (COMPLETADO EN PASO 2)
- [x] **IMPLEMENTADO:** Botón "🛒 Guardar en el Carrito" en `ReservationSidebar.tsx`
- [x] **IMPLEMENTADO:** Estado de carga "Agregando..." mientras se procesa
- [x] **IMPLEMENTADO:** Mensaje de confirmación "¡Reserva agregada al carrito!"
- [x] **IMPLEMENTADO:** Validación de fechas y huéspedes antes de guardar
- [x] **IMPLEMENTADO:** Estilos consistentes con botón azul y estados visuales

```tsx
// Botón de guardar en carrito
<Button 
  onClick={handleAddToCart}
  disabled={!checkIn || !checkOut}
  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
>
  {isLoading ? 'Guardando...' : 'Guardar en el Carrito'}
</Button>
```

### ✅ Paso 4: Actualizar Carrito del Header
- [x] **MODIFICADO:** `components/header/AuthSection.tsx` para mostrar contador dinámico
- [x] **CONECTADO:** El carrito del header con `ReservationCartContext`
- [x] **IMPLEMENTADO:** Número total de reservas en el badge rojo (solo si > 0)
- [x] **AGREGADO:** Hover tooltip que muestra resumen de reservas
- [x] **AGREGADO:** Link al carrito (`/cart`) al hacer clic en el icono

```tsx
// Carrito actualizado en el header
const { getTotalItems, items } = useReservationCart();

<span className="absolute -top-1 -right-1 bg-[#FF385C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
  {getTotalItems()}
</span>
```

### ✅ Paso 5: Crear Página de Carrito de Reservas
- [x] **CREADO:** `app/cart/page.tsx` para mostrar todas las reservas guardadas
- [x] **IMPLEMENTADO:** Lista de reservas con información completa (fechas, precios, propiedades)
- [x] **AGREGADO:** Botones para eliminar reservas individuales y limpiar carrito
- [x] **IMPLEMENTADO:** Total general de todas las reservas en sidebar
- [x] **AGREGADO:** Botón "Proceder al Checkout" que redirige a checkout existente
- [x] **IMPLEMENTADO:** Diseño responsive para móvil y desktop con grid layout

```tsx
// Página del carrito
const CartPage = () => {
  const { items, removeFromCart, updateReservation } = useReservationCart();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi Carrito de Reservas</h1>
      
      {items.map(item => (
        <ReservationCard 
          key={item.id}
          item={item}
          onRemove={() => removeFromCart(item.id)}
          onUpdate={(updates) => updateReservation(item.id, updates)}
        />
      ))}
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>${getTotalPrice()}</span>
        </div>
        <Button className="w-full mt-4">Proceder al Checkout</Button>
      </div>
    </div>
  );
};
```

## Consideraciones Técnicas
- **Simplicidad:** Usar useState y useContext, evitar Redux o Zustand
- **Persistencia:** localStorage para mantener datos entre sesiones
- **Validaciones:** Fechas no pueden ser en el pasado, salida después de entrada
- **Responsive:** Funcionar correctamente en móvil y desktop
- **Accesibilidad:** Labels apropiados, navegación por teclado

## Criterios de Aceptación
- [ ] Usuario puede seleccionar fechas de estancia
- [ ] Botón "Guardar en el Carrito" aparece debajo del selector de fechas
- [ ] Carrito del header muestra contador dinámico de reservas
- [ ] Datos persisten al recargar la página
- [ ] Página de carrito muestra todas las reservas guardadas
- [ ] Funcionalidad funciona en móvil y desktop

## Archivos Creados/Modificados ✅

### **Archivos Nuevos:**
- `context/ReservationCartContext.tsx` - Contexto global del carrito
- `app/cart/page.tsx` - Página del carrito de reservas

### **Archivos Modificados:**
- `components/ReservationSidebar.tsx` - Agregado botón "Guardar en el Carrito"
- `components/header/AuthSection.tsx` - Contador dinámico en el carrito del header
- `app/layout.tsx` - Agregado ReservationCartProvider

### **Componentes Reutilizados (Sin Duplicación):**
- ✅ **ReservationSidebar.tsx** - Ya tenía selección de fechas, solo agregamos funcionalidad de carrito
- ✅ **ReservationData interface** - Reutilizada de `lib/reservation-mock.ts`
- ✅ **Checkout flow** - Reutilizado para proceder al pago desde el carrito
- ✅ **Header component** - Solo actualizado el contador, sin duplicar código

## 🎯 **Resultado Final:**
- ✅ Usuario puede seleccionar fechas en cualquier página de detalle
- ✅ Botón "Guardar en el Carrito" aparece debajo del selector de fechas
- ✅ Carrito del header muestra contador dinámico de reservas
- ✅ Datos persisten en localStorage al recargar la página
- ✅ Página de carrito muestra todas las reservas con opciones de gestión
- ✅ Funcionalidad completa sin sobre-ingeniería ni duplicación de código
