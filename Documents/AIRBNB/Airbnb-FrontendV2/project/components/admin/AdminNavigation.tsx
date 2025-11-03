'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavigationProps {
  className?: string;
}

const AdminNavigation = ({ className = '' }: AdminNavigationProps) => {
  const pathname = usePathname();
  
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: '📊',
      description: 'Vista general de métricas'
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: '👥',
      description: 'Gestión de usuarios'
    },
    {
      name: 'Propiedades',
      href: '/admin/properties',
      icon: '🏠',
      description: 'Gestión de propiedades'
    },
    {
      name: 'Reservas',
      href: '/admin/reservations',
      icon: '📅',
      description: 'Gestión de reservas'
    },
    {
      name: 'Actividad',
      href: '/admin/activity',
      icon: '📊',
      description: 'Métricas de actividad'
    },
    {
      name: 'Notificaciones',
      href: '/admin/notifications',
      icon: '🔔',
      description: 'Notificaciones del sistema'
    },
    {
      name: 'Rendimiento',
      href: '/admin/performance',
      icon: '⚡',
      description: 'Métricas de rendimiento'
    },
    {
      name: 'Seguridad',
      href: '/admin/security',
      icon: '🔒',
      description: 'Métricas de seguridad'
    },
    {
      name: 'Finanzas',
      href: '/admin/financial',
      icon: '💰',
      description: 'Métricas financieras'
    },
    {
      name: 'Marketing',
      href: '/admin/marketing',
      icon: '📈',
      description: 'Métricas de marketing'
    },
    {
      name: 'Soporte',
      href: '/admin/support',
      icon: '🎧',
      description: 'Métricas de soporte'
    },
    {
      name: 'Inventario',
      href: '/admin/inventory',
      icon: '📦',
      description: 'Métricas de inventario'
    },
    {
      name: 'Calidad',
      href: '/admin/quality',
      icon: '⭐',
      description: 'Métricas de calidad'
    },
    {
      name: 'Análisis',
      href: '/admin/analytics',
      icon: '📊',
      description: 'Métricas de análisis'
    },
    {
      name: 'Reportes',
      href: '/admin/reports',
      icon: '📋',
      description: 'Métricas de reportes'
    },
    {
      name: 'Integración',
      href: '/admin/integration',
      icon: '🔗',
      description: 'Métricas de integración'
    },
    {
      name: 'Auditoría',
      href: '/admin/audit',
      icon: '🕵️',
      description: 'Métricas de auditoría'
    },
    {
      name: 'Backup',
      href: '/admin/backup',
      icon: '💾',
      description: 'Métricas de backup'
    },
    {
      name: 'Monitoreo',
      href: '/admin/monitoring',
      icon: '📊',
      description: 'Métricas de monitoreo'
    },
    {
      name: 'Configuración',
      href: '/admin/settings',
      icon: '⚙️',
      description: 'Configuración del sistema'
    }
  ];

  return (
    <nav className={`bg-white shadow-sm border-r border-gray-200 ${className}`}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Panel de Administración
        </h2>
        
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {item.name}
                    </div>
                    <div className={`text-xs ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Información adicional */}
      <div className="p-6 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>Versión: 1.0.0</p>
          <p>Última actualización: Hoy</p>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;
