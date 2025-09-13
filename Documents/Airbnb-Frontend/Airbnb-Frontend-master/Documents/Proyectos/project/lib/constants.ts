/**
 * Constants - Constantes globales para la aplicación
 * Centraliza colores, textos y estilos repetidos para mejor mantenibilidad
 */

// Colores principales
export const COLORS = {
  primary: '#FF385C',
  primaryHover: '#E31C5F',
  background: 'bg-gray-800',
  border: 'border-gray-700',
  text: {
    primary: 'text-white',
    secondary: 'text-slate-300',
    muted: 'text-slate-400',
  }
} as const;

// Clases CSS comunes
export const COMMON_STYLES = {
  button: {
    ghost: 'text-slate-300 hover:text-white hover:bg-slate-700/50',
    primary: 'bg-[#FF385C] hover:bg-[#E31C5F] text-white',
    icon: 'text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-all duration-200'
  },
  transitions: {
    default: 'transition-all duration-200',
    colors: 'transition-colors duration-200'
  }
} as const;

// Textos de la aplicación
export const TEXT = {
  navigation: {
    home: 'Inicio',
    about: 'Nosotros',
    experiences: 'Experiencias',
    help: 'Ayuda'
  },
  auth: {
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    account: 'Cuenta',
    logout: 'Salir',
    myProfile: 'Mi Perfil'
  },
  search: {
    placeholder: 'Where are you going?',
    placeholderShort: 'Madrid',
    defaultDates: 'Sep 11 - 14 • 2 guest'
  }
} as const;
