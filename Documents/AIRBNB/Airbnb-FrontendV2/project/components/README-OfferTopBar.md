# OfferTopBar Component

Un componente React/Next.js para mostrar ofertas de última hora con contador regresivo y animaciones atractivas.

## Características

- ✨ **Animaciones atractivas** - Efectos de brillo, pulso y animaciones de fondo
- ⏰ **Contador regresivo** - Tiempo real con formato HH:MM:SS
- 👥 **Indicador de cupos** - Muestra cuántos lugares quedan disponibles
- 📱 **Responsive** - Se adapta perfectamente a móviles y desktop
- 🎨 **Personalizable** - Fácil de configurar con diferentes ofertas
- ❌ **Cerrable** - Los usuarios pueden ocultar el banner
- 🚀 **Optimizado** - Rendimiento optimizado con hooks de React

## Instalación

El componente ya está incluido en el proyecto. Solo necesitas importarlo:

```tsx
import OfferTopBar from '@/components/OfferTopBar';
```

## Uso Básico

```tsx
export default function MyPage() {
  return (
    <div>
      <OfferTopBar 
        discount={45}
        remainingSpots={15}
        timeLimit={120}
        offerText="¡Oferta Flash! Reserva ahora y ahorra"
      />
      {/* Resto de tu contenido */}
    </div>
  );
}
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `discount` | `number` | `45` | Porcentaje de descuento a mostrar |
| `remainingSpots` | `number` | `15` | Número de cupos/plazas restantes |
| `timeLimit` | `number` | `120` | Tiempo límite en minutos |
| `offerText` | `string` | `"¡Oferta Flash! Reserva ahora y ahorra"` | Texto personalizado de la oferta |
| `onClose` | `function` | `undefined` | Callback ejecutado al cerrar el banner |

## Ejemplos de Uso

### Oferta de Fin de Semana
```tsx
<OfferTopBar 
  discount={30}
  remainingSpots={25}
  timeLimit={180}
  offerText="¡Especial Fin de Semana!"
  onClose={() => console.log('Banner cerrado')}
/>
```

### Oferta de Última Hora
```tsx
<OfferTopBar 
  discount={60}
  remainingSpots={8}
  timeLimit={60}
  offerText="¡Última hora! Solo quedan pocas horas"
/>
```

### Early Bird
```tsx
<OfferTopBar 
  discount={25}
  remainingSpots={50}
  timeLimit={300}
  offerText="¡Early Bird! Reserva temprano y ahorra"
/>
```

## Características Técnicas

### Animaciones
- **Shimmer Effect**: Efecto de brillo que se mueve de izquierda a derecha
- **Pulse Animation**: El icono de rayo y el contador parpadean para crear urgencia
- **Hover Effects**: Botones con efectos de hover suaves
- **Progress Bar**: Barra de progreso que muestra el tiempo transcurrido

### Responsive Design
- **Desktop**: Muestra todos los elementos con espaciado completo
- **Tablet**: Oculta algunos textos menos importantes
- **Mobile**: Compacta el layout y ajusta botones

### Accesibilidad
- **ARIA Labels**: Botón de cerrar tiene label descriptivo
- **Contraste**: Colores con contraste suficiente para legibilidad
- **Keyboard Navigation**: Todos los elementos interactivos son accesibles por teclado

## Personalización

### Colores
El componente usa un gradiente rojo-naranja por defecto. Para personalizar:

```css
/* En tu archivo CSS personalizado */
.custom-offer-bar {
  background: linear-gradient(to right, #your-color-1, #your-color-2);
}
```

### Animaciones
Las animaciones están definidas en `app/globals.css`. Puedes modificar la velocidad o efecto:

```css
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 2s infinite; /* Cambiar velocidad aquí */
}
```

## Integración con Analytics

Para rastrear interacciones con el banner:

```tsx
<OfferTopBar 
  discount={45}
  remainingSpots={15}
  timeLimit={120}
  offerText="¡Oferta Flash!"
  onClose={() => {
    // Enviar evento a tu servicio de analytics
    analytics.track('offer_banner_closed', {
      discount: 45,
      remaining_spots: 15
    });
  }}
/>
```

## Mejores Prácticas

1. **Tiempo Límite**: Usa tiempos realistas (30-300 minutos)
2. **Cupos**: Mantén números creíbles (5-50 cupos)
3. **Texto**: Mantén el texto conciso y urgente
4. **Posición**: Coloca siempre en la parte superior de la página
5. **Frecuencia**: No abuses de las ofertas para mantener credibilidad

## Compatibilidad

- ✅ React 18+
- ✅ Next.js 13+
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Todos los navegadores modernos

## Dependencias

El componente utiliza:
- `react` - Hooks useState y useEffect
- `lucide-react` - Iconos (X, Clock, Users, Zap)
- `tailwindcss` - Estilos y animaciones

## Soporte

Si encuentras algún problema o tienes sugerencias, puedes:
1. Revisar la documentación
2. Verificar que todas las dependencias están instaladas
3. Comprobar que los estilos CSS personalizados están incluidos





