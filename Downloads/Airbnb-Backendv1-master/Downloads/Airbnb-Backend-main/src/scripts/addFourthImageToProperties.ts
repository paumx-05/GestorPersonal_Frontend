/**
 * Script para agregar una quinta imagen a propiedades existentes que tienen menos de 5 imágenes
 * Ejecutar: npx ts-node src/scripts/addFourthImageToProperties.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { PropertyModel } from '../models/schemas/PropertySchema';
import { HostPropertyModel } from '../models/schemas/HostSchema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend';

// Imágenes adicionales para agregar (diferentes para variedad)
const additionalImages = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
  'https://images.unsplash.com/photo-1560448075-cbc16bb4af80?w=800',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
];

function getRandomAdditionalImage(index: number): string {
  return additionalImages[index % additionalImages.length];
}

async function addFourthImageToProperties() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Actualizar propiedades en colección 'properties'
    console.log('📝 Actualizando propiedades en colección "properties"...');
    const properties = await PropertyModel.find({});
    let updatedPropertiesCount = 0;

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const currentImages = property.images || [];
      
      if (currentImages.length < 5) {
        const imagesToAdd = 5 - currentImages.length;
        const newImages = [...currentImages];
        
        for (let j = 0; j < imagesToAdd; j++) {
          newImages.push(getRandomAdditionalImage(i + j));
        }
        
        await PropertyModel.findByIdAndUpdate(
          property._id,
          { images: newImages },
          { new: true }
        );
        
        updatedPropertiesCount++;
        console.log(`   ✅ Actualizada: ${property.title} (${currentImages.length} → ${newImages.length} imágenes)`);
      }
    }

    console.log(`\n📊 Propiedades actualizadas en "properties": ${updatedPropertiesCount}/${properties.length}\n`);

    // Actualizar propiedades en colección 'host_properties'
    console.log('📝 Actualizando propiedades en colección "host_properties"...');
    const hostProperties = await HostPropertyModel.find({});
    let updatedHostPropertiesCount = 0;

    for (let i = 0; i < hostProperties.length; i++) {
      const hostProperty = hostProperties[i];
      const currentImages = hostProperty.images || [];
      
      if (currentImages.length < 5) {
        const imagesToAdd = 5 - currentImages.length;
        const newImages = [...currentImages];
        
        for (let j = 0; j < imagesToAdd; j++) {
          newImages.push(getRandomAdditionalImage(i + j + updatedPropertiesCount));
        }
        
        await HostPropertyModel.findByIdAndUpdate(
          hostProperty._id,
          { images: newImages },
          { new: true }
        );
        
        updatedHostPropertiesCount++;
        console.log(`   ✅ Actualizada: ${hostProperty.title} (${currentImages.length} → ${newImages.length} imágenes)`);
      }
    }

    console.log(`\n📊 Propiedades actualizadas en "host_properties": ${updatedHostPropertiesCount}/${hostProperties.length}`);

    const totalUpdated = updatedPropertiesCount + updatedHostPropertiesCount;
    const totalProperties = properties.length + hostProperties.length;

    console.log('\n🎉 ¡Proceso completado!');
    console.log(`   - Total actualizado: ${totalUpdated}/${totalProperties} propiedades`);
    console.log(`   - Propiedades en "properties": ${updatedPropertiesCount}`);
    console.log(`   - Propiedades en "host_properties": ${updatedHostPropertiesCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error actualizando propiedades:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar el script
addFourthImageToProperties();

