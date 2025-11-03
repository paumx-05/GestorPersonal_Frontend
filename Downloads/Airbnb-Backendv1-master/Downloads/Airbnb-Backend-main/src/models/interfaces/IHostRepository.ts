/**
 * 🎯 INTERFAZ DE REPOSITORIO DE HOST
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Interfaz que define el contrato para todas las operaciones de host.
 * Garantiza compatibilidad entre implementaciones Mock y MongoDB.
 */

import { HostProperty, HostStats } from '../../types/host';

export interface IHostRepository {
  // ➕ FUNCIONES DE CREACIÓN
  createHostProperty(property: Omit<HostProperty, 'id' | 'createdAt' | 'updatedAt'>): Promise<HostProperty>;
  
  // 🔍 FUNCIONES DE BÚSQUEDA
  getHostProperties(hostId: string): Promise<HostProperty[]>;
  getHostPropertyById(id: string): Promise<HostProperty | null>;
  
  // ✏️ FUNCIONES DE ACTUALIZACIÓN
  updateHostProperty(id: string, updates: Partial<HostProperty>): Promise<HostProperty | null>;
  
  // 🗑️ FUNCIONES DE ELIMINACIÓN
  deleteHostProperty(id: string): Promise<boolean>;
  
  // 📊 FUNCIONES DE ESTADÍSTICAS
  getHostStats(hostId: string): Promise<HostStats>;
}
