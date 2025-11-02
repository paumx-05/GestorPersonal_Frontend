'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '@/lib/api/cart';
import { propertyService, getLocationString } from '@/lib/api/properties';
import type { CartItem, AddCartItem } from '@/schemas/cart';

// Interfaz del contexto del carrito
interface ReservationCartContextType {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (item: AddCartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (propertyId: string, checkIn: string, checkOut: string) => boolean;
  refreshCart: () => Promise<void>;
}

// Crear el contexto
const ReservationCartContext = createContext<ReservationCartContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useReservationCart = () => {
  const context = useContext(ReservationCartContext);
  if (!context) {
    throw new Error('useReservationCart debe usarse dentro de ReservationCartProvider');
  }
  return context;
};

// Props del provider
interface ReservationCartProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto del carrito
 * Usa la API real del backend cuando el usuario está autenticado
 * Fallback a localStorage solo si el endpoint no está disponible
 */
export const ReservationCartProvider = ({ children }: ReservationCartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  /**
   * Enriquecer item del carrito con información de la propiedad
   * El backend solo devuelve: id, propertyId, checkIn, checkOut, guests, totalPrice
   * Necesitamos agregar: propertyTitle, propertyLocation, propertyImage
   */
  const enrichCartItem = useCallback(async (item: CartItem): Promise<CartItem> => {
    // Si ya tiene la información, no hacer nada
    if (item.propertyTitle && item.propertyImage) {
      return item;
    }

    try {
      const property = await propertyService.getPropertyById(item.propertyId);
      if (property) {
        return {
          ...item,
          propertyTitle: property.title,
          propertyLocation: getLocationString(property.location) || property.city || '',
          propertyImage: property.imageUrl || '',
        };
      }
    } catch (error) {
      console.warn('⚠️ [ReservationCart] No se pudo obtener información de la propiedad:', item.propertyId);
    }
    
    // Si no se puede obtener la propiedad, usar valores por defecto
    return {
      ...item,
      propertyTitle: item.propertyTitle || 'Propiedad no disponible',
      propertyLocation: item.propertyLocation || 'Ubicación no disponible',
      propertyImage: item.propertyImage || '',
    };
  }, []);

  /**
   * Cargar carrito desde la API o localStorage
   */
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Usuario autenticado: intentar cargar desde API
        try {
          const cartData = await cartService.getCart();
          
          // Enriquecer items con información de la propiedad
          const enrichedItems = await Promise.all(
            cartData.items.map(item => enrichCartItem(item))
          );
          
          setItems(enrichedItems);
          console.log('✅ [ReservationCart] Carrito cargado desde API:', enrichedItems.length, 'items');
        } catch (apiError) {
          console.warn('⚠️ [ReservationCart] Error cargando desde API, intentando localStorage:', apiError);
          
          // Si falla la API, intentar localStorage como fallback
          const savedCart = localStorage.getItem('reservation-cart');
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              setItems(Array.isArray(parsedCart) ? parsedCart : []);
              console.log('✅ [ReservationCart] Carrito cargado desde localStorage (fallback)');
            } catch (parseError) {
              console.error('❌ [ReservationCart] Error parseando localStorage:', parseError);
              setItems([]);
            }
          } else {
            setItems([]);
          }
          
          // Solo mostrar error si NO es un 404 (endpoint no implementado es esperado)
          const is404Error = apiError instanceof Error && (
            apiError.message.includes('404') || 
            apiError.message.includes('Endpoint no encontrado') ||
            apiError.message.includes('not found')
          );
          
          if (!is404Error) {
            setError('No se pudo cargar el carrito desde el servidor');
          }
        }
      } else {
        // Usuario no autenticado: usar localStorage
    const savedCart = localStorage.getItem('reservation-cart');
    if (savedCart) {
      try {
            const parsedCart = JSON.parse(savedCart);
            setItems(Array.isArray(parsedCart) ? parsedCart : []);
            console.log('✅ [ReservationCart] Carrito cargado desde localStorage (no autenticado)');
          } catch (parseError) {
            console.error('❌ [ReservationCart] Error parseando localStorage:', parseError);
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
      } catch (error) {
      console.error('💥 [ReservationCart] Error cargando carrito:', error);
      setError('Error al cargar el carrito');
        setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Cargar carrito al inicializar o cuando cambie la autenticación
  useEffect(() => {
    console.log('🔄 [ReservationCart] Efecto loadCart ejecutado, isAuthenticated:', isAuthenticated);
    
    // Si está autenticado, esperar un poco para asegurar que el token esté disponible
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        loadCart();
      }, 300); // 300ms debería ser suficiente para que el token esté disponible
      return () => clearTimeout(timer);
    } else {
      // Si no está autenticado, cargar inmediatamente desde localStorage
      loadCart();
    }
  }, [loadCart, isAuthenticated]);

  /**
   * Sincronizar items de localStorage con la API cuando el usuario se autentica
   */
  const syncLocalStorageToAPI = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // Obtener items de localStorage
      const savedCart = localStorage.getItem('reservation-cart');
      if (!savedCart) return;

      const localItems = JSON.parse(savedCart);
      if (!Array.isArray(localItems) || localItems.length === 0) return;

      // Obtener carrito actual de la API
      const apiCart = await cartService.getCart();
      
      // Si hay items en localStorage pero no en la API, migrarlos
      if (localItems.length > 0 && apiCart.items.length === 0) {
        console.log('🔄 [ReservationCart] Migrando items de localStorage a API...');
        
        for (const item of localItems) {
          try {
            // Remover id temporal si existe y agregar a la API
            const { id, ...itemToAdd } = item;
            await cartService.addToCart(itemToAdd);
            console.log('✅ [ReservationCart] Item migrado:', item.propertyId);
          } catch (error) {
            console.error('❌ [ReservationCart] Error migrando item:', error);
          }
        }

        // Recargar carrito desde la API después de migrar
        const updatedCart = await cartService.getCart();
        setItems(updatedCart.items);
        console.log('✅ [ReservationCart] Migración completada:', updatedCart.items.length, 'items');
        
        // Limpiar localStorage después de migrar exitosamente
        localStorage.removeItem('reservation-cart');
      }
    } catch (error) {
      console.error('💥 [ReservationCart] Error sincronizando localStorage:', error);
    }
  }, [isAuthenticated]);

  // Sincronizar cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      // Esperar un poco para asegurar que el token está disponible
      const timer = setTimeout(() => {
        syncLocalStorageToAPI();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, syncLocalStorageToAPI]);

  /**
   * Guardar en localStorage como backup (solo si no estamos usando API o como fallback)
   */
  useEffect(() => {
    // NO guardar en localStorage cuando estamos autenticados y usando API
    // Solo guardar como backup si no estamos autenticados
    if (!isAuthenticated) {
      try {
    localStorage.setItem('reservation-cart', JSON.stringify(items));
      } catch (error) {
        console.error('❌ [ReservationCart] Error guardando en localStorage:', error);
      }
    }
  }, [items, isAuthenticated]);

  /**
   * Agregar item al carrito
   */
  const addToCart = useCallback(async (item: AddCartItem): Promise<void> => {
    setError(null);

    try {
      if (isAuthenticated) {
        // Usuario autenticado: usar API
        try {
          const newItem = await cartService.addToCart(item);
          
          // Enriquecer el nuevo item con información de la propiedad
          const enrichedItem = await enrichCartItem(newItem);
    
    setItems(prevItems => {
      // Verificar si ya existe una reserva similar
      const existingIndex = prevItems.findIndex(
        existing => 
          existing.propertyId === item.propertyId &&
          existing.checkIn === item.checkIn &&
          existing.checkOut === item.checkOut
      );
      
      if (existingIndex >= 0) {
        // Si existe, actualizar el item existente
        const updatedItems = [...prevItems];
              updatedItems[existingIndex] = enrichedItem;
        return updatedItems;
      } else {
        // Si no existe, agregar nuevo item
              return [...prevItems, enrichedItem];
            }
          });
          
          console.log('✅ [ReservationCart] Item agregado al carrito (API)');
          
          // Recargar el carrito completo desde la API para asegurar sincronización
          try {
            const refreshedCart = await cartService.getCart();
            const enrichedItems = await Promise.all(
              refreshedCart.items.map(cartItem => enrichCartItem(cartItem))
            );
            setItems(enrichedItems);
            console.log('✅ [ReservationCart] Carrito refrescado desde API:', enrichedItems.length, 'items');
          } catch (refreshError) {
            console.warn('⚠️ [ReservationCart] Error refrescando carrito:', refreshError);
          }
        } catch (apiError) {
          // Si falla la API, guardar en localStorage como fallback temporal
          console.warn('⚠️ [ReservationCart] Error en API, usando localStorage como fallback:', apiError);
          
          // Calcular totalPrice localmente para el fallback
          const checkInDate = new Date(item.checkIn);
          const checkOutDate = new Date(item.checkOut);
          const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
          const calculatedTotalPrice = nights * item.pricePerNight;
          
          const fallbackItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            propertyId: item.propertyId,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            guests: item.guests,
            totalPrice: calculatedTotalPrice,
          };
          
          setItems(prevItems => {
            const existingIndex = prevItems.findIndex(
              existing => 
                existing.propertyId === item.propertyId &&
                existing.checkIn === item.checkIn &&
                existing.checkOut === item.checkOut
            );
            
            if (existingIndex >= 0) {
              const updatedItems = [...prevItems];
              updatedItems[existingIndex] = fallbackItem;
              return updatedItems;
            } else {
              return [...prevItems, fallbackItem];
            }
          });
          
          // Intentar guardar en la API de nuevo en segundo plano
          // Esto permite que si se restablece la conexión, se sincronice automáticamente
          setTimeout(async () => {
            try {
              const retryItem = await cartService.addToCart(item);
              setItems(prevItems => {
                const index = prevItems.findIndex(i => i.id === fallbackItem.id);
                if (index >= 0) {
                  const updated = [...prevItems];
                  updated[index] = retryItem;
                  return updated;
                }
                return prevItems;
              });
              console.log('✅ [ReservationCart] Item sincronizado con API después del fallback');
            } catch (retryError) {
              console.warn('⚠️ [ReservationCart] Reintento falló, item permanece en localStorage');
            }
          }, 2000);
          
          // Solo mostrar error si NO es un 404 (endpoint no implementado es esperado)
          const is404Error = apiError instanceof Error && (
            apiError.message.includes('404') || 
            apiError.message.includes('Endpoint no encontrado') ||
            apiError.message.includes('not found')
          );
          
          if (!is404Error) {
            // Solo mostrar error para errores críticos (red, servidor, etc.)
            setError('No se pudo agregar al carrito en el servidor, se guardó localmente. Se intentará sincronizar automáticamente.');
            // Limpiar error después de 5 segundos
            setTimeout(() => setError(null), 5000);
          }
        }
      } else {
        // Usuario no autenticado: usar localStorage
        // Calcular totalPrice localmente
        const checkInDate = new Date(item.checkIn);
        const checkOutDate = new Date(item.checkOut);
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const calculatedTotalPrice = nights * item.pricePerNight;
        
        const fallbackItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          propertyId: item.propertyId,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          guests: item.guests,
          totalPrice: calculatedTotalPrice,
        };
        
        setItems(prevItems => {
          const existingIndex = prevItems.findIndex(
            existing => 
              existing.propertyId === item.propertyId &&
              existing.checkIn === item.checkIn &&
              existing.checkOut === item.checkOut
          );
          
          if (existingIndex >= 0) {
            const updatedItems = [...prevItems];
            updatedItems[existingIndex] = fallbackItem;
            return updatedItems;
          } else {
            return [...prevItems, fallbackItem];
          }
        });
        console.log('✅ [ReservationCart] Item agregado al carrito (localStorage)');
      }
    } catch (error) {
      console.error('💥 [ReservationCart] Error agregando al carrito:', error);
      setError('Error al agregar item al carrito');
      throw error;
    }
  }, [isAuthenticated]);

  /**
   * Eliminar item del carrito
   */
  const removeFromCart = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      if (isAuthenticated) {
        // Usuario autenticado: usar API
        try {
          await cartService.removeFromCart(id);
          // Recargar el carrito completo desde la API para asegurar sincronización
          const refreshedCart = await cartService.getCart();
          setItems(refreshedCart.items);
          console.log('✅ [ReservationCart] Item eliminado del carrito (API), carrito refrescado');
        } catch (apiError) {
          // Si falla la API, usar localStorage como fallback
          console.warn('⚠️ [ReservationCart] Error en API, usando localStorage:', apiError);
          setItems(prevItems => prevItems.filter(item => item.id !== id));
          
          // Solo mostrar error si NO es un 404 (endpoint no implementado es esperado)
          const is404Error = apiError instanceof Error && (
            apiError.message.includes('404') || 
            apiError.message.includes('Endpoint no encontrado') ||
            apiError.message.includes('not found')
          );
          
          if (!is404Error) {
            setError('No se pudo eliminar del carrito en el servidor');
          }
        }
      } else {
        // Usuario no autenticado: usar localStorage
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        console.log('✅ [ReservationCart] Item eliminado del carrito (localStorage)');
      }
    } catch (error) {
      console.error('💥 [ReservationCart] Error eliminando del carrito:', error);
      setError('Error al eliminar item del carrito');
      throw error;
    }
  }, [isAuthenticated]);

  /**
   * Limpiar todo el carrito
   */
  const clearCart = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      if (isAuthenticated) {
        // Usuario autenticado: usar API
        try {
          await cartService.clearCart();
          // Recargar el carrito completo desde la API para asegurar sincronización
          const refreshedCart = await cartService.getCart();
          const enrichedItems = await Promise.all(
            refreshedCart.items.map(item => enrichCartItem(item))
          );
          setItems(enrichedItems);
          console.log('✅ [ReservationCart] Carrito limpiado (API), carrito refrescado');
        } catch (apiError) {
          // Si falla la API, usar localStorage como fallback
          console.warn('⚠️ [ReservationCart] Error en API, usando localStorage:', apiError);
          setItems([]);
          
          // Solo mostrar error si NO es un 404 (endpoint no implementado es esperado)
          const is404Error = apiError instanceof Error && (
            apiError.message.includes('404') || 
            apiError.message.includes('Endpoint no encontrado') ||
            apiError.message.includes('not found')
          );
          
          if (!is404Error) {
            setError('No se pudo limpiar el carrito en el servidor');
          }
        }
      } else {
        // Usuario no autenticado: usar localStorage
    setItems([]);
        console.log('✅ [ReservationCart] Carrito limpiado (localStorage)');
      }
    } catch (error) {
      console.error('💥 [ReservationCart] Error limpiando carrito:', error);
      setError('Error al limpiar el carrito');
      throw error;
    }
  }, [isAuthenticated]);

  /**
   * Refrescar carrito desde la API
   */
  const refreshCart = useCallback(async (): Promise<void> => {
    if (isAuthenticated) {
      await loadCart();
    }
  }, [loadCart, isAuthenticated]);

  /**
   * Obtener número total de items
   */
  const getTotalItems = (): number => {
    return items.length;
  };

  /**
   * Obtener precio total del carrito
   */
  const getTotalPrice = (): number => {
    return items.reduce((total, item) => total + (item.totalPrice || item.total || 0), 0);
  };

  /**
   * Verificar si una reserva ya está en el carrito
   */
  const isInCart = (propertyId: string, checkIn: string, checkOut: string): boolean => {
    return items.some(
      item => 
        item.propertyId === propertyId &&
        item.checkIn === checkIn &&
        item.checkOut === checkOut
    );
  };

  // Valor del contexto
  const value: ReservationCartContextType = {
    items,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    refreshCart,
  };

  return (
    <ReservationCartContext.Provider value={value}>
      {children}
    </ReservationCartContext.Provider>
  );
};
