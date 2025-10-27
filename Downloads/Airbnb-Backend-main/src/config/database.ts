import mongoose from 'mongoose';

/**
 * 🔧 CONFIGURACIÓN DE BASE DE DATOS
 * Conexión a MongoDB Atlas (producción)
 */

export const getDatabaseConfig = () => ({
  type: 'mongodb',
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend'
});

const connectDB = async (): Promise<void> => {
  const config = getDatabaseConfig();
  
  try {
    // Limpiar modelos existentes para evitar conflictos
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(config.mongoURI);
    console.log('✅ MongoDB Atlas conectado exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error instanceof Error ? error.message : 'Error desconocido');
    throw error;
  }
};

export default connectDB;
