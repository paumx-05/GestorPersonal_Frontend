import { Request, Response } from 'express';
import { getPropertyById, searchProperties, findUserById } from '../../models';
import { HostPropertyModel } from '../../models/schemas/HostSchema';
import { PropertyModel } from '../../models/schemas/PropertySchema';

// GET /api/properties - Obtener todas las propiedades activas (público)
export const getAllProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    // IMPORTANTE: Ahora todas las propiedades se guardan en la colección 'properties'
    // cuando se crean (tanto desde host como desde admin).
    // Por lo tanto, solo necesitamos obtener de una colección para evitar duplicados.
    
    // Obtener propiedades de PropertyModel (colección 'properties')
    // Esta colección contiene todas las propiedades, incluyendo las creadas por hosts
    const propertyResult = await searchProperties({
      limit: 10000, // Límite muy alto para obtener todas
      offset: 0
    });

    // Obtener también propiedades de host_properties que NO estén en properties
    // (solo para propiedades antiguas que no se migraron)
    const hostProperties = await HostPropertyModel.find({
      $or: [
        { isActive: true },
        { isActive: { $exists: false } },
        { status: 'active' }
      ]
    })
    .limit(10000)
    .sort({ createdAt: -1 });

    // Convertir HostProperty a formato Property y verificar que no estén duplicadas
    const convertedHostProperties = hostProperties
      .map((hp: any) => {
        // Convertir location de string a objeto si es necesario
        let locationObj: any;
        try {
          locationObj = typeof hp.location === 'string' 
            ? { address: hp.location, city: hp.location, country: '' }
            : hp.location;
        } catch {
          locationObj = { address: hp.location || '', city: hp.location || '', country: '' };
        }

        return {
          _id: hp._id.toString(),
          id: hp._id.toString(),
          title: hp.title,
          description: hp.description,
          price: hp.pricePerNight || 0,
          pricePerNight: hp.pricePerNight || 0,
          location: locationObj,
          propertyType: hp.propertyType,
          maxGuests: hp.maxGuests,
          bedrooms: hp.bedrooms || 0,
          bathrooms: hp.bathrooms || 0,
          amenities: hp.amenities || [],
          images: hp.images || [],
          hostId: hp.hostId,
          host: undefined,
          isActive: hp.isActive !== false,
          rating: hp.rating || 0,
          reviewCount: hp.reviewCount || 0,
          instantBook: hp.instantBook || false,
          createdAt: hp.createdAt?.toISOString ? hp.createdAt.toISOString() : hp.createdAt,
          updatedAt: hp.updatedAt?.toISOString ? hp.updatedAt.toISOString() : hp.updatedAt
        };
      })
      // Filtrar duplicados: si ya existe una propiedad con el mismo título y hostId en properties, no incluirla
      .filter((hp: any) => {
        const existsInProperties = (propertyResult.properties || []).some((p: any) => 
          p.title === hp.title && 
          (p.hostId === hp.hostId || p.host?.id === hp.hostId)
        );
        return !existsInProperties;
      });

    // Combinar propiedades, dando prioridad a las de 'properties'
    const allProperties = [
      ...(propertyResult.properties || []),
      ...convertedHostProperties
    ];

    // Filtrar solo propiedades activas
    const activeProperties = allProperties.filter((prop: any) => {
      return prop.isActive !== false;
    });

    // Eliminar duplicados por título + hostId (más robusto que solo por ID)
    const uniqueProperties = activeProperties.reduce((acc: any[], prop: any) => {
      const propKey = `${prop.title}_${prop.hostId || prop.host?.id || 'unknown'}`;
      const exists = acc.some((p: any) => {
        const pKey = `${p.title}_${p.hostId || p.host?.id || 'unknown'}`;
        return pKey === propKey || p.id === prop.id || p._id === prop._id || p._id === prop.id || p.id === prop._id;
      });
      if (!exists) {
        acc.push(prop);
      }
      return acc;
    }, []);

    console.log(`✅ Propiedades obtenidas: ${uniqueProperties.length} únicas (${propertyResult.properties?.length || 0} de properties, ${convertedHostProperties.length} de host_properties sin duplicar)`);

    res.json({
      success: true,
      data: {
        properties: uniqueProperties,
        total: uniqueProperties.length
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo propiedades:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Error obteniendo propiedades',
        details: error.message || 'Error desconocido'
      }
    });
  }
};

// GET /api/properties/:id
export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validar formato de ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({
        success: false,
        error: { message: 'ID de propiedad inválido' }
      });
      return;
    }
    
    let property = await getPropertyById(id);
    
    // Si no se encuentra en properties, buscar en host_properties
    if (!property) {
      const hostProperty = await HostPropertyModel.findById(id);
      if (hostProperty) {
        // Convertir HostProperty a formato Property
        const locationObj = typeof hostProperty.location === 'string' 
          ? { address: hostProperty.location, city: hostProperty.location, country: '', coordinates: { lat: 0, lng: 0 } }
          : hostProperty.location;
        
        const hostPropertyId = (hostProperty as any)._id?.toString() || id;
        
        property = {
          id: hostPropertyId,
          title: hostProperty.title,
          description: hostProperty.description,
          price: hostProperty.pricePerNight || 0,
          pricePerNight: hostProperty.pricePerNight || 0,
          location: locationObj,
          propertyType: hostProperty.propertyType,
          maxGuests: hostProperty.maxGuests,
          bedrooms: hostProperty.bedrooms || 0,
          bathrooms: hostProperty.bathrooms || 0,
          amenities: hostProperty.amenities || [],
          images: hostProperty.images || [],
          hostId: hostProperty.hostId,
          isActive: hostProperty.isActive !== false,
          rating: 0,
          instantBook: false,
          createdAt: hostProperty.createdAt?.toISOString ? hostProperty.createdAt.toISOString() : String(hostProperty.createdAt || ''),
          updatedAt: hostProperty.updatedAt?.toISOString ? hostProperty.updatedAt.toISOString() : String(hostProperty.updatedAt || '')
        };
      }
    }
    
    if (!property) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    // Asegurar que hostId esté presente en la respuesta
    // El frontend busca hostId o userId (prioridad: hostId)
    const propertyWithHost = property as any;
    const responseData: any = {
      ...property,
      hostId: property.hostId || propertyWithHost.host?.id || propertyWithHost.userId || null
    };

    // Si hay objeto host pero no hostId directo, asegurar que esté
    if (propertyWithHost.host && !responseData.hostId) {
      responseData.hostId = propertyWithHost.host.id;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo propiedad' }
    });
  }
};

// GET /api/properties/popular
export const getPopularProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await searchProperties({
      limit: Number(limit),
      minRating: 4.0 // Bajado a 4.0 para incluir más propiedades
    });

    res.json({
      success: true,
      data: result.properties || []
    });
  } catch (error: any) {
    console.error('Error en getPopularProperties:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo propiedades populares', details: error.message }
    });
  }
};

// PUT /api/properties/:id - Actualizar propiedad (solo admin)
export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const updates = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Verificar que el usuario es admin
    const user = await findUserById(userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Solo los administradores pueden actualizar propiedades' }
      });
      return;
    }

    console.log(`✏️ Admin actualizando propiedad: ${id}`, { updates });

    // Buscar la propiedad primero para obtener información
    let propertyInProperties = await PropertyModel.findById(id);
    let propertyInHostProperties = await HostPropertyModel.findById(id);

    if (!propertyInProperties && !propertyInHostProperties) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    // Preparar datos de actualización para properties
    const propertiesUpdate: any = {};
    if (updates.title) propertiesUpdate.title = updates.title;
    if (updates.description) propertiesUpdate.description = updates.description;
    
    // Manejar location
    if (updates.location) {
      if (typeof updates.location === 'string') {
        const parts = updates.location.split(',').map((p: string) => p.trim());
        propertiesUpdate.location = {
          address: parts[0] || updates.location,
          city: parts[1] || parts[0] || 'Ciudad',
          country: parts[2] || 'País',
          coordinates: { lat: 0, lng: 0 }
        };
      } else if (updates.location && typeof updates.location === 'object') {
        propertiesUpdate.location = {
          address: updates.location.address || propertyInProperties?.location?.address || '',
          city: updates.location.city || propertyInProperties?.location?.city || 'Ciudad',
          country: updates.location.country || propertyInProperties?.location?.country || 'País',
          coordinates: updates.location.coordinates || propertyInProperties?.location?.coordinates || { lat: 0, lng: 0 }
        };
      }
    }

    if (updates.propertyType) {
      const validPropertyTypes = ['entire', 'private', 'shared'];
      propertiesUpdate.propertyType = validPropertyTypes.includes(updates.propertyType) 
        ? updates.propertyType 
        : 'entire';
    }
    
    if (updates.pricePerNight !== undefined) propertiesUpdate.pricePerNight = Number(updates.pricePerNight);
    if (updates.price !== undefined) propertiesUpdate.pricePerNight = Number(updates.price);
    if (updates.maxGuests !== undefined) propertiesUpdate.maxGuests = Number(updates.maxGuests);
    if (updates.bedrooms !== undefined) propertiesUpdate.bedrooms = Number(updates.bedrooms);
    if (updates.bathrooms !== undefined) propertiesUpdate.bathrooms = Number(updates.bathrooms);
    if (updates.amenities) propertiesUpdate.amenities = Array.isArray(updates.amenities) ? updates.amenities : [];
    if (updates.images) propertiesUpdate.images = Array.isArray(updates.images) ? updates.images : [];
    
    propertiesUpdate.updatedAt = new Date();

    // Actualizar en colección properties
    let updatedProperty = null;
    if (propertyInProperties) {
      updatedProperty = await PropertyModel.findByIdAndUpdate(
        id,
        propertiesUpdate,
        { new: true, runValidators: true }
      );
      if (updatedProperty) {
        console.log(`✅ Propiedad actualizada en colección properties: ${id}`);
      }
    }

    // Preparar datos para host_properties
    const hostPropertiesUpdate: any = {};
    if (updates.title) hostPropertiesUpdate.title = updates.title;
    if (updates.description) hostPropertiesUpdate.description = updates.description;
    
    // Convertir location a string para host_properties
    if (updates.location) {
      if (typeof updates.location === 'string') {
        hostPropertiesUpdate.location = updates.location;
      } else if (updates.location && typeof updates.location === 'object') {
        hostPropertiesUpdate.location = `${updates.location.address || ''}, ${updates.location.city || ''}, ${updates.location.country || ''}`.trim();
      }
    }

    if (updates.propertyType) hostPropertiesUpdate.propertyType = updates.propertyType;
    if (updates.pricePerNight !== undefined) hostPropertiesUpdate.pricePerNight = Number(updates.pricePerNight);
    if (updates.price !== undefined) hostPropertiesUpdate.pricePerNight = Number(updates.price);
    if (updates.maxGuests !== undefined) hostPropertiesUpdate.maxGuests = Number(updates.maxGuests);
    if (updates.bedrooms !== undefined) hostPropertiesUpdate.bedrooms = Number(updates.bedrooms);
    if (updates.bathrooms !== undefined) hostPropertiesUpdate.bathrooms = Number(updates.bathrooms);
    if (updates.amenities) hostPropertiesUpdate.amenities = Array.isArray(updates.amenities) ? updates.amenities : [];
    if (updates.images) hostPropertiesUpdate.images = Array.isArray(updates.images) ? updates.images : [];
    if (updates.isActive !== undefined) hostPropertiesUpdate.isActive = updates.isActive;
    
    hostPropertiesUpdate.updatedAt = new Date();

    // Actualizar en colección host_properties
    let updatedHostProperty = null;
    if (propertyInHostProperties) {
      updatedHostProperty = await HostPropertyModel.findByIdAndUpdate(
        id,
        hostPropertiesUpdate,
        { new: true, runValidators: true }
      );
      if (updatedHostProperty) {
        console.log(`✅ Propiedad actualizada en colección host_properties: ${id}`);
      }
    } else if (propertyInProperties) {
      // Si no existe en host_properties pero sí en properties, intentar crear/actualizar por búsqueda alternativa
      try {
        const alternativeMatch = await HostPropertyModel.findOneAndUpdate(
          {
            hostId: (propertyInProperties as any).host?.id || '',
            title: propertyInProperties.title
          },
          {
            ...hostPropertiesUpdate,
            hostId: (propertyInProperties as any).host?.id || '',
            status: 'active',
            isActive: updates.isActive !== undefined ? updates.isActive : true
          },
          { new: true, upsert: false }
        );
        if (alternativeMatch) {
          console.log(`✅ Propiedad actualizada en host_properties (búsqueda alternativa): ${alternativeMatch._id}`);
          updatedHostProperty = alternativeMatch;
        }
      } catch (error: any) {
        console.warn(`⚠️ No se pudo actualizar en host_properties: ${error.message}`);
      }
    }

    // Si no se actualizó en ninguna colección
    if (!updatedProperty && !updatedHostProperty) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada para actualizar' }
      });
      return;
    }

    // Usar la propiedad actualizada de properties si existe, si no la de host_properties
    const hostPropDoc = updatedHostProperty as any;
    const finalProperty = updatedProperty || {
      id: hostPropDoc?._id?.toString() || id,
      title: hostPropDoc?.title || updates.title,
      description: hostPropDoc?.description || updates.description,
      pricePerNight: hostPropDoc?.pricePerNight || updates.pricePerNight || updates.price,
      location: typeof hostPropDoc?.location === 'string' 
        ? { address: hostPropDoc.location, city: '', country: '' }
        : hostPropDoc?.location,
      maxGuests: hostPropDoc?.maxGuests,
      bedrooms: hostPropDoc?.bedrooms,
      bathrooms: hostPropDoc?.bathrooms,
      amenities: hostPropDoc?.amenities || [],
      images: hostPropDoc?.images || []
    };

    console.log(`✅ Propiedad actualizada exitosamente por admin: ${id}`);

    res.json({
      success: true,
      data: {
        message: 'Propiedad actualizada exitosamente',
        property: finalProperty
      }
    });
  } catch (error: any) {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    console.error('❌ Error actualizando propiedad (admin):', {
      message: error.message,
      stack: error.stack,
      propertyId: id,
      userId: userId
    });
    res.status(500).json({
      success: false,
      error: { 
        message: 'Error actualizando propiedad',
        details: error.message || 'Error desconocido'
      }
    });
  }
};

// DELETE /api/properties/:id - Eliminar propiedad (solo admin)
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Verificar que el usuario es admin
    const user = await findUserById(userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Solo los administradores pueden eliminar propiedades' }
      });
      return;
    }

    console.log(`🗑️ Admin eliminando propiedad: ${id}`);

    // Intentar eliminar de la colección properties primero
    let deletedFromProperties = false;
    let deletedFromHostProperties = false;
    let propertyTitle = '';

    try {
      const propertyInProperties = await PropertyModel.findByIdAndDelete(id);
      if (propertyInProperties) {
        deletedFromProperties = true;
        propertyTitle = propertyInProperties.title;
        console.log(`✅ Propiedad eliminada de colección properties: ${id}`);
      }
    } catch (error: any) {
      console.warn(`⚠️ Error eliminando de properties: ${error.message}`);
    }

    // Intentar eliminar de host_properties
    try {
      const propertyInHostProperties = await HostPropertyModel.findByIdAndDelete(id);
      if (propertyInHostProperties) {
        deletedFromHostProperties = true;
        if (!propertyTitle) {
          propertyTitle = propertyInHostProperties.title;
        }
        console.log(`✅ Propiedad eliminada de colección host_properties: ${id}`);
      }
    } catch (error: any) {
      console.warn(`⚠️ Error eliminando de host_properties: ${error.message}`);
    }

    // Si no se encontró en ninguna colección, intentar búsqueda alternativa
    if (!deletedFromProperties && !deletedFromHostProperties) {
      // Buscar en properties por host.id y title si tenemos el title de host_properties
      const hostProperty = await HostPropertyModel.findById(id);
      if (hostProperty) {
        try {
          const alternativeMatch = await PropertyModel.findOneAndDelete({
            'host.id': hostProperty.hostId,
            title: hostProperty.title
          });
          if (alternativeMatch) {
            deletedFromProperties = true;
            propertyTitle = alternativeMatch.title;
            console.log(`✅ Propiedad eliminada de properties (búsqueda alternativa): ${alternativeMatch._id}`);
          }
        } catch (error: any) {
          console.warn(`⚠️ Error en búsqueda alternativa: ${error.message}`);
        }
      }
    }

    if (!deletedFromProperties && !deletedFromHostProperties) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada en ninguna colección' }
      });
      return;
    }

    console.log(`✅ Propiedad eliminada exitosamente por admin: ${id} (${propertyTitle})`);

    res.json({
      success: true,
      data: {
        message: 'Propiedad eliminada exitosamente',
        deletedFromProperties,
        deletedFromHostProperties
      }
    });
  } catch (error: any) {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    console.error('❌ Error eliminando propiedad (admin):', {
      message: error.message,
      stack: error.stack,
      propertyId: id,
      userId: userId
    });
    res.status(500).json({
      success: false,
      error: { 
        message: 'Error eliminando propiedad',
        details: error.message || 'Error desconocido'
      }
    });
  }
};
