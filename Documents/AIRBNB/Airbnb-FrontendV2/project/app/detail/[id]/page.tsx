import PropertyDetail from '@/components/PropertyDetail';
import Header from '@/components/Header';
import { propertyService } from '@/lib/api/properties';

// Interfaz para las props de la página de detalle
interface PropertyPageProps {
  params: {
    id: string;
  };
}

// Función requerida para generar rutas estáticas
export async function generateStaticParams() {
  try {
    // Intentar obtener propiedades del backend
    const properties = await propertyService.getAllProperties();
    
    if (properties.length > 0) {
      console.log('✅ [generateStaticParams] Propiedades obtenidas del backend:', properties.length);
      return properties.map((property) => ({
        id: property.id,
      }));
    } else {
      console.log('⚠️ [generateStaticParams] Sin propiedades del backend, usando IDs por defecto');
      // Fallback con algunos IDs por defecto
      return [
        { id: 'madrid-1' },
        { id: 'barcelona-1' },
        { id: 'valencia-1' }
      ];
    }
  } catch (error) {
    console.error('💥 [generateStaticParams] Error obteniendo propiedades:', error);
    // Fallback con algunos IDs por defecto
    return [
      { id: 'madrid-1' },
      { id: 'barcelona-1' },
      { id: 'valencia-1' }
    ];
  }
}

// Página de detalle de propiedad con ruta /detail/[id]
const PropertyPage = ({ params }: PropertyPageProps) => {
  return (
    <div className="property-page min-h-screen bg-gray-50">
      {/* Header principal presente en todas las páginas */}
      <Header />
      
      {/* Contenido específico de la página de detalle */}
      <PropertyDetail propertyId={params.id} />
    </div>
  );
};

export default PropertyPage;
