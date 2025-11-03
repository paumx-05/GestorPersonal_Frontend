/**
 * 🔄 SCRIPT DE MIGRACIÓN: Agregar campos description y avatar a usuarios existentes
 * 
 * Este script agrega los campos `description` y `avatar` a usuarios que no los tengan
 * en la base de datos MongoDB.
 * 
 * Ejecutar: npm run migrate:user-schema
 * O directamente: ts-node src/scripts/migrateUserSchema.ts
 */

import mongoose from 'mongoose';
import { UserModel } from '../models/schemas/UserSchema';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definida en el archivo .env');
  process.exit(1);
}

// Ahora TypeScript sabe que MONGODB_URI no es undefined
const mongoUri: string = MONGODB_URI;

async function migrateUserSchema() {
  try {
    console.log('🔄 Iniciando migración del schema de usuarios...\n');

    // Conectar a MongoDB con opciones apropiadas
    console.log('📡 Conectando a MongoDB...');
    console.log(`📍 URI: ${mongoUri.substring(0, 30)}...`); // Mostrar solo los primeros caracteres por seguridad
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 segundos
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conectado a MongoDB\n');

    // Verificar usuarios sin campo description
    const usersWithoutDescription = await UserModel.countDocuments({
      description: { $exists: false }
    });

    // Verificar usuarios sin campo avatar
    const usersWithoutAvatar = await UserModel.countDocuments({
      avatar: { $exists: false }
    });

    console.log(`📊 Usuarios sin campo 'description': ${usersWithoutDescription}`);
    console.log(`📊 Usuarios sin campo 'avatar': ${usersWithoutAvatar}\n`);

    // Agregar campo description a usuarios que no lo tengan
    if (usersWithoutDescription > 0) {
      console.log('🔄 Agregando campo "description" a usuarios existentes...');
      const updateDescription = await UserModel.updateMany(
        { description: { $exists: false } },
        { $set: { description: null } }
      );
      console.log(`✅ Actualizados ${updateDescription.modifiedCount} usuarios con campo 'description'`);
    } else {
      console.log('✅ Todos los usuarios ya tienen el campo "description"');
    }

    // Agregar campo avatar a usuarios que no lo tengan
    if (usersWithoutAvatar > 0) {
      console.log('🔄 Agregando campo "avatar" a usuarios existentes...');
      const updateAvatar = await UserModel.updateMany(
        { avatar: { $exists: false } },
        { $set: { avatar: null } }
      );
      console.log(`✅ Actualizados ${updateAvatar.modifiedCount} usuarios con campo 'avatar'`);
    } else {
      console.log('✅ Todos los usuarios ya tienen el campo "avatar"');
    }

    // Verificar resultado
    const totalUsers = await UserModel.countDocuments();
    console.log(`\n📊 Total de usuarios en la base de datos: ${totalUsers}`);

    // Verificar que todos los usuarios tienen los campos
    const usersWithAllFields = await UserModel.countDocuments({
      description: { $exists: true },
      avatar: { $exists: true }
    });

    if (usersWithAllFields === totalUsers) {
      console.log('\n✅ Migración completada exitosamente');
      console.log('✅ Todos los usuarios tienen los campos requeridos');
    } else {
      console.log(`\n⚠️  Advertencia: ${totalUsers - usersWithAllFields} usuarios aún no tienen todos los campos`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en la migración:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar migración
migrateUserSchema();

