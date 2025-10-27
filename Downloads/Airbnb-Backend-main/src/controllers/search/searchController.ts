import { Request, Response } from 'express';
import { searchProperties, getPopularLocations, getAvailableAmenities } from '../../models';

// GET /api/search/properties
export const searchPropertiesEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      location,
      checkIn,
      checkOut,
      guests,
      propertyType,
      minPrice,
      maxPrice,
      amenities,
      minRating,
      instantBook,
      limit = 20,
      offset = 0
    } = req.query;

    const filters = {
      location: location as string,
      checkIn: checkIn as string,
      checkOut: checkOut as string,
      guests: guests ? Number(guests) : undefined,
      propertyType: propertyType as 'entire' | 'private' | 'shared',
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      amenities: amenities ? (amenities as string).split(',') : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      instantBook: instantBook === 'true',
      limit: Number(limit),
      offset: Number(offset)
    };

    const result = await searchProperties(filters);

    res.json({
      success: true,
      data: result.properties || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error en la búsqueda de propiedades' }
    });
  }
};

// GET /api/search/suggestions
export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || (q as string).length < 2) {
      res.json({
        success: true,
        data: []
      });
      return;
    }

    const query = (q as string).toLowerCase();
    const locations = await getPopularLocations();
    
    const suggestions = locations
      .filter((location: any) => 
        location.city?.toLowerCase().includes(query) ||
        location.country?.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map((location: any) => ({
        type: 'location',
        text: `${location.city}, ${location.country}`,
        count: location.propertyCount
      }));

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo sugerencias' }
    });
  }
};

// GET /api/search/filters
export const getSearchFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const amenities = await getAvailableAmenities();
    
    const filters = {
      propertyTypes: [
        { value: 'entire', label: 'Casa completa' },
        { value: 'private', label: 'Habitación privada' },
        { value: 'shared', label: 'Habitación compartida' }
      ],
      amenities: amenities.map((amenity: string) => ({
        value: amenity,
        label: amenity
      })),
      priceRange: {
        min: 500,
        max: 10000,
        step: 100
      },
      ratingRange: {
        min: 1,
        max: 5,
        step: 0.5
      }
    };

    res.json({
      success: true,
      data: { filters }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo filtros' }
    });
  }
};
