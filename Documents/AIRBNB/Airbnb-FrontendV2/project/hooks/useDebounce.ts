import { useState, useEffect } from 'react';

/**
 * Hook personalizado para implementar debounce en búsquedas
 * Evita hacer demasiadas llamadas a la API mientras el usuario escribe
 * 
 * @param value - El valor que queremos debounce
 * @param delay - El delay en milisegundos (por defecto 300ms)
 * @returns El valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crear un timer que se ejecutará después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timer si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
