/**
 * Script para verificar cuántas imágenes tiene cada propiedad
 * Ejecutar: npx ts-node src/scripts/verifyPropertyImages.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { PropertyModel } from '../models/schemas/PropertySchema';
import { HostPropertyModel } from '../models/schemas/HostSchema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend';

async function verifyPropertyImages() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Verificar propiedades en colección 'properties'
    console.log('📝 Verificando propiedades en colección "properties"...');
    const properties = await PropertyModel.find({});
    
    console.log(`\nTotal de propiedades: ${properties.length}\n`);
    
    properties.forEach((property, index) => {
      const imageCount = property.images?.length || 0;
      const status = imageCount >= 5 ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${property.title}: ${imageCount} imágenes`);
      if (imageCount < 5) {
        console.log(`   ⚠️  Falta ${5 - imageCount} imagen(es)`);
      }
    });

    // Verificar propiedades en colección 'host_properties'
    console.log('\n\n📝 Verificando propiedades en colección "host_properties"...');
    const hostProperties = await HostPropertyModel.find({});
    
    console.log(`\nTotal de propiedades: ${hostProperties.length}\n`);
    
    hostProperties.forEach((hostProperty, index) => {
      const imageCount = hostProperty.images?.length || 0;
      const status = imageCount >= 5 ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${hostProperty.title}: ${imageCount} imágenes`);
      if (imageCount < 5) {
        console.log(`   ⚠️  Falta ${5 - imageCount} imagen(es)`);
      }
    });

    // Resumen
    const propertiesWith5Images = properties.filter(p => (p.images?.length || 0) >= 5).length;
    const hostPropertiesWith5Images = hostProperties.filter(p => (p.images?.length || 0) >= 5).length;

    console.log('\n\n📊 Resumen:');
    console.log(`   - Properties con 5+ imágenes: ${propertiesWith5Images}/${properties.length}`);
    console.log(`   - Host properties con 5+ imágenes: ${hostPropertiesWith5Images}/${hostProperties.length}`);

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verificando propiedades:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar el script
verifyPropertyImages();

