import { Request, Response } from 'express';
import { getPropertyById, searchProperties } from '../../models';
import { HostPropertyModel } from '../../models/schemas/HostSchema';

// GET /api/properties - Obtener todas las propiedades activas (público)
export const getAllProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    // IMPORTANTE: Las propiedades están en DOS colecciones diferentes:
    // 1. PropertyModel (colección 'properties') - para propiedades generales
    // 2. HostPropertyModel (colección 'host_properties') - para propiedades creadas por hosts
    
    // Obtener propiedades de PropertyModel (sin filtros restrictivos, solo isActive si existe)
    const propertyResult = await searchProperties({
      limit: 10000, // Límite muy alto para obtener todas
      offset: 0
    });

    // Obtener propiedades activas de HostPropertyModel directamente
    // Filtrar solo las que están activas
    const hostProperties = await HostPropertyModel.find({
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }, // Incluir si no existe el campo (default es true)
        { status: 'active' }
      ]
    })
    .limit(10000) // Límite alto para obtener todas las propiedades activas
    .sort({ createdAt: -1 });

    // Convertir HostProperty a formato Property para consistencia
    const convertedHostProperties = hostProperties.map((hp: any) => {
      // Convertir location de string a objeto si es necesario
      let locationObj: any;
      try {
        // Intentar parsear si es JSON string
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
        host: undefined, // Se puede agregar información del host si es necesario
        isActive: hp.isActive !== false,
        rating: hp.rating || 0,
        reviewCount: hp.reviewCount || 0,
        instantBook: hp.instantBook || false,
        createdAt: hp.createdAt?.toISOString ? hp.createdAt.toISOString() : hp.createdAt,
        updatedAt: hp.updatedAt?.toISOString ? hp.updatedAt.toISOString() : hp.updatedAt
      };
    });

    // Combinar propiedades de ambas colecciones
    const allProperties = [
      ...(propertyResult.properties || []),
      ...convertedHostProperties
    ];

    // Filtrar solo propiedades activas (por seguridad)
    const activeProperties = allProperties.filter((prop: any) => {
      return prop.isActive !== false; // Default a true si no existe
    });

    // Eliminar duplicados por ID (por si hay alguna propiedad en ambas colecciones)
    const uniqueProperties = activeProperties.reduce((acc: any[], prop: any) => {
      if (!acc.find((p: any) => p.id === prop.id || p._id === prop._id)) {
        acc.push(prop);
      }
      return acc;
    }, []);

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
    
    const property = await getPropertyById(id);
    
    if (!property) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: property
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
