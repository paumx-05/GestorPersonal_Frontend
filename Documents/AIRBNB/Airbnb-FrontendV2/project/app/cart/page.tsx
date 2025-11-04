'use client';

import { useState } from 'react';
import { useReservationCart } from '@/context/ReservationCartContext';
import Header from '@/components/Header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Users, MapPin, Loader2, CreditCard } from 'lucide-react';
import type { CartItem } from '@/schemas/cart';

/**
 * Helper para convertir location a string (compatible con string u objeto)
 */
function getLocationDisplay(location: any): string {
  if (!location) return 'Ubicación no disponible';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    if (location.address) return location.address;
    if (location.city) return location.city;
    if (location.country) return location.country;
    return 'Ubicación no disponible';
  }
  return String(location || 'Ubicación no disponible');
}

/**
 * Página del Carrito de Reservas
 * Muestra todas las reservas guardadas y permite gestionarlas
 */
export default function CartPage() {
  const { items, removeFromCart, getTotalPrice, clearCart, isLoading, error } = useReservationCart();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Función para calcular las noches de una reserva
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  // Función para obtener el precio por noche de un item
  const getPricePerNight = (item: CartItem): number => {
    const nights = item.totalNights || calculateNights(item.checkIn, item.checkOut);
    if (nights === 0) return 0;
    
    // Si tiene subtotal, usarlo; si no, usar totalPrice
    const basePrice = item.subtotal || item.totalPrice || 0;
    return Math.round(basePrice / nights);
  };

  // Función para obtener el total de un item
  const getItemTotal = (item: CartItem): number => {
    // Usar total si está disponible, si no usar totalPrice
    return item.total || item.totalPrice || 0;
  };

  // Función para obtener las noches de un item
  const getItemNights = (item: CartItem): number => {
    return item.totalNights || calculateNights(item.checkIn, item.checkOut);
  };

  // Función para manejar el checkout de una propiedad individual
  const handleCheckoutItem = (item: CartItem) => {
    const params = new URLSearchParams({
      propertyId: item.propertyId,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      guests: item.guests.toString()
    });
    
    window.location.href = `/checkout?${params.toString()}`;
  };

  // Función para manejar el checkout de todas las propiedades (primera)
  const handleCheckout = () => {
    if (items.length === 0) {
      alert('No hay reservas en el carrito');
      return;
    }
    
    // Redirigir al checkout de la primera reserva
    handleCheckoutItem(items[0]);
  };

  // Función para eliminar item con estado de carga
  const handleRemoveItem = async (id: string) => {
    setRemovingItems(prev => new Set(prev).add(id));
    try {
      await removeFromCart(id);
    } catch (error) {
      console.error('Error eliminando item:', error);
      alert('Error al eliminar la reserva del carrito');
    } finally {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Función para limpiar carrito con estado de carga
  const handleClearCart = async () => {
    if (!confirm('¿Estás seguro de que quieres limpiar todo el carrito?')) {
      return;
    }
    
    setIsClearing(true);
    try {
      await clearCart();
    } catch (error) {
      console.error('Error limpiando carrito:', error);
      alert('Error al limpiar el carrito');
    } finally {
      setIsClearing(false);
    }
  };

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF385C]" />
            <span className="ml-3 text-gray-600">Cargando carrito...</span>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Agrega algunas reservas para comenzar tu viaje
            </p>
            <Link href="/">
              <Button className="bg-[#FF385C] hover:bg-[#E31C5F] text-white">
                Explorar Propiedades
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mi Carrito de Reservas ({items.length})
          </h1>
          
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={isClearing}
              className="text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isClearing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Limpiando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar Carrito
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de reservas */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Imagen de la propiedad - Mejorado para mejor visibilidad */}
                  <div className="md:w-64 flex-shrink-0">
                    <div className="relative w-full h-48 md:h-56 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.propertyImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                        alt={item.propertyTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Si la imagen falla al cargar, usar una imagen por defecto
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                        }}
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Información de la reserva */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.propertyTitle}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{getLocationDisplay(item.propertyLocation)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Fechas */}
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div className="text-sm">
                          <div>Check-in: {formatDate(item.checkIn)}</div>
                          <div>Check-out: {formatDate(item.checkOut)}</div>
                        </div>
                      </div>

                      {/* Huéspedes */}
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {item.guests} huésped{item.guests > 1 ? 'es' : ''}
                        </span>
                      </div>

                      {/* Noches */}
                      <div className="text-gray-600">
                        <span className="text-sm">
                          {getItemNights(item)} noche{getItemNights(item) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Precio y Total */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-[#FF385C]/5 to-[#FF385C]/10 rounded-lg border border-[#FF385C]/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600">
                          €{getPricePerNight(item)} por noche × {getItemNights(item)} noche{getItemNights(item) > 1 ? 's' : ''}
                        </div>
                        <div className="text-xl font-bold text-[#FF385C]">
                          €{getItemTotal(item)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Total de esta reserva
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleCheckoutItem(item)}
                        className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F] text-white"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Reservar esta propiedad
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removingItems.has(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                        title="Eliminar del carrito"
                      >
                        {removingItems.has(item.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del carrito */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Resumen del Carrito
              </h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.propertyTitle}
                    </span>
                    <span className="font-medium">€{getItemTotal(item)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>€{getTotalPrice()}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mt-6 bg-[#FF385C] hover:bg-[#E31C5F] text-white"
              >
                Proceder al Checkout
              </Button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Podrás revisar y editar los detalles antes de confirmar
              </p>
            </div>
          </div>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
