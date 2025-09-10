# Milestone 2: Implementación de búsqueda por matrícula

## Tareas y argumentación

1. Validar la matrícula con regex (4 números y 3 letras).
   - Argumento: Asegura que el usuario introduce un formato correcto, evitando llamadas innecesarias y mejorando la robustez.
2. Mostrar mensaje de error si la matrícula no cumple el formato.
   - Argumento: Proporciona feedback inmediato al usuario, mejorando la experiencia y dirigiendo correcciones.
3. Redirigir a `/vehicle/[licensePlate]` tras validación exitosa.
   - Argumento: Separa la lógica de búsqueda de la presentación de datos, manteniendo el código modular y limpio.
4. Crear `app/vehicle/[licensePlate]/page.tsx` para la ruta dinámica.
   - Argumento: Establece la infraestructura necesaria para servir detalles del vehículo, facilitando su extensión futura.
5. Implementar datos mock para `0251FZL` (Seat Ibiza 2018, Rojo).
   - Argumento: Permite validar el flujo sin conectarse a una API real, acelerando el desarrollo inicial.
6. Añadir enlace de retorno al buscador desde la página de vehículo.
   - Argumento: Mejora la navegabilidad y experiencia de usuario al facilitar la exploración.
7. Probar flujo completo con la matrícula mock `0251FZL`.
   - Argumento: Verifica la integración de validación, redirección y renderizado antes de pasar a datos reales.
8. Documentar resultados y siguientes pasos.
   - Argumento: Mantiene un registro claro del progreso y define el camino para la fase de integración con API real.

## Nuevas tareas implementadas y pendientes

9. Actualizar `VehicleData` para incluir campos `vin`, `model` y `year`.
   - Argumento: Necesario para almacenar y mostrar la información completa del vehículo.
10. Convertir `VehiclePage` en un componente cliente con estado local.
    - Argumento: Permite gestionar la entrada de usuario y actualizar la UI dinámicamente.
11. Agregar campo de entrada (`Input`) y botón de búsqueda (`Button`) en la página de vehículo.
    - Argumento: Facilita al usuario realizar nuevas búsquedas sin volver al inicio.
12. Mostrar debajo del buscador los datos mock: `VIN:12345678912345678`, `Modelo: Fiat Grande Punto`, `Año:25/01/2008` para `0251FZL`.
    - Argumento: Ofrece feedback inmediato y cumple con la especificación mock.
13. Probar que al cambiar la matrícula y buscar se actualicen los datos mostrados.
    - Argumento: Asegura que la lógica de búsqueda funcione correctamente.

## Refactorización de Header

14. Crear componente `Header` en `components/Header.tsx` con la lógica y estilos del header original.
    - Argumento: Evita duplicar código y facilita mantenimiento.
15. Refactorizar `app/page.tsx` para importar y usar `Header` en lugar del bloque estático.
    - Argumento: Centraliza la UI del header en un solo componente.
16. Refactorizar `app/vehicle/[licensePlate]/page.tsx` para importar y usar `Header` al inicio de la página.
    - Argumento: Garantiza consistencia de navegación y apariencia en todas las vistas.
17. Probar que el `Header` funciona correctamente en ambas rutas y mantiene la funcionalidad de carrito y login.
    - Argumento: Confirma que no se rompa la experiencia de usuario al extraer el header.

## Footer en VehiclePage

18. Extraer el footer de `app/page.tsx` a un componente `Footer` en `components/Footer.tsx`.
    - Argumento: Facilita la reutilización y mantenimiento del código de pie de página.
19. Importar y renderizar `Footer` en `app/vehicle/[licensePlate]/page.tsx` al final de la página.
    - Argumento: Asegura consistencia visual y funcional en toda la aplicación.
20. Probar que el `Footer` se muestra correctamente en la página de búsqueda de matrículas.
    - Argumento: Verifica que la experiencia de usuario sea uniforme en todas las vistas.

## Replicar diseño y funcionalidad del ejemplo HTML tras búsqueda

21. Añadir gradientes de fondo (body y header) según el ejemplo: definir estilos en globals.css o usando Tailwind.
    - Argumento: Reproduce el aspecto visual moderno con degradados personalizables.
22. Extender componente `Header` para incluir la sección `.vehicle-info` debajo del header principal.
    - Argumento: Muestra detalles básicos del vehículo (VIN, Marca, Modelo, Matrícula, Año) en un grid de dos columnas.
23. Crear componente `VehicleDetails` con tarjeta estilizada (border-left rojo, fondo semitransparente y bordes redondeados).
    - Argumento: Encapsula la UI de información del vehículo y facilita su reutilización.
24. Añadir sección `SearchSection` al lado de `VehicleDetails` con input y botón estilizados.
    - Argumento: Permite buscar recambios desde la misma vista sin recargar la página.
25. Diseñar layout `.main-container` con grid de dos columnas: `Sidebar` (280px) y `ContentArea` (restante).
    - Argumento: Estructura el contenido principal tal como en el ejemplo.
26. Crear componente `Sidebar` con lista de categorías; aplicar estilos hover y border-left al hacer clic en un item.
    - Argumento: Mejora la navegación y experiencia interactiva.
27. Implementar componente `ContentArea` con grid de `PartCategory`, replicando estilos y animaciones de entrada.
    - Argumento: Muestra los grupos de recambios con animación secuencial.
28. Añadir toolbar en `ContentArea` con título y controles de vista (grid/list) que cambian de estado al hacer clic.
    - Argumento: Permite alternar entre presentaciones de catálogo.
29. Integrar lógica React para el efecto hover/click de categorías y toggle de vista.
    - Argumento: Mantiene la interactividad sin manipulación directa del DOM.
30. Probar el flujo completo: búsqueda de matrícula, visualización de datos y comportamiento de UI de recambios.
    - Argumento: Verifica que el diseño y la funcionalidad coincidan con el ejemplo.
