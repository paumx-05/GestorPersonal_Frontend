'use client';

import { useState } from 'react';
import OfferTopBar from './OfferTopBar';

/**
 * OfferTopBarExamples - Ejemplos de diferentes configuraciones del TopBar
 * Útil para testing y demostración de variaciones
 */
export default function OfferTopBarExamples() {
  const [activeExample, setActiveExample] = useState<string | null>('flash');

  const examples = [
    {
      id: 'flash',
      name: 'Oferta Flash',
      props: {
        discount: 45,
        remainingSpots: 15,
        timeLimit: 120,
        offerText: '¡Oferta Flash! Reserva ahora y ahorra'
      }
    },
    {
      id: 'weekend',
      name: 'Oferta Fin de Semana',
      props: {
        discount: 30,
        remainingSpots: 25,
        timeLimit: 180,
        offerText: '¡Especial Fin de Semana!'
      }
    },
    {
      id: 'lastminute',
      name: 'Última Hora',
      props: {
        discount: 60,
        remainingSpots: 8,
        timeLimit: 60,
        offerText: '¡Última hora! Solo quedan pocas horas'
      }
    },
    {
      id: 'earlybird',
      name: 'Madrugador',
      props: {
        discount: 25,
        remainingSpots: 50,
        timeLimit: 300,
        offerText: '¡Early Bird! Reserva temprano y ahorra'
      }
    }
  ];

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">
        Ejemplos de TopBar de Ofertas
      </h1>
      
      {/* Controles */}
      <div className="flex flex-wrap gap-3 mb-8">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => setActiveExample(activeExample === example.id ? null : example.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeExample === example.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {example.name}
          </button>
        ))}
        <button
          onClick={() => setActiveExample(null)}
          className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Ocultar Todo
        </button>
      </div>

      {/* Ejemplos */}
      <div className="space-y-4">
        {examples.map((example) => (
          activeExample === example.id && (
            <div key={example.id} className="border border-slate-600 rounded-lg overflow-hidden">
              <div className="bg-slate-700 px-4 py-2">
                <h3 className="text-white font-semibold">{example.name}</h3>
              </div>
              <OfferTopBar 
                {...example.props}
                onClose={() => setActiveExample(null)}
              />
            </div>
          )
        ))}
      </div>

      {/* Documentación */}
      <div className="bg-slate-700 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Propiedades del Componente</h2>
        <div className="space-y-3 text-slate-300">
          <div><code className="bg-slate-800 px-2 py-1 rounded">discount</code> - Porcentaje de descuento (número)</div>
          <div><code className="bg-slate-800 px-2 py-1 rounded">remainingSpots</code> - Cupos restantes (número)</div>
          <div><code className="bg-slate-800 px-2 py-1 rounded">timeLimit</code> - Tiempo límite en minutos (número)</div>
          <div><code className="bg-slate-800 px-2 py-1 rounded">offerText</code> - Texto personalizado de la oferta (string)</div>
          <div><code className="bg-slate-800 px-2 py-1 rounded">onClose</code> - Función callback al cerrar (opcional)</div>
        </div>
      </div>

      {/* Código de ejemplo */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">Ejemplo de uso:</h3>
        <pre className="text-slate-300 text-sm overflow-x-auto">
{`<OfferTopBar 
  discount={45}
  remainingSpots={15}
  timeLimit={120}
  offerText="¡Oferta Flash! Reserva ahora y ahorra"
  onClose={() => console.log('TopBar cerrado')}
/>`}
        </pre>
      </div>
    </div>
  );
}





