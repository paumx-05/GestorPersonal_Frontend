"use client";

import React, { useState } from 'react';
import { Search, Phone, Mail, MapPin, Car, Wrench, Package, ShoppingCart, User, Clock, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessionMock } from '@/hooks/use-session-mock';
import { authMock } from '@/lib/mocks/auth';
import Header from '@/components/Header';

// TODO: Integrar con API de TecDoc para búsqueda de recambios reales
// FIXME: Implementar validación de matrícula y código motor
const carBrands = [
  { name: 'Alfa Romeo', logo: 'https://www.carlogos.org/car-logos/alfa-romeo-logo.png' },
  { name: 'Audi', logo: 'https://img.icons8.com/color/96/audi.png' },
  { name: 'BMW', logo: 'https://img.icons8.com/color/96/bmw.png' },
  { name: 'Buick', logo: 'https://www.carlogos.org/car-logos/buick-logo.png' },
  { name: 'Cadillac', logo: 'https://www.carlogos.org/car-logos/cadillac-logo.png' },
  { name: 'Chevrolet', logo: 'https://img.icons8.com/color/96/chevrolet.png' },
  { name: 'Chrysler', logo: 'https://www.carlogos.org/car-logos/chrysler-logo.png' },
  { name: 'Citroën', logo: 'https://img.icons8.com/color/96/citroen.png' },
  { name: 'Dacia', logo: 'https://www.carlogos.org/car-logos/dacia-logo.png' },
  { name: 'Ferrari', logo: 'https://www.carlogos.org/car-logos/ferrari-logo.png' },
  { name: 'Lamborghini', logo: 'https://img.icons8.com/color/96/lamborghini.png' },
  { name: 'Dodge', logo: 'https://img.icons8.com/color/96/dodge.png' },
  { name: 'Fiat', logo: 'https://img.icons8.com/color/96/fiat.png' },
  { name: 'Ford', logo: 'https://img.icons8.com/color/96/ford.png' },
  { name: 'Honda', logo: 'https://img.icons8.com/color/96/honda.png' },
  { name: 'Hyundai', logo: 'https://img.icons8.com/color/96/hyundai.png' },
  { name: 'Genesis', logo: 'https://www.carlogos.org/car-logos/genesis-logo.png' },
  { name: 'Acura', logo: 'https://img.icons8.com/color/96/acura.png' },
  { name: 'Jeep', logo: 'https://img.icons8.com/color/96/jeep.png' },
  { name: 'Kia', logo: 'https://img.icons8.com/color/96/kia.png' },
  { name: 'Bentley', logo: 'https://img.icons8.com/color/96/bentley.png' },
  { name: 'Lancia', logo: 'https://www.carlogos.org/car-logos/lancia-logo.png' },
  { name: 'Land Rover', logo: 'https://img.icons8.com/color/96/land-rover.png' },
  { name: 'Lexus', logo: 'https://img.icons8.com/color/96/lexus.png' },
  { name: 'Maserati', logo: 'https://img.icons8.com/color/96/maserati.png' },
  { name: 'Mazda', logo: 'https://img.icons8.com/color/96/mazda.png' },
  { name: 'Mercedes-Benz', logo: 'https://img.icons8.com/color/96/mercedes-benz.png' },
  { name: 'Mini', logo: 'https://www.carlogos.org/car-logos/mini-logo.png' },
  { name: 'Mitsubishi', logo: 'https://img.icons8.com/color/96/mitsubishi.png' },
  { name: 'Nissan', logo: 'https://img.icons8.com/color/96/nissan.png' },
  { name: 'Opel', logo: 'https://www.carlogos.org/car-logos/opel-logo.png' },
  { name: 'Peugeot', logo: 'https://img.icons8.com/color/96/peugeot.png' },
  { name: 'Porsche', logo: 'https://img.icons8.com/color/96/porsche.png' },
  { name: 'Renault', logo: 'https://img.icons8.com/color/96/renault.png' },
  { name: 'Rolls Royce', logo: 'https://img.icons8.com/color/96/rolls-royce.png' },
  { name: 'Saab', logo: 'https://www.carlogos.org/car-logos/saab-logo.png' },
  { name: 'Seat', logo: 'https://www.carlogos.org/car-logos/seat-logo.png' },
  { name: 'Skoda', logo: 'https://www.carlogos.org/car-logos/skoda-logo.png' },
  { name: 'Subaru', logo: 'https://img.icons8.com/color/96/subaru.png' },
  { name: 'Suzuki', logo: 'https://img.icons8.com/color/96/suzuki.png' },
  { name: 'Toyota', logo: 'https://img.icons8.com/color/96/toyota.png' },
  { name: 'Volkswagen', logo: 'https://img.icons8.com/color/96/volkswagen.png' },
  { name: 'Volvo', logo: 'https://img.icons8.com/color/96/volvo.png' },
];

export default function Home(): JSX.Element {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [cartItems, setCartItems] = useState<number>(0);
  const [showOfferBar, setShowOfferBar] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<{hours: number, minutes: number, seconds: number}>({
    hours: 23,
    minutes: 59,
    seconds: 59
  });
  const [searchForm, setSearchForm] = useState({
    tecdocCode: '',
    motorCode: '',
    licensePlate: ''
  });
  const router = useRouter();
  const { user, isAuthenticated, logout } = useSessionMock();

  const handleSearch = () => {
    const plate = searchForm.licensePlate.toUpperCase();
    const plateRegex = /^[0-9]{4}[A-Z]{3}$/;
    if (!plateRegex.test(plate)) {
      alert('Matrícula inválida. Debe tener 4 números y 3 letras, por ejemplo 0251FZL.');
      return;
    }
    router.push(`/vehicle/${plate}`);
  };

  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(brandName);
  };

  const handleAddToCart = () => {
    setCartItems(cartItems + 1);
  };

  const handleUserClick = () => {
    if (isAuthenticated) router.push('/account');
    else router.push('/login');
  };

  const handleCloseOfferBar = () => {
    setShowOfferBar(false);
  };

  const handleRegisterClick = () => {
    router.push('/register');
  };

  async function handleLogout() {
    await authMock.logout();
    await logout();
    router.replace('/');
  }

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        } else if (prevTime.minutes > 0) {
          return { ...prevTime, minutes: prevTime.minutes - 1, seconds: 59 };
        } else if (prevTime.hours > 0) {
          return { hours: prevTime.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {showOfferBar && (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-3 px-4 relative">
          <div className="container mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start sm:space-x-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="bg-white/20 p-1 rounded-full shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm md:text-base leading-snug break-words">
                  ¡Regístrate ahora y recibe un 10% de descuento en discos y pastillas!
                </span>
              </div>
              <Button 
                onClick={handleRegisterClick}
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-3 py-1 text-xs sm:text-sm transition-colors shrink-0"
                size="sm"
                aria-label="Registrarse"
              >
                REGISTRARSE
              </Button>
            </div>

            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs md:text-sm font-medium">Termina en:</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
                <div className="text-center">
                  <div className="text-sm md:text-base font-bold leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs opacity-80">h</div>
                </div>
                <span className="text-lg font-bold">:</span>
                <div className="text-center">
                  <div className="text-sm md:text-base font-bold leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs opacity-80">m</div>
                </div>
                <span className="text-lg font-bold">:</span>
                <div className="text-center">
                  <div className="text-sm md:text-base font-bold leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs opacity-80">s</div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCloseOfferBar}
              className="absolute right-2 top-2 p-1 hover:bg-white/20 rounded-full transition-colors sm:static sm:ml-4"
              aria-label="Cerrar barra"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Header cartItems={cartItems} onAddToCart={handleAddToCart} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Search Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Search Form - Static (No Sticky) */}
            <Card className="p-4 bg-gray-800 border-gray-700">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Search className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-bold text-white">Búsqueda de Recambios</h2>
                </div>
                
                {/* Vehicle Selection Status - Compact */}
                <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-800 rounded-lg">
                  <Car className="h-4 w-4 text-gray-300" />
                  <span className="text-xs text-gray-200">
                    {selectedBrand ? `Seleccionado: ${selectedBrand}` : 'No hay vehículo seleccionado'}
                  </span>
                </div>
              </div>

              {/* Search Form - Compact */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="tecdoc" className="block text-xs font-medium text-gray-200 mb-1">
                    Código TecDoc
                  </label>
                  <Input
                    id="tecdoc"
                    placeholder="Código TecDoc"
                    value={searchForm.tecdocCode}
                    onChange={(e) => setSearchForm({...searchForm, tecdocCode: e.target.value})}
                    className="w-full h-9"
                  />
                </div>

                <div>
                  <label htmlFor="motor" className="block text-xs font-medium text-gray-200 mb-1">
                    Código Motor
                  </label>
                  <Input
                    id="motor"
                    placeholder="Código Motor"
                    value={searchForm.motorCode}
                    onChange={(e) => setSearchForm({...searchForm, motorCode: e.target.value})}
                    className="w-full h-9"
                  />
                </div>

                <div>
                  <label htmlFor="matricula" className="block text-xs font-medium text-gray-200 mb-1">
                    Matrícula
                  </label>
                  <Input
                    id="matricula"
                    placeholder="Matrícula"
                    value={searchForm.licensePlate}
                    onChange={(e) => setSearchForm({...searchForm, licensePlate: e.target.value})}
                    className="w-full h-9"
                  />
                </div>

                <Button 
                  onClick={handleSearch}
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-9"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              {/* Quick Access Icons - Compact */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <h3 className="text-xs font-medium text-gray-200 mb-2">Acceso Rápido</h3>
                <div className="grid grid-cols-6 gap-2">
                  {/* TODO: Agregar funcionalidad a estos iconos de acceso rápido */}
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Package className="h-4 w-4 text-gray-300 mx-auto" />
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Car className="h-4 w-4 text-gray-300 mx-auto" />
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Wrench className="h-4 w-4 text-gray-300 mx-auto" />
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <MapPin className="h-4 w-4 text-gray-300 mx-auto" />
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Phone className="h-4 w-4 text-gray-300 mx-auto" />
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Mail className="h-4 w-4 text-gray-300 mx-auto" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Special Offers Section - Always Visible */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Ofertas Especiales</h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Frenos Premium</h4>
                  <p className="text-sm text-gray-700 mt-1">Hasta 30% de descuento</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded">OFERTA</span>
                </div>
                
                <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
                  <h4 className="font-semibold text-white">Filtros de Aceite</h4>
                  <p className="text-sm text-gray-200 mt-1">2x1 en marcas seleccionadas</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded">PROMOCIÓN</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Brand Selection */}
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Seleccione la Marca</h2>
              <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-900 hover:text-white">
                Todas las marcas
              </Button>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {carBrands.map((brand, index) => (
                <Card 
                  key={index}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gray-800 border-gray-700 ${
                    selectedBrand === brand.name ? 'ring-2 ring-red-600 bg-red-900' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => handleBrandSelect(brand.name)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2">
                      <img 
                        src={brand.logo} 
                        alt={`${brand.name} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback si la imagen no carga
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-1.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>';
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-200 text-center">
                      {brand.name}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Search Results Placeholder */}
            {(searchForm.tecdocCode || searchForm.motorCode || searchForm.licensePlate || selectedBrand) && (
              <Card className="mt-8 p-6 bg-gray-800 border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Resultados de Búsqueda</h3>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">
                    {/* FIXME: Conectar con sistema de búsqueda real */}
                    Mostrando recambios para {selectedBrand || 'vehículo seleccionado'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Funcionalidad de búsqueda en desarrollo
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-6 w-6" />
                <span className="text-xl font-bold">PartFinder</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Tu especialista en recambios de automóvil. Encuentra las piezas que necesitas 
                con la garantía de calidad que mereces.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Búsqueda por TecDoc</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Catálogo de Marcas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Asesoría Técnica</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Envío Express</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Información</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Devoluciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Garantías</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+34 900 123 456</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@PartFinder.es</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Barcelona, España</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 PartFinder. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}