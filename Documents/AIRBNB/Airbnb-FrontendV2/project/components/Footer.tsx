'use client';

import { Facebook, Twitter, Instagram, Youtube, Globe, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

/**
 * Footer Component - Información de contacto y enlaces de la empresa
 * Features: Enlaces de navegación, contacto, redes sociales y información legal
 * Architecture: Footer completo con múltiples secciones organizadas
 */
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Airbnb Clone</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Conectamos a viajeros con anfitriones únicos en todo el mundo. 
              Descubre experiencias auténticas y alojamientos especiales.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  Acerca de Nosotros
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/host" className="text-gray-400 hover:text-white transition-colors">
                  Conviértete en Anfitrión
                </Link>
              </li>
              <li>
                <Link href="/experiences" className="text-gray-400 hover:text-white transition-colors">
                  Experiencias
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contacto</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">contacto@airbnbclone.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">+34 900 123 456</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-400">
                  Calle Gran Vía, 123<br />
                  28013 Madrid, España
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">www.airbnbclone.com</span>
              </div>
            </div>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Legal y Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-400 hover:text-white transition-colors">
                  Seguridad
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">
                  Accesibilidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Mantente al día con nuestras ofertas
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Recibe las mejores ofertas y novedades directamente en tu correo
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
              />
              <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 Airbnb Clone. Todos los derechos reservados.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Hecho con ❤️ en España</span>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <select className="bg-transparent text-gray-400 focus:outline-none">
                  <option value="es">Español (ES)</option>
                  <option value="en">English (US)</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}