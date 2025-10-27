import { Request, Response } from 'express';
import { getPropertyById, searchProperties } from '../../models';

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
