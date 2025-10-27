import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/schemas/UserSchema';

/**
 * 🎯 SCRIPT PARA CREAR USUARIO ADMINISTRADOR
 * 
 * Este script crea un usuario administrador en la base de datos
 * con permisos completos de administración.
 */

interface AdminUserData {
  email: string;
  name: string;
  password: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
}

async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend';
  console.log(`🔗 Conectando a: ${MONGODB_URI}`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión a MongoDB establecida');
    
    // Verificar conexión con ping
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log('✅ Ping a MongoDB exitoso');
    }
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
}

async function checkIfAdminExists(email: string): Promise<boolean> {
  try {
    const existingAdmin = await UserModel.findOne({ 
      email: email.toLowerCase(),
      role: 'admin'
    });
    return !!existingAdmin;
  } catch (error) {
    console.error('❌ Error verificando admin existente:', error);
    throw error;
  }
}

async function createAdminUser(adminData: AdminUserData): Promise<void> {
  try {
    // Verificar si ya existe un admin con ese email
    const adminExists = await checkIfAdminExists(adminData.email);
    if (adminExists) {
      console.log(`⚠️  Ya existe un administrador con el email: ${adminData.email}`);
      return;
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    console.log('🔐 Contraseña encriptada');

    // Crear usuario administrador
    const adminUser = new UserModel({
      email: adminData.email.toLowerCase(),
      name: adminData.name.trim(),
      password: hashedPassword,
      avatar: adminData.avatar || 'https://i.pravatar.cc/150?img=1',
      bio: adminData.bio || 'Administrador del sistema',
      location: adminData.location || 'Madrid, España',
      phone: adminData.phone || '+34 600 000 000',
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    });

    const savedAdmin = await adminUser.save();
    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`📧 Email: ${savedAdmin.email}`);
    console.log(`👤 Nombre: ${savedAdmin.name}`);
    console.log(`🆔 ID: ${savedAdmin._id}`);
    console.log(`🔑 Rol: ${savedAdmin.role}`);
    console.log(`📅 Creado: ${savedAdmin.createdAt}`);

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    throw error;
  }
}

async function listExistingAdmins(): Promise<void> {
  try {
    const admins = await UserModel.find({ role: 'admin' }).select('email name role createdAt isActive');
    console.log('\n📋 Administradores existentes:');
    if (admins.length === 0) {
      console.log('   No hay administradores en el sistema');
    } else {
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - ${admin.role} - ${admin.isActive ? 'Activo' : 'Inactivo'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error listando administradores:', error);
  }
}

async function main() {
  console.log('🎯 CREACIÓN DE USUARIO ADMINISTRADOR');
  console.log('=====================================\n');

  try {
    // Conectar a la base de datos
    await connectToDatabase();

    // Listar administradores existentes
    await listExistingAdmins();

    // Datos del administrador a crear
    const adminData: AdminUserData = {
      email: 'admin@airbnb.com',
      name: 'Administrador Principal',
      password: 'Admin1234!',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Administrador principal del sistema Airbnb',
      location: 'Madrid, España',
      phone: '+34 600 000 000'
    };

    console.log('\n🔧 Creando usuario administrador...');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`👤 Nombre: ${adminData.name}`);
    console.log(`🔑 Contraseña: ${adminData.password}`);

    // Crear el usuario administrador
    await createAdminUser(adminData);

    // Listar administradores después de la creación
    console.log('\n📋 Estado final de administradores:');
    await listExistingAdmins();

    console.log('\n✅ Proceso completado exitosamente');
    console.log('\n🔐 CREDENCIALES DE ACCESO:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Contraseña: ${adminData.password}`);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    try {
      await mongoose.connection.close();
      console.log('\n👋 Conexión a MongoDB cerrada');
    } catch (error) {
      console.error('❌ Error cerrando conexión:', error);
    }
    process.exit(0);
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

export { createAdminUser, checkIfAdminExists, listExistingAdmins };
