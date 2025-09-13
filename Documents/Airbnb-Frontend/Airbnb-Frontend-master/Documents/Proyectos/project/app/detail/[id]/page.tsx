import PropertyDetail from '@/components/PropertyDetail';
import { mockProperties } from '@/lib/mockData';

// Interfaz para las props de la página de detalle
interface PropertyPageProps {
  params: {
    id: string;
  };
}

// Función requerida para generar rutas estáticas
export async function generateStaticParams() {
  // Generar todas las rutas posibles basadas en los IDs de las propiedades mock
  return mockProperties.map((property) => ({
    id: property.id,
  }));
}

// Página de detalle de propiedad con ruta /detail/[id]
const PropertyPage = ({ params }: PropertyPageProps) => {
  return (
    <div className="property-page min-h-screen bg-gray-50">
      <PropertyDetail propertyId={params.id} />
    </div>
  );
};

export default PropertyPage;
