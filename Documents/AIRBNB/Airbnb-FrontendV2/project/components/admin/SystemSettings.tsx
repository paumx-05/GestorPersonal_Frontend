'use client';

import { useState } from 'react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxFileSize: number;
  supportedImageTypes: string[];
  emailNotifications: boolean;
  smsNotifications: boolean;
  defaultLanguage: string;
  timezone: string;
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Airbnb Clone',
    siteDescription: 'Plataforma de alojamiento temporal',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileSize: 5,
    supportedImageTypes: ['jpg', 'jpeg', 'png', 'webp'],
    emailNotifications: true,
    smsNotifications: false,
    defaultLanguage: 'es',
    timezone: 'Europe/Madrid'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Manejar cambios en los settings
  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveMessage('Configuración guardada exitosamente');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
      
    } catch (error) {
      setSaveMessage('Error guardando configuración');
    } finally {
      setIsSaving(false);
    }
  };

  // Resetear configuración
  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres resetear la configuración?')) {
      setSettings({
        siteName: 'Airbnb Clone',
        siteDescription: 'Plataforma de alojamiento temporal',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
        maxFileSize: 5,
        supportedImageTypes: ['jpg', 'jpeg', 'png', 'webp'],
        emailNotifications: true,
        smsNotifications: false,
        defaultLanguage: 'es',
        timezone: 'Europe/Madrid'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
        <p className="text-gray-600">Gestiona la configuración general de la plataforma</p>
      </div>

      {/* Mensaje de guardado */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.includes('Error') 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Configuración general */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración General
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Sitio
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Sitio
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma por Defecto
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona Horaria
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                <option value="Europe/London">London (GMT+0)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de usuarios */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración de Usuarios
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Permitir Registro de Nuevos Usuarios
              </label>
              <p className="text-xs text-gray-500">
                Los usuarios podrán registrarse en la plataforma
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Requerir Verificación de Email
              </label>
              <p className="text-xs text-gray-500">
                Los usuarios deben verificar su email para activar la cuenta
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Configuración de archivos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración de Archivos
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño Máximo de Archivo (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipos de Imagen Soportados
            </label>
            <div className="flex flex-wrap gap-2">
              {settings.supportedImageTypes.map((type, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {type}
                  <button
                    onClick={() => {
                      const newTypes = settings.supportedImageTypes.filter((_, i) => i !== index);
                      handleSettingChange('supportedImageTypes', newTypes);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Agregar nuevo tipo (ej: gif)"
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const newType = e.currentTarget.value.trim().toLowerCase();
                    if (newType && !settings.supportedImageTypes.includes(newType)) {
                      handleSettingChange('supportedImageTypes', [...settings.supportedImageTypes, newType]);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de notificaciones */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración de Notificaciones
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Notificaciones por Email
              </label>
              <p className="text-xs text-gray-500">
                Enviar notificaciones importantes por email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Notificaciones por SMS
              </label>
              <p className="text-xs text-gray-500">
                Enviar notificaciones urgentes por SMS
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Configuración de mantenimiento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Modo de Mantenimiento
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Activar Modo de Mantenimiento
            </label>
            <p className="text-xs text-gray-500">
              El sitio estará temporalmente fuera de servicio
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleReset}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Resetear
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;
