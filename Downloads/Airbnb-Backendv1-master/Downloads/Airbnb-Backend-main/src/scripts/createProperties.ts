/**
 * Script para crear 10 propiedades de ejemplo en MongoDB Atlas
 * Ejecutar: npx ts-node src/scripts/createProperties.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { PropertyModel } from '../models/schemas/PropertySchema';
import { HostPropertyModel } from '../models/schemas/HostSchema';
import { UserModel } from '../models/schemas/UserSchema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend';

// Datos de 10 propiedades
const properties = [
  {
    title: 'Loft moderno en el centro de Madrid',
    description: 'Amplio loft luminoso con techos altos, perfecto para una escapada urbana. Ubicado en el corazón de Madrid, a pocos pasos de las principales atracciones turísticas. Incluye todas las comodidades modernas.',
    location: {
      address: 'Calle Gran Vía, 45',
      city: 'Madrid',
      country: 'España',
      coordinates: { lat: 40.4168, lng: -3.7038 }
    },
    propertyType: 'entire',
    pricePerNight: 95,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Cocina completa', 'Lavadora', 'Aire acondicionado', 'Calefacción', 'TV', 'Ascensor'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    rating: 4.8,
    reviewCount: 127,
    instantBook: true
  },
  {
    title: 'Piso acogedor con balcón en Barcelona',
    description: 'Encantador apartamento con balcón privado y vistas a la calle. Decoración moderna y acogedora. Perfecto para parejas o pequeños grupos. Situado en el barrio de Gràcia, lleno de cafés y restaurantes.',
    location: {
      address: 'Carrer de Verdi, 12',
      city: 'Barcelona',
      country: 'España',
      coordinates: { lat: 41.4020, lng: 2.1580 }
    },
    propertyType: 'entire',
    pricePerNight: 78,
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Cocina', 'Balcón', 'Aire acondicionado', 'TV'],
    images: [
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e8?w=800',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800',
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af80?w=800'
    ],
    rating: 4.6,
    reviewCount: 89,
    instantBook: false
  },
  {
    title: 'Casa tradicional andaluza en Sevilla',
    description: 'Hermosa casa andaluza restaurada con patio interior y azulejos originales. Experiencia auténtica en el barrio de Triana. Incluye todas las comodidades modernas manteniendo el encanto tradicional.',
    location: {
      address: 'Calle Betis, 32',
      city: 'Sevilla',
      country: 'España',
      coordinates: { lat: 37.3891, lng: -5.9845 }
    },
    propertyType: 'entire',
    pricePerNight: 120,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Cocina completa', 'Patio', 'Lavadora', 'Aire acondicionado', 'TV', 'Piscina pequeña'],
    images: [
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af80?w=800',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      'https://images.unsplash.com/photo-1567443023826-6029e859fff5?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800'
    ],
    rating: 4.9,
    reviewCount: 156,
    instantBook: true
  },
  {
    title: 'Estudio minimalista en Valencia',
    description: 'Estudio moderno y funcional perfectamente equipado. Diseño minimalista con todos los servicios necesarios. Ubicado cerca de la playa y del centro histórico.',
    location: {
      address: 'Avenida del Puerto, 8',
      city: 'Valencia',
      country: 'España',
      coordinates: { lat: 39.4699, lng: -0.3763 }
    },
    propertyType: 'entire',
    pricePerNight: 65,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Cocina', 'Aire acondicionado', 'TV', 'Cerca de la playa'],
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    rating: 4.5,
    reviewCount: 73,
    instantBook: true
  },
  {
    title: 'Penthouse con terraza y vistas al mar en Málaga',
    description: 'Lujoso penthouse con terraza privada y vistas espectaculares al Mediterráneo. Perfecto para disfrutar de puestas de sol. Incluye todas las comodidades de alta gama.',
    location: {
      address: 'Paseo Marítimo, 15',
      city: 'Málaga',
      country: 'España',
      coordinates: { lat: 36.7213, lng: -4.4214 }
    },
    propertyType: 'entire',
    pricePerNight: 180,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Cocina de lujo', 'Terraza', 'Lavadora', 'Secadora', 'Aire acondicionado', 'TV 4K', 'Jacuzzi', 'Vistas al mar'],
    images: [
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
    ],
    rating: 4.9,
    reviewCount: 94,
    instantBook: true
  },
  {
    title: 'Casa rural con jardín en Bilbao',
    description: 'Casa rural acogedora con amplio jardín y barbacoa. Ideal para familias que buscan tranquilidad. Situada a las afueras pero con fácil acceso al centro.',
    location: {
      address: 'Carretera de Artxanda, 45',
      city: 'Bilbao',
      country: 'España',
      coordinates: { lat: 43.2630, lng: -2.9350 }
    },
    propertyType: 'entire',
    pricePerNight: 110,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 2,
    amenities: ['WiFi', 'Cocina completa', 'Jardín', 'Barbacoa', 'Lavadora', 'Calefacción', 'TV', 'Aparcamiento'],
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800'
    ],
    rating: 4.7,
    reviewCount: 112,
    instantBook: false
  },
  {
    title: 'Apartamento vintage en San Sebastián',
    description: 'Charmante apartamento con decoración vintage y personalidad propia. Ubicado en el centro histórico, cerca de las mejores playas y restaurantes.',
    location: {
      address: 'Calle Mayor, 7',
      city: 'San Sebastián',
      country: 'España',
      coordinates: { lat: 43.3183, lng: -1.9812 }
    },
    propertyType: 'entire',
    pricePerNight: 105,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Cocina', 'Calefacción', 'TV', 'Cerca de la playa'],
    images: [
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e8?w=800',
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af80?w=800',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    rating: 4.8,
    reviewCount: 145,
    instantBook: true
  },
  {
    title: 'Loft industrial en Zaragoza',
    description: 'Moderno loft con estilo industrial, techos altos y amplios ventanales. Perfecto para amantes del diseño contemporáneo. Situado en zona cultural.',
    location: {
      address: 'Calle San Miguel, 22',
      city: 'Zaragoza',
      country: 'España',
      coordinates: { lat: 41.6488, lng: -0.8891 }
    },
    propertyType: 'entire',
    pricePerNight: 85,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Cocina', 'Lavadora', 'Aire acondicionado', 'TV', 'Espacio de trabajo'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    rating: 4.6,
    reviewCount: 68,
    instantBook: true
  },
  {
    title: 'Casa de campo en Granada',
    description: 'Encantadora casa de campo con piscina y vistas a la Alhambra. Ambiente tranquilo y relajante. Perfecta para desconectar y disfrutar de la naturaleza.',
    location: {
      address: 'Camino de los Neveros, 5',
      city: 'Granada',
      country: 'España',
      coordinates: { lat: 37.1773, lng: -3.5986 }
    },
    propertyType: 'entire',
    pricePerNight: 150,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Cocina completa', 'Piscina', 'Jardín', 'Lavadora', 'Calefacción', 'TV', 'Vistas panorámicas'],
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
    ],
    rating: 4.9,
    reviewCount: 203,
    instantBook: true
  },
  {
    title: 'Apartamento moderno en Palma de Mallorca',
    description: 'Elegante apartamento con estilo nórdico, luz natural y decoración minimalista. Ubicado cerca de la playa y del centro histórico. Perfecto para una escapada mediterránea.',
    location: {
      address: 'Paseo del Borne, 18',
      city: 'Palma de Mallorca',
      country: 'España',
      coordinates: { lat: 39.5696, lng: 2.6502 }
    },
    propertyType: 'entire',
    pricePerNight: 115,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Cocina completa', 'Lavadora', 'Aire acondicionado', 'TV', 'Terraza', 'Cerca de la playa'],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e8?w=800',
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af80?w=800',
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
    ],
    rating: 4.7,
    reviewCount: 138,
    instantBook: true
  }
];

async function createProperties() {
  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas\n');

    // Obtener un usuario admin o el primer usuario disponible para asignar como host
    const adminUser = await UserModel.findOne({ role: 'admin' });
    const anyUser = await UserModel.findOne();
    const hostUser = adminUser || anyUser;

    if (!hostUser) {
      console.error('❌ Error: No hay usuarios en la base de datos. Por favor crea al menos un usuario primero.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`👤 Usando usuario como host: ${hostUser.name} (${hostUser.email})\n`);

    // Crear las propiedades
    const createdProperties = [];
    const createdHostProperties = [];

    for (let i = 0; i < properties.length; i++) {
      const propData = properties[i];
      
      console.log(`📝 Creando propiedad ${i + 1}/10: ${propData.title}...`);

      // Crear en colección properties
      const hostUserId = String((hostUser as any)._id);
      const property = new PropertyModel({
        ...propData,
        host: {
          id: hostUserId,
          name: hostUser.name,
          avatar: hostUser.avatar || '',
          isSuperhost: false
        }
      });

      const savedProperty = await property.save();
      createdProperties.push(savedProperty);
      console.log(`   ✅ Guardada en properties con ID: ${savedProperty._id}`);

      // Crear también en host_properties para consistencia
      const hostProperty = new HostPropertyModel({
        hostId: hostUserId,
        title: propData.title,
        description: propData.description,
        location: `${propData.location.address}, ${propData.location.city}, ${propData.location.country}`,
        propertyType: propData.propertyType,
        pricePerNight: propData.pricePerNight,
        maxGuests: propData.maxGuests,
        bedrooms: propData.bedrooms,
        bathrooms: propData.bathrooms,
        amenities: propData.amenities,
        images: propData.images,
        isActive: true,
        status: 'active'
      });

      const savedHostProperty = await hostProperty.save();
      createdHostProperties.push(savedHostProperty);
      console.log(`   ✅ Guardada en host_properties con ID: ${savedHostProperty._id}\n`);
    }

    console.log('\n🎉 ¡Éxito! Se crearon 10 propiedades:');
    console.log(`   - ${createdProperties.length} en colección 'properties'`);
    console.log(`   - ${createdHostProperties.length} en colección 'host_properties'`);
    console.log('\n📊 Resumen:');
    createdProperties.forEach((prop, index) => {
      console.log(`   ${index + 1}. ${prop.title} - ${prop.pricePerNight}€/noche`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB Atlas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando propiedades:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar el script
createProperties();

