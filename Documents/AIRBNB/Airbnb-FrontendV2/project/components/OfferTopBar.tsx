'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Users, Zap } from 'lucide-react';

interface OfferTopBarProps {
  discount?: number;
  emoji?: boolean;
  remainingSpots?: number;
  timeLimit?: number; // minutos
  offerText?: string;
  onClose?: () => void;
}

/**
 * OfferTopBar Component - Banner de ofertas de última hora
 * Muestra ofertas limitadas con contador regresivo y animaciones atractivas
 */
export default function OfferTopBar({
  discount = 45,
  emoji = false,
  remainingSpots = 15,
  timeLimit = 120, // 2 horas por defecto
  offerText = "¡Oferta Flash! Reserva ahora y ahorra",
  onClose
}: OfferTopBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // convertir a segundos
  const [animate, setAnimate] = useState(false);

  // Contador regresivo
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Animación de pulso para crear urgencia
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 600);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Formatear tiempo restante
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
 
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white relative overflow-hidden">
      {/* Animación de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-orange-500/20 animate-pulse"></div>
      
      {/* Efectos de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Contenido principal */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Icono de rayo animado */}
            <div className={`flex-shrink-0 ${animate ? 'animate-bounce' : ''}`}>
              <Zap className="h-5 w-5 text-yellow-300 fill-current" />
            </div>

            
            {/* Texto de la oferta */}
            <div className="flex items-center space-x-2 text-sm sm:text-base font-medium">
              <span className="hidden sm:inline">{offerText}</span>
              <span className="font-bold text-yellow-300 text-lg">
                {discount}% OFF
              </span>
              <span className="hidden md:inline">en tu próxima reserva</span>
            </div>
            
            
            {/* Contador de personas restantes */}
            <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                Solo {remainingSpots} cupos
              </span>
            </div>
          </div>

          {/* Contador regresivo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-black/30 rounded-lg px-3 py-2">
              <Clock className="h-4 w-4 text-yellow-300" />
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-200">Termina en:</span>
                <span className={`font-mono font-bold text-yellow-300 ${animate ? 'animate-pulse' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Botón CTA */}
            <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="hidden sm:inline">¡Reservar Ahora!</span>
              <span className="sm:hidden">¡Reservar!</span>
            </button>
               {/* Icono de emoji */}
           { (emoji) ?  <> 😁</> : <>😢</>}
           
            {/* Botón cerrar */}
            <button
              onClick={handleClose}
              className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/20 transition-all duration-200 ml-2"
              aria-label="Cerrar oferta"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progreso animada */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
        <div 
          className="h-full bg-yellow-400 transition-all duration-1000 ease-linear"
          style={{ 
            width: `${100 - (timeLeft / (timeLimit * 60)) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  );
}

// Estilos adicionales para las animaciones personalizadas
// Estos estilos deben agregarse al archivo globals.css o tailwind.config.ts
/*
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 3s infinite;
}
*/





