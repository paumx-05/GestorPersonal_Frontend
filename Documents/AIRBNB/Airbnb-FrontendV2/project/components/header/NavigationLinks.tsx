import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * NavigationLinks Component - Enlaces de navegación del header
 * Separado para mejor organización y reutilización
 */
interface NavigationLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export default function NavigationLinks({ isMobile = false, onLinkClick }: NavigationLinksProps) {
  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/about', label: 'Nosotros' },
    { label: 'Experiencias' },
    { label: 'Ayuda' }
  ];

  if (isMobile) {
    return (
      <div className="space-y-2 pb-4 border-b border-slate-700">
        {navItems.map((item, index) => (
          item.href ? (
            <Link key={index} href={item.href}>
              <Button
                variant="ghost"
                className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                onClick={onLinkClick}
              >
                {item.label}
              </Button>
            </Link>
          ) : (
            <Button
              key={index}
              variant="ghost"
              className="w-full text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
              onClick={onLinkClick}
            >
              {item.label}
            </Button>
          )
        ))}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
      {navItems.map((item, index) => (
        item.href ? (
          <Link 
            key={index} 
            href={item.href} 
            className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            {item.label}
          </Link>
        ) : (
          <button 
            key={index}
            className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            {item.label}
          </button>
        )
      ))}
    </div>
  );
}
