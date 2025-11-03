'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertyService, Property, CreatePropertyRequest, UpdatePropertyRequest, getLocationString } from '@/lib/api/properties';
import { adminService } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Home, Loader2, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

/**
 * Página de administración de propiedades para admins
 * Muestra todas las propiedades de la base de datos con opciones de gestión
 */
export default function AdminPropertiesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Opciones de amenidades disponibles
  const availableAmenities = [
    'WiFi', 'Cocina', 'Piscina', 'Aire acondicionado', 'Calefacción',
    'Lavadora', 'Secadora', 'Estacionamiento', 'Terraza', 'Balcón',
    'Jardín', 'Chimenea', 'TV', 'Netflix', 'Gimnasio'
  ];

  // Toggle de amenidad
  const toggleAmenity = (amenity: string) => {
    const currentAmenities = Array.isArray(formData.amenities) ? formData.amenities : [];
    setFormData({
      ...formData,
      amenities: currentAmenities.includes(amenity)
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity]
    });
  };

  // Verificar si es admin - con manejo mejorado para evitar redirecciones prematuras
  useEffect(() => {
    const checkAdmin = async () => {
      setIsVerifyingAdmin(true);
      
      // Esperar a que la autenticación esté lista
      if (!isAuthenticated) {
        console.log('⚠️ [AdminProperties] No autenticado, redirigiendo a login');
        setIsVerifyingAdmin(false);
        router.push('/login');
        return;
      }

      // Si no hay usuario aún, esperar un poco
      if (!user) {
        console.log('⏳ [AdminProperties] Esperando carga del usuario...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!user) {
          console.log('⚠️ [AdminProperties] Usuario no cargado después de espera, redirigiendo a login');
          setIsVerifyingAdmin(false);
          router.push('/login');
          return;
        }
      }

      try {
        console.log('🔍 [AdminProperties] Verificando rol de admin...');
        console.log('🔍 [AdminProperties] Usuario:', { email: user?.email, role: user?.role });
        
        // PRIORIDAD 1: Verificar role directamente del objeto user (viene del backend)
        if (user?.role === 'admin') {
          console.log('✅ [AdminProperties] Usuario es admin según user.role - PERMITIENDO ACCESO');
          setIsAdmin(true);
          setIsVerifyingAdmin(false);
          return; // Permitir acceso
        }
        
        // PRIORIDAD 2: Verificar en localStorage (puede tener datos más actualizados)
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('🔍 [AdminProperties] Verificando localStorage - role:', parsedUser.role);
            
            if (parsedUser.role === 'admin') {
              console.log('✅ [AdminProperties] Usuario es admin según localStorage - PERMITIENDO ACCESO');
              setIsAdmin(true);
              setIsVerifyingAdmin(false);
              return;
            }
          }
        } catch (error) {
          console.log('⚠️ [AdminProperties] Error leyendo localStorage:', error);
        }
        
        // PRIORIDAD 3: Si user.role no está disponible, consultar backend
        if (!user?.role) {
          console.warn('⚠️ [AdminProperties] user.role no está disponible, consultando backend...');
          const response = await adminService.checkAdminRole();
          console.log('📥 [AdminProperties] Respuesta de checkAdminRole:', JSON.stringify(response, null, 2));
          
          if (response.success && response.data?.isAdmin) {
            console.log('✅ [AdminProperties] Usuario es admin según backend - PERMITIENDO ACCESO');
            setIsAdmin(true);
            setIsVerifyingAdmin(false);
            return;
          } else {
            console.log('❌ [AdminProperties] Usuario NO es admin según backend');
          }
        } else {
          console.log(`ℹ️ [AdminProperties] Usuario tiene role="${user.role}" (no es admin)`);
        }
        
        console.log('❌ [AdminProperties] Usuario NO tiene permisos de admin, redirigiendo a home');
        setIsAdmin(false);
        setIsVerifyingAdmin(false);
        router.push('/');
      } catch (error) {
        console.error('💥 [AdminProperties] Error verificando admin:', error);
        
        console.log('❌ [AdminProperties] Error en verificación, redirigiendo a home');
        setIsAdmin(false);
        setIsVerifyingAdmin(false);
        router.push('/');
      }
    };

    if (isAuthenticated) {
      checkAdmin();
    } else {
      setIsVerifyingAdmin(false);
    }
  }, [isAuthenticated, user, router]);

  /**
   * Cargar TODAS las propiedades de la base de datos
   * IMPORTANTE: Esta página es solo para ADMIN - muestra todas las propiedades
   * Endpoint utilizado: GET /api/host/properties (para admin devuelve TODAS las propiedades de TODOS los usuarios)
   * 
   * Esto incluye:
   * - Propiedades creadas por el usuario admin
   * - Propiedades creadas por todos los demás usuarios
   * - Propiedades públicas de la base de datos
   * 
   * Solo se ejecuta cuando:
   * - El usuario está autenticado
   * - El admin está verificado (isAdmin === true)
   * - No se está verificando el admin (isVerifyingAdmin === false)
   */
  useEffect(() => {
    const loadProperties = async () => {
      // No cargar propiedades si:
      // - No está autenticado
      // - Está verificando el admin
      // - No es admin
      if (!isAuthenticated || isVerifyingAdmin || !isAdmin) {
        console.log('⏸️ [AdminProperties] No cargando propiedades:', {
          isAuthenticated,
          isVerifyingAdmin,
          isAdmin
        });
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 [AdminProperties] Iniciando carga de TODAS las propiedades (admin y todos los usuarios)...');
        console.log('🔍 [AdminProperties] Endpoint: GET /api/properties (devuelve TODAS las propiedades de la base de datos)');
        
        // 🔧 FIX: Usar getAllProperties() que devuelve TODAS las propiedades de TODOS los usuarios
        // Este endpoint es público y no filtra por usuario, perfecto para admin
        const allProperties = await propertyService.getAllProperties();
        
        console.log(`✅ [AdminProperties] Propiedades obtenidas del backend: ${allProperties.length}`);
        console.log('📋 [AdminProperties] Detalle de propiedades:', allProperties.map(p => ({
          id: p.id,
          title: p.title,
          city: p.city,
          pricePerNight: p.pricePerNight
        })));
        
        if (allProperties.length === 0) {
          console.warn('⚠️ [AdminProperties] No se encontraron propiedades. Verificar que el backend esté respondiendo correctamente.');
          toast.info('No se encontraron propiedades en la base de datos');
        } else {
          console.log(`✅ [AdminProperties] Cargadas ${allProperties.length} propiedades (de todos los usuarios)`);
        }
        
        // Filtrar por término de búsqueda si existe (filtro local, no afecta la carga del backend)
        let filteredProperties = allProperties;
        if (searchTerm.trim()) {
          const beforeFilter = filteredProperties.length;
          filteredProperties = allProperties.filter(property =>
            property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLocationString(property.location).toLowerCase().includes(searchTerm.toLowerCase())
          );
          console.log(`🔍 [AdminProperties] Filtro aplicado: ${beforeFilter} → ${filteredProperties.length} propiedades`);
        }
        
        setProperties(filteredProperties);
      } catch (error) {
        console.error('💥 [AdminProperties] Error cargando propiedades:', error);
        toast.error('Error al cargar las propiedades. Verifica la conexión con el backend.');
        
        // Mostrar error más detallado en consola
        if (error instanceof Error) {
          console.error('💥 [AdminProperties] Mensaje de error:', error.message);
          console.error('💥 [AdminProperties] Stack:', error.stack);
        }
        
        // Establecer array vacío en caso de error para evitar errores de renderizado
        setProperties([]);
      } finally {
        setIsLoading(false);
        console.log('🏁 [AdminProperties] Carga de propiedades completada');
      }
    };

    loadProperties();
  }, [isAuthenticated, isVerifyingAdmin, isAdmin, searchTerm]);

  // Abrir diálogo para crear nueva propiedad
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
    console.log('📝 [AdminProperties] ============================================');
    console.log('📝 [AdminProperties] EDITANDO PROPIEDAD');
    console.log('📝 [AdminProperties] Property completa:', JSON.stringify(property, null, 2));
    console.log('📝 [AdminProperties] Property.city:', property.city);
    console.log('📝 [AdminProperties] Property.city type:', typeof property.city);
    console.log('📝 [AdminProperties] Property.city trim:', property.city?.trim());
    
    setEditingProperty(property);
    
    // Asegurar que city tenga un valor por defecto si está vacío o undefined
    // Si city está vacío, intentar extraerlo del location si es un objeto
    let cityValue = property.city?.trim() || '';
    
    if (!cityValue && typeof property.location === 'object' && property.location !== null) {
      // Intentar extraer city del objeto location
      cityValue = (property.location as any).city || '';
      console.log('📝 [AdminProperties] City extraído del location object:', cityValue);
    }
    
    // Si aún no hay city, usar un valor por defecto vacío (el usuario debe completarlo)
    if (!cityValue) {
      console.warn('⚠️ [AdminProperties] La propiedad no tiene campo city, se requerirá que el usuario lo complete');
    }
    
    const formDataToSet = {
      title: property.title || '',
      location: getLocationString(property.location) || '',
      city: cityValue,
      pricePerNight: property.pricePerNight || 0,
      propertyType: property.propertyType || 'entire',
      amenities: property.amenities || [],
      instantBook: property.instantBook || false,
      maxGuests: property.maxGuests || 1,
      description: property.description || '',
      imageUrl: property.imageUrl || '',
    };
    
    console.log('📝 [AdminProperties] FormData a establecer:', JSON.stringify(formDataToSet, null, 2));
    
    setFormData(formDataToSet);
    setIsDialogOpen(true);
    
    console.log('📝 [AdminProperties] ============================================');
  };

  // Guardar propiedad (crear o actualizar)
  const handleSaveProperty = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevenir cualquier comportamiento por defecto
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔘 [AdminProperties] ============================================');
    console.log('🔘 [AdminProperties] BOTÓN ACTUALIZAR/CREAR CLICKEADO');
    console.log('🔘 [AdminProperties] Modo:', editingProperty ? 'ACTUALIZAR' : 'CREAR');
    console.log('🔘 [AdminProperties] isSubmitting:', isSubmitting);
    console.log('🔘 [AdminProperties] editingProperty:', editingProperty ? { id: editingProperty.id, title: editingProperty.title } : null);
    console.log('🔘 [AdminProperties] formData actual:', JSON.stringify(formData, null, 2));
    
    // Validar campos requeridos
    console.log('🔍 [AdminProperties] Validando campos...');
    console.log('🔍 [AdminProperties] formData.title:', formData.title, 'trim:', formData.title?.trim());
    console.log('🔍 [AdminProperties] formData.location:', formData.location, 'trim:', formData.location?.trim());
    console.log('🔍 [AdminProperties] formData.city:', formData.city, 'trim:', formData.city?.trim());
    console.log('🔍 [AdminProperties] formData.description:', formData.description, 'trim:', formData.description?.trim());
    console.log('🔍 [AdminProperties] formData.pricePerNight:', formData.pricePerNight);
    console.log('🔍 [AdminProperties] formData.maxGuests:', formData.maxGuests);
    
    if (!formData.title?.trim()) {
      console.error('❌ [AdminProperties] Validación fallida: título requerido');
      console.error('❌ [AdminProperties] formData.title value:', formData.title);
      toast.error('El título es requerido');
      return;
    }
    if (!formData.location?.trim()) {
      console.error('❌ [AdminProperties] Validación fallida: ubicación requerida');
      console.error('❌ [AdminProperties] formData.location value:', formData.location);
      toast.error('La ubicación es requerida');
      return;
    }
    if (!formData.city || !formData.city.trim()) {
      console.error('❌ [AdminProperties] Validación fallida: ciudad requerida');
      console.error('❌ [AdminProperties] formData.city value:', formData.city);
      console.error('❌ [AdminProperties] formData.city type:', typeof formData.city);
      toast.error('La ciudad es requerida. Por favor, completa este campo antes de guardar.');
      return;
    }
    if (!formData.description?.trim()) {
      console.error('❌ [AdminProperties] Validación fallida: descripción requerida');
      toast.error('La descripción es requerida');
      return;
    }
    if (!formData.pricePerNight || formData.pricePerNight <= 0) {
      console.error('❌ [AdminProperties] Validación fallida: precio inválido');
      toast.error('El precio por noche debe ser mayor a 0');
      return;
    }
    if (!formData.maxGuests || formData.maxGuests < 1) {
      console.error('❌ [AdminProperties] Validación fallida: maxGuests inválido');
      toast.error('El número de huéspedes debe ser al menos 1');
      return;
    }
    
    console.log('✅ [AdminProperties] Validación exitosa, procediendo...');

    const defaultImageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    try {
      setIsSubmitting(true);

      if (editingProperty) {
        // Actualizar propiedad existente
        const propertyData: UpdatePropertyRequest = {
          title: formData.title.trim(),
          location: formData.location?.trim(),
          city: formData.city?.trim(),
          pricePerNight: formData.pricePerNight ? Number(formData.pricePerNight) : undefined,
          propertyType: formData.propertyType,
          amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
          instantBook: formData.instantBook,
          maxGuests: formData.maxGuests ? Number(formData.maxGuests) : undefined,
          description: formData.description?.trim(),
          imageUrl: formData.imageUrl?.trim(),
        };

        console.log('📝 [AdminProperties] ============================================');
        console.log('📝 [AdminProperties] ACTUALIZANDO PROPIEDAD');
        console.log('📝 [AdminProperties] ID:', editingProperty.id);
        console.log('📝 [AdminProperties] Título:', formData.title);
        console.log('📝 [AdminProperties] Datos a enviar:', JSON.stringify(propertyData, null, 2));
        
        const response = await propertyService.updateProperty(editingProperty.id, propertyData);
        
        console.log('📥 [AdminProperties] Respuesta del backend:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('✅ [AdminProperties] Propiedad actualizada exitosamente');
          toast.success('Propiedad actualizada exitosamente');
          setIsDialogOpen(false);
          
          // Recargar propiedades usando el mismo método que cargó inicialmente
          // Para admin, getAllProperties() devuelve todas las propiedades de todos los usuarios
          console.log('🔄 [AdminProperties] Recargando lista de propiedades...');
          const updatedProperties = await propertyService.getAllProperties();
          console.log(`✅ [AdminProperties] Propiedades actualizadas: ${updatedProperties.length} propiedades`);
          setProperties(updatedProperties);
        } else {
          console.error('❌ [AdminProperties] Error en respuesta del backend:', response.message);
          toast.error(response.message || 'Error al actualizar la propiedad');
        }
        
        console.log('📝 [AdminProperties] ============================================');
      } else {
        // Crear nueva propiedad
        const propertyData: CreatePropertyRequest = {
          title: formData.title.trim(),
          location: formData.location.trim(),
          city: formData.city.trim(),
          pricePerNight: Number(formData.pricePerNight),
          propertyType: formData.propertyType,
          amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
          instantBook: formData.instantBook,
          maxGuests: Number(formData.maxGuests),
          description: formData.description.trim(),
          imageUrl: formData.imageUrl?.trim() || defaultImageUrl,
        };

        console.log('➕ [AdminProperties] Creando nueva propiedad');
        const response = await propertyService.createProperty(propertyData);
        
        if (response.success) {
          toast.success('Propiedad creada exitosamente');
          setIsDialogOpen(false);
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
          // Recargar propiedades usando el mismo método que cargó inicialmente
          // Para admin, getAllProperties() devuelve todas las propiedades de todos los usuarios
          const updatedProperties = await propertyService.getAllProperties();
          setProperties(updatedProperties);
        } else {
          toast.error(response.message || 'Error al crear la propiedad');
        }
      }
    } catch (error) {
      console.error('💥 [AdminProperties] ============================================');
      console.error('💥 [AdminProperties] ERROR GUARDANDO PROPIEDAD');
      console.error('💥 [AdminProperties] Error:', error);
      
      if (error instanceof Error) {
        console.error('💥 [AdminProperties] Mensaje:', error.message);
        console.error('💥 [AdminProperties] Stack:', error.stack);
        
        // Mostrar error más específico
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          toast.error('No tienes permisos para actualizar esta propiedad');
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          toast.error(
            'Endpoint no encontrado (404). El backend no tiene implementado el endpoint PUT/PATCH para actualizar propiedades. ' +
            'Verifica en Postman cuál es el endpoint correcto y actualiza el código o configura NEXT_PUBLIC_PROPERTIES_UPDATE_ENDPOINT en .env.local',
            { duration: 8000 }
          );
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          toast.error('Error de conexión. Verifica que el backend esté corriendo');
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }
      
      console.error('💥 [AdminProperties] ============================================');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar propiedad
  const handleDeleteProperty = async (propertyId: string, propertyTitle?: string) => {
    console.log('🗑️ [AdminProperties] Intentando eliminar propiedad:', propertyId, propertyTitle);
    
    // Confirmar eliminación
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la propiedad "${propertyTitle || propertyId}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) {
      console.log('❌ [AdminProperties] Eliminación cancelada por el usuario');
      return;
    }

    try {
      console.log('🔍 [AdminProperties] Enviando solicitud de eliminación al backend...');
      console.log('🔍 [AdminProperties] Endpoint: DELETE /api/host/properties/' + propertyId);
      
      setIsLoading(true);
      const response = await propertyService.deleteProperty(propertyId);
      
      console.log('📥 [AdminProperties] Respuesta del backend:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ [AdminProperties] Propiedad eliminada exitosamente');
        toast.success('Propiedad eliminada exitosamente');
        
        // Recargar propiedades
        console.log('🔄 [AdminProperties] Recargando lista de propiedades...');
        const updatedProperties = await propertyService.getAllProperties();
        console.log(`✅ [AdminProperties] Propiedades actualizadas: ${updatedProperties.length} propiedades`);
        setProperties(updatedProperties);
      } else {
        console.error('❌ [AdminProperties] Error en respuesta del backend:', response.message);
        toast.error(response.message || 'Error al eliminar la propiedad');
      }
    } catch (error) {
      console.error('💥 [AdminProperties] Error eliminando propiedad:', error);
      if (error instanceof Error) {
        console.error('💥 [AdminProperties] Mensaje de error:', error.message);
        console.error('💥 [AdminProperties] Stack:', error.stack);
        
        // Mostrar error más específico
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          toast.error('No tienes permisos para eliminar esta propiedad');
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          toast.error('No tienes permisos para eliminar esta propiedad');
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          toast.error(
            'Endpoint no encontrado (404). El backend no tiene implementado el endpoint DELETE para eliminar propiedades. ' +
            'Verifica en Postman cuál es el endpoint correcto y actualiza el código o configura NEXT_PUBLIC_PROPERTIES_DELETE_ENDPOINT en .env.local',
            { duration: 8000 }
          );
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          toast.error('Error de conexión. Verifica que el backend esté corriendo');
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se verifica el admin o mientras carga
  if (isVerifyingAdmin || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // Si no es admin, no mostrar nada (ya se redirigió)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                ← Volver al panel
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Propiedades</h1>
            <Button 
              onClick={handleNewProperty}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Propiedad
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Barra de búsqueda */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar propiedades por título, ciudad o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <CardTitle className="mb-2">No hay propiedades</CardTitle>
              <CardDescription className="mb-4">
                {searchTerm ? 'No se encontraron propiedades con ese criterio' : 'No hay propiedades registradas en la base de datos'}
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Propiedades</CardTitle>
                <CardDescription>
                  Total: {properties.length} propiedad(es)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Precio/Noche</TableHead>
                        <TableHead>Huéspedes</TableHead>
                        <TableHead>Calificación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>
                            <img
                              src={property.imageUrl || 'https://via.placeholder.com/80x60'}
                              alt={property.title}
                              className="w-20 h-16 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{property.title}</div>
                            <div className="text-sm text-gray-500">{property.propertyType}</div>
                          </TableCell>
                          <TableCell>
                            <div>{property.city}</div>
                            <div className="text-sm text-gray-500">{getLocationString(property.location)}</div>
                          </TableCell>
                          <TableCell>€{property.pricePerNight}</TableCell>
                          <TableCell>{property.maxGuests}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span>⭐ {property.rating}</span>
                              <span className="text-xs text-gray-500 ml-1">({property.reviewCount})</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProperty(property)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🔘 [AdminProperties] Botón eliminar clickeado para propiedad:', property.id, property.title);
                                  handleDeleteProperty(property.id, property.title);
                                }}
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Dialog para editar propiedad */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? 'Editar Propiedad' : 'Crear Nueva Propiedad'}
            </DialogTitle>
            <DialogDescription>
              {editingProperty 
                ? 'Modifica los datos de la propiedad'
                : 'Completa el formulario para crear una nueva propiedad'}
            </DialogDescription>
          </DialogHeader>
          
          <form 
            onSubmit={(e) => {
              console.log('📋 [AdminProperties] Form onSubmit capturado');
              e.preventDefault();
              e.stopPropagation();
              console.log('📋 [AdminProperties] Form submit prevenido, llamando handleSaveProperty manualmente');
              handleSaveProperty();
            }}
            className="space-y-4 mt-4"
          >
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  placeholder="Ej: Madrid"
                />
              </div>
              <div>
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                placeholder="Describe la propiedad..."
                rows={4}
              />
            </div>

            {/* Sección de Amenidades */}
            <div>
              <Label className="mb-3 block">Amenidades</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg border">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={Array.isArray(formData.amenities) && formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="ml-2 text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
              {Array.isArray(formData.amenities) && formData.amenities.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
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
                placeholder="https://ejemplo.com/imagen.jpg"
              />
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
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <button
                type="button"
                onClick={(e) => {
                  console.log('🖱️ [AdminProperties] ============================================');
                  console.log('🖱️ [AdminProperties] CLICK EN BOTÓN ACTUALIZAR/CREAR');
                  console.log('🖱️ [AdminProperties] Event:', e);
                  console.log('🖱️ [AdminProperties] isSubmitting:', isSubmitting);
                  console.log('🖱️ [AdminProperties] disabled?', isSubmitting);
                  console.log('🖱️ [AdminProperties] editingProperty:', editingProperty);
                  
                  if (isSubmitting) {
                    console.warn('⚠️ [AdminProperties] Botón deshabilitado (isSubmitting=true), ignorando click');
                    return;
                  }
                  
                  console.log('✅ [AdminProperties] Ejecutando handleSaveProperty...');
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveProperty(e);
                }}
                disabled={isSubmitting}
                className={`flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  editingProperty ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
