import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, Heart, Shield, Users, Globe, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * About Page - Página de información sobre Airbnb Luxury
 * URL: /about
 * Features: Información completa de la empresa, valores, estadísticas y equipo
 */
export default function AboutPage() {
  const stats = [
    { number: '4M+', label: 'Huéspedes felices' },
    { number: '220+', label: 'Países y regiones' },
    { number: '100k+', label: 'Propiedades de lujo' },
    { number: '15+', label: 'Años de experiencia' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Hospitalidad auténtica',
      description: 'Creemos que viajar debe ser una experiencia que toque el corazón y cree recuerdos duraderos.'
    },
    {
      icon: Shield,
      title: 'Confianza y seguridad',
      description: 'Tu seguridad es nuestra prioridad. Verificamos cada propiedad y anfitrión en nuestra plataforma.'
    },
    {
      icon: Users,
      title: 'Comunidad global',
      description: 'Conectamos personas de todo el mundo, creando una comunidad diversa de viajeros y anfitriones.'
    },
    {
      icon: Globe,
      title: 'Impacto positivo',
      description: 'Trabajamos para que el turismo tenga un impacto positivo en las comunidades locales.'
    }
  ];

  const team = [
    {
      name: 'María González',
      role: 'CEO & Fundadora',
      description: 'Visionaria del turismo de lujo con 20 años de experiencia en hospitalidad.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'CTO',
      description: 'Experto en tecnología que lidera la innovación de nuestra plataforma.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Ana Martínez',
      role: 'Head of Experience',
      description: 'Especialista en experiencias de usuario y satisfacción del cliente.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
            <div className="flex justify-center mb-6">
              <Sparkles className="h-16 w-16 text-[#FF385C]" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Sobre Airbnb Luxury
        </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Somos más que una plataforma de alojamiento. Somos creadores de experiencias únicas 
              que conectan viajeros con propiedades excepcionales y anfitriones apasionados por la hospitalidad.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-[#FF385C] hover:bg-[#E31C5F] text-white px-8 py-3">
                Únete a nuestra comunidad
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#FF385C] mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-slate-300">
                <p>
                  Airbnb Luxury nació en 2008 con una visión simple pero poderosa: hacer que cualquier persona 
                  pueda sentirse como en casa, en cualquier lugar del mundo. Lo que comenzó como una idea para 
                  ayudar a dos anfitriones a pagar su alquiler, se ha convertido en una comunidad global.
                </p>
                <p>
                  Hoy, millones de anfitriones y viajeros eligen crear una cuenta gratuita en Airbnb para 
                  publicar sus espacios, reservar viajes únicos y disfrutar de experiencias increíbles.
                </p>
                <p>
                  Nos enorgullece ser una plataforma que no solo conecta personas, sino que también empodera 
                  a las comunidades locales y crea oportunidades económicas en todo el mundo.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop" 
                alt="Nuestra historia" 
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-[#FF385C]/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Nuestros Valores
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Los principios que guían cada decisión y nos inspiran a crear experiencias excepcionales.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-slate-700 border-slate-600 text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <value.icon className="h-12 w-12 text-[#FF385C]" />
                  </div>
                  <CardTitle className="text-white text-xl">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Las personas apasionadas que hacen posible que millones de viajeros vivan experiencias únicas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#FF385C]"
                    />
                  </div>
                  <CardTitle className="text-white text-xl">
                    {member.name}
                  </CardTitle>
                  <CardDescription className="text-[#FF385C] font-semibold">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#FF385C] to-[#E31C5F]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Award className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a millones de viajeros que han descubierto experiencias únicas con Airbnb Luxury. 
            Tu próximo destino te está esperando.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="outline" className="bg-white text-[#FF385C] border-white hover:bg-slate-100">
                Explorar propiedades
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#FF385C]">
                Convertirse en anfitrión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="bg-slate-800 border-t border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}