'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertyService, Property, CreatePropertyRequest, getLocationString } from '@/lib/api/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Home, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import PropertyRatingDisplay from '@/components/PropertyRatingDisplay';

/**
 * Página de gestión de propiedades del usuario
 * Permite crear, modificar y eliminar propiedades propias
 */
export default function MyPropertiesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario de propiedad
  const [formData, setFormData] = useState<CreatePropertyRequest>({
    title: '',
    location: '',
    city: '',
    pricePerNight: 0,
    propertyType: 'entire',
    amenities: [],
    instantBook: false,
    maxGuests: 1,
    description: '',
    imageUrl: '',
  });

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  /**
   * Cargar SOLO las propiedades del usuario autenticado
   * IMPORTANTE: Esta página muestra las propiedades del usuario actual, sin importar su rol.
   * Los admins tienen un apartado separado "Gestión de Propiedades" en el menú para gestionar todas las propiedades.
   */
  useEffect(() => {
    const loadProperties = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        console.log(`🔍 [MyProperties] Cargando propiedades del usuario: ${user?.name || user?.email}`);
        const userProperties = await propertyService.getMyProperties();
        
        // Asegurar que siempre sea un array
        if (Array.isArray(userProperties)) {
          console.log(`✅ [MyProperties] Propiedades del usuario cargadas: ${userProperties.length} (solo las creadas por este usuario)`);
          setProperties(userProperties);
        } else {
          console.warn('⚠️ [MyProperties] Respuesta no es un array:', userProperties);
          setProperties([]);
          toast.error('Error: formato de datos inesperado del servidor');
        }
      } catch (error) {
        console.error('Error cargando propiedades:', error);
        setProperties([]); // Asegurar array vacío en caso de error
        toast.error('Error al cargar tus propiedades');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [isAuthenticated, user]);

  // Opciones de amenidades disponibles (mismas que en la página principal)
  const availableAmenities = [
    'WiFi', 'Cocina', 'Piscina', 'Aire acondicionado', 'Calefacción',
    'Lavadora', 'Secadora', 'Estacionamiento', 'Terraza', 'Balcón',
    'Jardín', 'Chimenea', 'TV', 'Netflix', 'Gimnasio'
  ];

  // Toggle de amenidad
  const toggleAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity]
    });
  };

  // Abrir diálogo para nueva propiedad
  const handleNewProperty = () => {
    setEditingProperty(null);
    setFormData({
      title: '',
      location: '',
      city: '',
      pricePerNight: 0,
      propertyType: 'entire',
      amenities: [],
      instantBook: false,
      maxGuests: 1,
      description: '',
      imageUrl: '',
    });
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar propiedad
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      location: getLocationString(property.location),
      city: property.city,
      pricePerNight: property.pricePerNight,
      propertyType: property.propertyType,
      amenities: property.amenities,
      instantBook: property.instantBook,
      maxGuests: property.maxGuests,
      description: property.description,
      imageUrl: property.imageUrl,
    });
    setIsDialogOpen(true);
  };

  // Guardar propiedad (crear o actualizar)
  const handleSaveProperty = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevenir cualquier comportamiento por defecto
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('🖱️ [MyProperties] Botón Crear/Actualizar clickeado');
    console.log('📋 [MyProperties] Estado del formulario:', formData);
    console.log('📋 [MyProperties] Editando propiedad?', !!editingProperty);

    // Validar campos requeridos
    if (!formData.title?.trim()) {
      console.warn('⚠️ [MyProperties] Validación fallida: título faltante');
      toast.error('El título es requerido');
      return;
    }
    if (!formData.location?.trim()) {
      toast.error('La ubicación es requerida');
      return;
    }
    if (!formData.city?.trim()) {
      toast.error('La ciudad es requerida');
      return;
    }
    if (!formData.description?.trim()) {
      toast.error('La descripción es requerida');
      return;
    }
    if (!formData.pricePerNight || formData.pricePerNight <= 0) {
      toast.error('El precio por noche debe ser mayor a 0');
      return;
    }
    if (!formData.maxGuests || formData.maxGuests < 1) {
      toast.error('El número de huéspedes debe ser al menos 1');
      return;
    }

    // Preparar datos para enviar
    // Si no hay URL de imagen, usar una imagen placeholder por defecto
    const defaultImageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    const propertyData = {
      title: formData.title.trim(),
      location: formData.location.trim(),
      city: formData.city.trim(),
      pricePerNight: Number(formData.pricePerNight),
      propertyType: formData.propertyType,
      amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
      instantBook: Boolean(formData.instantBook),
      maxGuests: Number(formData.maxGuests),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl?.trim() || defaultImageUrl,
    };

    console.log('📝 [MyProperties] Datos a enviar:', propertyData);

    try {
      setIsSubmitting(true);

      if (editingProperty) {
        // Actualizar propiedad existente
        console.log('🔄 [MyProperties] Actualizando propiedad:', editingProperty.id);
        const response = await propertyService.updateProperty(editingProperty.id, propertyData);
        
        console.log('📥 [MyProperties] Respuesta de actualización:', response);
        
        if (response.success) {
          toast.success('Propiedad actualizada exitosamente');
          setIsDialogOpen(false);
          // Recargar propiedades
          const updatedProperties = await propertyService.getMyProperties();
          setProperties(updatedProperties);
        } else {
          console.error('❌ [MyProperties] Error en actualización:', response);
          toast.error(response.message || 'Error al actualizar la propiedad');
        }
      } else {
        // Crear nueva propiedad
        console.log('➕ [MyProperties] Creando nueva propiedad');
        const response = await propertyService.createProperty(propertyData);
        
        console.log('📥 [MyProperties] Respuesta de creación:', response);
        
        if (response.success) {
          toast.success('Propiedad creada exitosamente');
          setIsDialogOpen(false);
          // Limpiar formulario
          setFormData({
            title: '',
            location: '',
            city: '',
            pricePerNight: 0,
            propertyType: 'entire',
            amenities: [],
            instantBook: false,
            maxGuests: 1,
            description: '',
            imageUrl: '',
          });
          // Recargar propiedades
          const updatedProperties = await propertyService.getMyProperties();
          setProperties(updatedProperties);
        } else {
          console.error('❌ [MyProperties] Error en creación:', response);
          toast.error(response.message || 'Error al crear la propiedad');
        }
      }
    } catch (error) {
      console.error('💥 [MyProperties] Error guardando propiedad:', error);
      if (error instanceof Error) {
        console.error('💥 [MyProperties] Mensaje de error:', error.message);
        console.error('💥 [MyProperties] Stack:', error.stack);
        
        // Mostrar error más específico
        if (error.message.includes('fetch') || error.message.includes('network')) {
          toast.error('Error de conexión. Verifica que el backend esté corriendo en http://localhost:5000');
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          toast.error('No tienes permisos para crear propiedades');
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error('Error de conexión con el servidor. Verifica la consola para más detalles');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar propiedad
  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
      return;
    }

    try {
      const response = await propertyService.deleteProperty(propertyId);
      
      if (response.success) {
        toast.success('Propiedad eliminada exitosamente');
        // Recargar propiedades
        const updatedProperties = await propertyService.getMyProperties();
        setProperties(updatedProperties);
      } else {
        toast.error(response.message || 'Error al eliminar la propiedad');
      }
    } catch (error) {
      console.error('Error eliminando propiedad:', error);
      toast.error('Error de conexión con el servidor');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-200"
              >
                ← Volver al inicio
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-white">Mis Propiedades</h1>
            <Button 
              onClick={handleNewProperty}
              className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Propiedad
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog para crear/editar propiedad */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingProperty 
                ? 'Modifica los datos de tu propiedad' 
                : 'Completa la información de tu nueva propiedad'}
            </DialogDescription>
          </DialogHeader>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📝 [MyProperties] Form submit preventido');
                  }}
                  className="space-y-4 mt-4"
                >
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Ej: Hermosa casa en la playa"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Ej: Madrid"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Ubicación *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Ej: Centro de Madrid"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePerNight">Precio por noche (€) *</Label>
                      <Input
                        id="pricePerNight"
                        type="number"
                        value={formData.pricePerNight}
                        onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="50"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxGuests">Máximo de huéspedes *</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        value={formData.maxGuests}
                        onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="4"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="propertyType">Tipo de propiedad *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value: 'entire' | 'private' | 'shared') => 
                        setFormData({ ...formData, propertyType: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 text-white">
                        <SelectItem value="entire">Propiedad completa</SelectItem>
                        <SelectItem value="private">Habitación privada</SelectItem>
                        <SelectItem value="shared">Habitación compartida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Describe tu propiedad..."
                      rows={4}
                    />
                  </div>

                  {/* Sección de Amenidades */}
                  <div>
                    <Label className="mb-3 block">Amenidades</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      {availableAmenities.map((amenity) => (
                        <label key={amenity} className="flex items-center cursor-pointer hover:bg-slate-600/50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="h-4 w-4 text-[#FF385C] focus:ring-[#FF385C] border-slate-500 rounded cursor-pointer"
                          />
                          <span className="ml-2 text-sm text-slate-300">{amenity}</span>
                        </label>
                      ))}
                    </div>
                    {formData.amenities.length > 0 && (
                      <p className="text-xs text-slate-400 mt-2">
                        {formData.amenities.length} amenidad(es) seleccionada(s)
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">URL de imagen</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="https://ejemplo.com/imagen.jpg (opcional)"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Si no proporcionas una URL, se usará una imagen por defecto
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="instantBook"
                      checked={formData.instantBook}
                      onChange={(e) => setFormData({ ...formData, instantBook: e.target.checked })}
                      className="rounded cursor-pointer"
                    />
                    <Label htmlFor="instantBook" className="cursor-pointer">
                      Reserva instantánea
                    </Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔘 [MyProperties] Botón clickeado, llamando handleSaveProperty');
                        console.log('🔘 [MyProperties] isSubmitting:', isSubmitting);
                        console.log('🔘 [MyProperties] editingProperty:', editingProperty);
                        if (!isSubmitting) {
                          handleSaveProperty(e);
                        } else {
                          console.warn('⚠️ [MyProperties] Botón deshabilitado, ya hay una operación en curso');
                        }
                      }}
                      disabled={isSubmitting}
                      className="bg-[#FF385C] hover:bg-[#E31C5F] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        editingProperty ? 'Actualizar' : 'Crear'
                      )}
                    </Button>
                  </div>
                </form>
        </DialogContent>
      </Dialog>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF385C]" />
          </div>
        ) : properties.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <Home className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <CardTitle className="text-white mb-2">No tienes propiedades aún</CardTitle>
              <CardDescription className="text-slate-400 mb-4">
                Crea tu primera propiedad para empezar a recibir reservas
              </CardDescription>
              <Button 
                onClick={handleNewProperty}
                className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Propiedad
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(properties) && properties.length > 0 ? (
              properties.map((property) => (
              <Card key={property.id} className="bg-slate-800 border-slate-700">
                <div className="relative">
                  <img
                    src={property.imageUrl || 'https://via.placeholder.com/400x250'}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditProperty(property)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProperty(property.id)}
                      className="bg-red-600/90 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-white text-lg">{property.title}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {property.city}, {getLocationString(property.location)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div>€{property.pricePerNight} por noche</div>
                    <div>{property.maxGuests} huéspedes máximo</div>
                    <PropertyRatingDisplay
                      propertyId={property.id}
                      defaultRating={0}
                      defaultReviewCount={0}
                      size="sm"
                      className="text-slate-300"
                    />
                  </div>
                </CardContent>
              </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-slate-400">No se pudieron cargar las propiedades. Verifica la consola para más detalles.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

