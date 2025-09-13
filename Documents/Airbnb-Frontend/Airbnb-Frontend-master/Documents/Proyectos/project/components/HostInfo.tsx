'use client';

// Interfaz para las props del componente de información del host
interface HostInfoProps {
  host: {
    name: string;
    avatar: string;
    isSuperhost: boolean;
  };
  description: string;
  amenities: string[];
}

// Componente de información del host y descripción de la propiedad
const HostInfo = ({ host, description, amenities }: HostInfoProps) => {
  return (
    <div className="space-y-8">
      {/* Información del host */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={host.avatar} 
            alt={`Avatar de ${host.name}`}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Anfitrión: {host.name}
            </h3>
            {host.isSuperhost && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium text-gray-700">Superhost</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Descripción de la propiedad */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Acerca de este lugar</h3>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Amenidades */}
      <div className="border-b border-gray-200 pb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">¿Qué incluye este lugar?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                {/* Iconos básicos para diferentes amenidades */}
                {amenity.toLowerCase().includes('wifi') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.076 13.308-5.076 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05c-2.829-2.829-7.413-2.829-10.242 0a1 1 0 01-1.414-1.414c3.617-3.617 9.483-3.617 13.07 0a1 1 0 01-1.414 1.414zM12.12 13.88c-1.41-1.41-3.7-1.41-5.11 0a1 1 0 01-1.415-1.415c2.123-2.123 5.567-2.123 7.69 0a1 1 0 01-1.415 1.415zM9 16a1 1 0 102 0 1 1 0 00-2 0z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('cocina') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('piscina') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10l-2.293-2.293a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('aire') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('tv') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.666.804 4.348a1 1 0 01-1.97.364l-.37-2.008H7.22l-.37 2.008a1 1 0 01-1.97-.364l.804-4.348L5.22 15H5a2 2 0 01-2-2V5zm5.77 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('terraza') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('estacionamiento') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('jardín') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('lavadora') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('gimnasio') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('chimenea') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('netflix') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('calefacción') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('vista') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {amenity.toLowerCase().includes('balcón') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                )}
                {/* Icono por defecto para amenidades no reconocidas */}
                {!amenity.toLowerCase().includes('wifi') && 
                 !amenity.toLowerCase().includes('cocina') && 
                 !amenity.toLowerCase().includes('piscina') && 
                 !amenity.toLowerCase().includes('aire') && 
                 !amenity.toLowerCase().includes('tv') && 
                 !amenity.toLowerCase().includes('terraza') && 
                 !amenity.toLowerCase().includes('estacionamiento') && 
                 !amenity.toLowerCase().includes('jardín') && 
                 !amenity.toLowerCase().includes('lavadora') && 
                 !amenity.toLowerCase().includes('gimnasio') && 
                 !amenity.toLowerCase().includes('chimenea') && 
                 !amenity.toLowerCase().includes('netflix') && 
                 !amenity.toLowerCase().includes('calefacción') && 
                 !amenity.toLowerCase().includes('vista') && 
                 !amenity.toLowerCase().includes('balcón') && (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-gray-700">{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Políticas de cancelación</h3>
        <p className="text-gray-700">
          Cancelación gratuita hasta 24 horas antes del check-in. Después de eso, se cobrará el 50% del precio por noche.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-900">Reglas de la casa</h3>
        <ul className="text-gray-700 space-y-2">
          <li>• No fumar</li>
          <li>• No se permiten mascotas</li>
          <li>• Respetar el horario de silencio (22:00 - 08:00)</li>
          <li>• Máximo {amenities.length > 0 ? 'el número de huéspedes indicado' : '4 huéspedes'}</li>
        </ul>
      </div>
    </div>
  );
};

export default HostInfo;
