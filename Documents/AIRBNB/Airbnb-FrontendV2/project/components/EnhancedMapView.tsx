'use client';

import { useState } from 'react';
import { Minus, Plus, MapPin, Navigation } from 'lucide-react';

/**
 * Enhanced Map View Component - Versión mejorada del mapa con más detalles
 * Incluye más elementos visuales y mejor interactividad
 */

const enhancedMapProperties = [
  { id: '1', price: '$89', x: '18%', y: '28%', type: 'apartment' },
  { id: '2', price: '$156', x: '32%', y: '42%', type: 'house' },
  { id: '3', price: '$203', x: '45%', y: '35%', type: 'villa' },
  { id: '4', price: '$127', x: '58%', y: '52%', type: 'apartment' },
  { id: '5', price: '$178', x: '72%', y: '38%', type: 'house' },
  { id: '6', price: '$95', x: '25%', y: '65%', type: 'apartment' },
  { id: '7', price: '$245', x: '65%', y: '25%', type: 'villa' },
  { id: '8', price: '$134', x: '80%', y: '58%', type: 'house' },
];

export default function EnhancedMapView() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const getPropertyColor = (type: string) => {
    switch (type) {
      case 'villa': return 'bg-purple-500';
      case 'house': return 'bg-blue-500';
      case 'apartment': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative h-full bg-slate-700 rounded-xl overflow-hidden shadow-2xl">
      {/* Enhanced Map Background */}
      <div 
        className="w-full h-full bg-cover bg-center relative transition-transform duration-300"
        style={{
          transform: `scale(${zoom})`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'%3E%3Cdefs%3E%3CradialGradient id='cityGlow' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23F0F9FF'/%3E%3Cstop offset='100%25' stop-color='%23E0F2FE'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23cityGlow)'/%3E%3C!-- Calles principales con sombra --%3E%3Cpath d='M0,150 L1000,150' stroke='%23CBD5E1' stroke-width='10' opacity='0.9'/%3E%3Cpath d='M0,148 L1000,148' stroke='%23F1F5F9' stroke-width='6'/%3E%3Cpath d='M0,300 L1000,300' stroke='%23CBD5E1' stroke-width='14' opacity='0.9'/%3E%3Cpath d='M0,298 L1000,298' stroke='%23F1F5F9' stroke-width='10'/%3E%3Cpath d='M0,450 L1000,450' stroke='%23CBD5E1' stroke-width='10' opacity='0.9'/%3E%3Cpath d='M0,448 L1000,448' stroke='%23F1F5F9' stroke-width='6'/%3E%3Cpath d='M200,0 L200,600' stroke='%23CBD5E1' stroke-width='12' opacity='0.9'/%3E%3Cpath d='M202,0 L202,600' stroke='%23F1F5F9' stroke-width='8'/%3E%3Cpath d='M400,0 L400,600' stroke='%23CBD5E1' stroke-width='10' opacity='0.8'/%3E%3Cpath d='M402,0 L402,600' stroke='%23F1F5F9' stroke-width='6'/%3E%3Cpath d='M600,0 L600,600' stroke='%23CBD5E1' stroke-width='12' opacity='0.9'/%3E%3Cpath d='M602,0 L602,600' stroke='%23F1F5F9' stroke-width='8'/%3E%3Cpath d='M800,0 L800,600' stroke='%23CBD5E1' stroke-width='10' opacity='0.8'/%3E%3Cpath d='M802,0 L802,600' stroke='%23F1F5F9' stroke-width='6'/%3E%3C!-- Parques con detalles --%3E%3Crect x='50' y='50' width='120' height='80' fill='%2322C55E' opacity='0.4' rx='12'/%3E%3Ccircle cx='110' cy='90' r='15' fill='%2316A34A' opacity='0.6'/%3E%3Ccircle cx='80' cy='70' r='8' fill='%2316A34A' opacity='0.5'/%3E%3Ccircle cx='140' cy='110' r='12' fill='%2316A34A' opacity='0.5'/%3E%3Crect x='750' y='400' width='200' height='150' fill='%2322C55E' opacity='0.4' rx='15'/%3E%3Ccircle cx='850' cy='475' r='20' fill='%2316A34A' opacity='0.6'/%3E%3Ccircle cx='800' cy='450' r='12' fill='%2316A34A' opacity='0.5'/%3E%3Ccircle cx='900' cy='520' r='15' fill='%2316A34A' opacity='0.5'/%3E%3Crect x='300' y='200' width='150' height='100' fill='%2322C55E' opacity='0.4' rx='10'/%3E%3Ccircle cx='375' cy='250' r='18' fill='%2316A34A' opacity='0.6'/%3E%3C!-- Cuerpos de agua mejorados --%3E%3Cellipse cx='150' cy='450' rx='90' ry='50' fill='%233B82F6' opacity='0.5'/%3E%3Cellipse cx='150' cy='445' rx='70' ry='35' fill='%232563EB' opacity='0.3'/%3E%3Cpath d='M500,500 Q600,480 700,500 Q800,520 900,500' stroke='%233B82F6' stroke-width='25' fill='none' opacity='0.4'/%3E%3Cpath d='M500,495 Q600,475 700,495 Q800,515 900,495' stroke='%232563EB' stroke-width='15' fill='none' opacity='0.3'/%3E%3C!-- Edificios con sombras --%3E%3Crect x='378' y='278' width='44' height='44' fill='%236B7280' opacity='0.8' rx='6'/%3E%3Crect x='380' y='280' width='40' height='40' fill='%23374151' opacity='0.9' rx='4'/%3E%3Crect x='578' y='128' width='64' height='44' fill='%236B7280' opacity='0.8' rx='6'/%3E%3Crect x='580' y='130' width='60' height='40' fill='%23374151' opacity='0.9' rx='4'/%3E%3Crect x='178' y='178' width='39' height='39' fill='%236B7280' opacity='0.8' rx='6'/%3E%3Crect x='180' y='180' width='35' height='35' fill='%23374151' opacity='0.9' rx='4'/%3E%3C!-- Puntos de inter\u00e9s --%3E%3Ccircle cx='350' cy='100' r='8' fill='%23EF4444' opacity='0.8'/%3E%3Ccircle cx='650' cy='350' r='8' fill='%23EF4444' opacity='0.8'/%3E%3Ccircle cx='150' cy='300' r='8' fill='%23F59E0B' opacity='0.8'/%3E%3Ccircle cx='850' cy='200' r='8' fill='%23F59E0B' opacity='0.8'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Overlay de profundidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10"></div>

        {/* Property Markers con tipos */}
        {enhancedMapProperties.map((property) => (
          <div key={property.id} className="absolute" style={{ left: property.x, top: property.y }}>
            {/* Sombra del marcador */}
            <div className="absolute top-1 left-1 w-full h-full rounded-full bg-black/20 transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Marcador principal */}
            <button
              className={`relative transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-full text-sm font-bold transition-all duration-300 hover:scale-110 shadow-xl ${
                selectedProperty === property.id
                  ? `${getPropertyColor(property.type)} text-white border-2 border-white ring-4 ring-white/30`
                  : 'bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedProperty(
                selectedProperty === property.id ? null : property.id
              )}
            >
              {property.price}
            </button>

            {/* Indicador de tipo de propiedad */}
            {selectedProperty === property.id && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        ))}

        {/* Map Controls mejorados */}
        <div className="absolute top-4 right-4 flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          <button 
            className="p-3 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100"
            onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          >
            <Plus className="h-5 w-5 text-gray-700" />
          </button>
          <button 
            className="p-3 hover:bg-blue-50 transition-colors duration-200"
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          >
            <Minus className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Botón de centrar mapa */}
        <button className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:bg-gray-50">
          <Navigation className="h-5 w-5 text-gray-700" />
        </button>

        {/* Leyenda */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2">Tipos de Propiedades</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Villa</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Casa</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Apartamento</span>
            </div>
          </div>
        </div>

        {/* Map attribution mejorado */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200">
          © 2024 Enhanced Map
        </div>
      </div>
    </div>
  );
}





