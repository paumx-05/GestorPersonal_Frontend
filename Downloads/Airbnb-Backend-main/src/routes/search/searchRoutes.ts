import { Router } from 'express';
import { searchPropertiesEndpoint, getSearchSuggestions, getSearchFilters } from '../../controllers/search/searchController';

const router = Router();

// Rutas públicas de búsqueda
router.get('/properties', searchPropertiesEndpoint);
router.get('/suggestions', getSearchSuggestions);
router.get('/filters', getSearchFilters);

export default router;
