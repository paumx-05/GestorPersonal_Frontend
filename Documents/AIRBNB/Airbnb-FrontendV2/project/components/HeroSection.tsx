/**
 * Hero Section Component - Main promotional banner
 * Features: Welcome message, promotional text, and call-to-action
 * TODO: Add dynamic background images carousel
 * FIXME: Optimize hero image loading for better performance
 */
export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 airbnb-gradient"></div>
      
      {/* Background pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2371c4ef' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primario-100 mb-6 leading-tight">
          Discover
          <span className="text-acento-100 block sm:inline sm:ml-4">
            Luxury Escapes
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-primario-200 mb-8 max-w-2xl mx-auto leading-relaxed">
          Experience exclusive villas, luxury apartments, and private islands in the world's most coveted destinations. Your dream getaway awaits.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-acento-100 hover:bg-acento-200 text-texto-100 font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-acento-100/30 w-full sm:w-auto">
            Explore Properties
          </button>
          
          <button className="border-2 border-primario-100 text-primario-100 hover:bg-primario-100 hover:text-primario-300 font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
            View Experiences
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-acento-100 mb-2">500+</div>
            <div className="text-sm text-primario-200">Luxury Properties</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-acento-100 mb-2">50+</div>
            <div className="text-sm text-primario-200">Private Islands</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-acento-100 mb-2">95%</div>
            <div className="text-sm text-primario-200">Guest Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}