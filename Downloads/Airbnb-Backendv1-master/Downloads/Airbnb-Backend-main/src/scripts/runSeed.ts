import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import prompts from 'prompts';
import bcrypt from 'bcryptjs';

import { UserModel } from '../models/schemas/UserSchema';
import { PropertyModel } from '../models/schemas/PropertySchema';
import { ReservationModel } from '../models/schemas/ReservationSchema';
import { ReviewModel } from '../models/schemas/ReviewSchema';
import { FavoriteModel, WishlistModel } from '../models/schemas/FavoriteSchema';
import { NotificationModel, NotificationSettingsModel } from '../models/schemas/NotificationSchema';
import { PaymentMethodModel, TransactionModel } from '../models/schemas/PaymentSchema';
import { CartItemModel } from '../models/schemas/CartSchema';
import { HostPropertyModel } from '../models/schemas/HostSchema';

type YesNo = { ok: boolean };

async function confirm(message: string, initial: boolean = true): Promise<boolean> {
  const res = await prompts({
    type: 'confirm',
    name: 'ok',
    message,
    initial
  }, {
    onCancel: () => process.exit(0)
  }) as YesNo;
  return !!res.ok;
}

function oid(hex: string) {
  return new Types.ObjectId(hex);
}

async function verifyConnection(uri: string) {
  console.log('ℹ️  Verificando conexión con MongoDB...');
  await mongoose.connect(uri);
  if (!mongoose.connection.db) {
    throw new Error('No se pudo establecer conexión con la base de datos');
  }
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log('✅ Conexión verificada con ping OK');
}

async function clearDatabase() {
  console.log('⚠️  ALERTA: Esta acción eliminará datos existentes en TODAS las colecciones.');
  await UserModel.deleteMany({});
  await PropertyModel.deleteMany({});
  await ReservationModel.deleteMany({});
  await ReviewModel.deleteMany({});
  await FavoriteModel.deleteMany({});
  await WishlistModel.deleteMany({});
  await NotificationModel.deleteMany({});
  await NotificationSettingsModel.deleteMany({});
  await PaymentMethodModel.deleteMany({});
  await TransactionModel.deleteMany({});
  await CartItemModel.deleteMany({});
  await HostPropertyModel.deleteMany({});
  console.log('🗑️  Base de datos limpia');
}

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend';
  console.log(`🔗 URI: ${MONGODB_URI}`);

  if (!(await confirm('¿Conectar a MongoDB y verificar ping?'))) return;
  try {
    await verifyConnection(MONGODB_URI);
  } catch (err) {
    console.error('❌ No se pudo conectar o hacer ping a MongoDB:', err);
    process.exit(1);
  }

  if (await confirm('⚠️  ALERTA: ¿Limpiar TODAS las colecciones antes de insertar? Esta acción es destructiva.')) {
    await clearDatabase();
  } else {
    console.log('⏭️  Omitiendo limpieza. Los índices únicos podrían fallar si hay datos existentes.');
  }

  // IDs fijos para consistencia de relaciones
  const adminId = oid('65f0aa10aa10aa10aa10aa10');
  const userId  = oid('65f0bb20bb20bb20bb20bb20');
  const propertyId = oid('65f0cc30cc30cc30cc30cc30');
  const hostPropertyId = oid('65f0dd40dd40dd40dd40dd40');
  const reservationId = oid('65f0ee50ee50ee50ee50ee50');
  const reviewId = oid('65f0ff60ff60ff60ff60ff60');
  const cartItemId = oid('65f10070f10070f10070f100');
  const wishlistId = oid('65f11180f11180f11180f111');
  const notifId = oid('65f12290f12290f12290f122');
  const notifSetId = oid('65f133a0f133a0f133a0f133');
  const paymentMethodId = oid('65f144b0f144b0f144b0f144');
  const transactionId = oid('65f155c0f155c0f155c0f155');

  // 1) Usuarios: admin y regular
  if (await confirm('¿Crear usuarios (admin y regular)?')) {
    console.log('⚠️  ALERTA: Se crearán cuentas con emails y contraseñas demo dentro de la BD.');
    const [adminPass, userPass] = await Promise.all([
      bcrypt.hash('Admin1234!', 10),
      bcrypt.hash('User1234!', 10)
    ]);

    await UserModel.insertMany([
      {
        _id: adminId,
        email: 'admin@demo.com',
        name: 'Admin',
        password: adminPass,
        avatar: 'https://i.pravatar.cc/150?img=11',
        isActive: true,
        role: 'admin'
      },
      {
        _id: userId,
        email: 'user@demo.com',
        name: 'Regular User',
        password: userPass,
        avatar: 'https://i.pravatar.cc/150?img=12',
        isActive: true,
        role: 'user'
      }
    ]);
    console.log('👤 Usuarios creados');
  }

  // 2) Host property (para admin como host) y property pública
  if (await confirm('¿Crear propiedades (host_properties y properties)?')) {
    await HostPropertyModel.create({
      _id: hostPropertyId,
      hostId: adminId.toHexString(),
      title: 'Loft moderno del admin',
      description: 'Loft amplio y luminoso, ideal para trabajo remoto.',
      location: 'Calle Sol 123, Madrid, España',
      propertyType: 'entire',
      pricePerNight: 120,
      maxGuests: 3,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['WiFi', 'Calefacción', 'Cafetera'],
      images: [
        'https://picsum.photos/800/600?random=10',
        'https://picsum.photos/800/600?random=11',
        'https://picsum.photos/800/600?random=12',
        'https://picsum.photos/800/600?random=13',
        'https://picsum.photos/800/600?random=14'
      ],
      rules: ['No fumar', 'No fiestas'],
      status: 'active'
    });

    await PropertyModel.create({
      _id: propertyId,
      title: 'Apartamento céntrico con balcón',
      description: 'A 5 min del metro, con vistas a la plaza.',
      location: {
        address: 'Av. Centro 456',
        city: 'Madrid',
        country: 'España',
        coordinates: { lat: 40.4169, lng: -3.7040 }
      },
      propertyType: 'entire',
      pricePerNight: 95,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['WiFi', 'Cocina', 'TV'],
      images: [
        'https://picsum.photos/800/600?random=20',
        'https://picsum.photos/800/600?random=21',
        'https://picsum.photos/800/600?random=22',
        'https://picsum.photos/800/600?random=23',
        'https://picsum.photos/800/600?random=24'
      ],
      host: {
        id: adminId.toHexString(),
        name: 'Admin',
        avatar: 'https://i.pravatar.cc/150?img=11',
        isSuperhost: true
      },
      rating: 4.7,
      reviewCount: 0,
      instantBook: true
    });

    console.log('🏠 Propiedades creadas');
  }

  // 3) Reservación, review, carrito
  if (await confirm('¿Crear reservación, review y carrito?')) {
    const checkIn = new Date(Date.now() + 1000*60*60*24*7);
    const checkOut = new Date(Date.now() + 1000*60*60*24*10);

    await ReservationModel.create({
      _id: reservationId,
      userId: userId.toHexString(),
      propertyId: propertyId.toHexString(),
      checkIn,
      checkOut,
      guests: 2,
      totalPrice: 95 * 3,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: 'Llegada tarde'
    });

    await ReviewModel.create({
      _id: reviewId,
      propertyId: propertyId.toHexString(),
      userId: userId.toHexString(),
      reservationId: reservationId.toHexString(),
      rating: 5,
      comment: 'Excelente estancia, muy recomendado.',
      categories: {
        cleanliness: 5,
        communication: 5,
        checkin: 5,
        accuracy: 5,
        location: 5,
        value: 5
      },
      isVerified: true
    });

    await CartItemModel.create({
      _id: cartItemId,
      userId: userId.toHexString(),
      propertyId: propertyId.toHexString(),
      checkIn: new Date(Date.now() + 1000*60*60*24*30),
      checkOut: new Date(Date.now() + 1000*60*60*24*33),
      guests: 2,
      pricePerNight: 95,
      totalNights: 3,
      subtotal: 285,
      cleaningFee: 20,
      serviceFee: 15,
      taxes: 10,
      total: 330,
      expiresAt: new Date(Date.now() + 1000*60*60*24)
    });

    console.log('🧾 Reservación, review y carrito creados');
  }

  // 4) Favoritos, wishlist
  if (await confirm('¿Crear favoritos y wishlist?')) {
    await FavoriteModel.create({
      userId: userId.toHexString(),
      propertyId: propertyId.toHexString()
    });

    await WishlistModel.create({
      _id: wishlistId,
      userId: userId.toHexString(),
      name: 'Para verano',
      description: 'Lugares para visitar en verano',
      isPublic: false,
      propertyIds: [propertyId.toHexString()]
    });

    console.log('💖 Favoritos y wishlist creados');
  }

  // 5) Notificaciones y settings
  if (await confirm('¿Crear notificaciones y configuración de notificaciones?')) {
    await NotificationModel.create({
      _id: notifId,
      userId: userId.toHexString(),
      type: 'reservation',
      title: 'Reserva confirmada',
      message: 'Tu reserva fue confirmada.',
      isRead: false,
      data: { reservationId: reservationId.toHexString() }
    });

    await NotificationSettingsModel.create({
      _id: notifSetId,
      userId: userId.toHexString(),
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      preferences: {
        reservations: true,
        payments: true,
        reviews: true,
        system: true
      }
    });

    console.log('🔔 Notificaciones y settings creados');
  }

  // 6) Pagos: método y transacción
  if (await confirm('¿Crear método de pago y transacción?')) {
    await PaymentMethodModel.create({
      _id: paymentMethodId,
      userId: userId.toHexString(),
      type: 'card',
      cardNumber: '4242424242424242',
      cardBrand: 'visa',
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 2,
      isDefault: true
    });

    await TransactionModel.create({
      _id: transactionId,
      userId: userId.toHexString(),
      propertyId: propertyId.toHexString(),
      reservationId: reservationId.toHexString(),
      amount: 330,
      currency: 'USD',
      status: 'completed',
      paymentMethod: paymentMethodId.toHexString(),
      transactionId: 'TX-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      description: 'Pago de reserva'
    });

    console.log('💳 Método de pago y transacción creados');
  }

  console.log('✅ Seed finalizado');
  await mongoose.connection.close();
  console.log('👋 Conexión cerrada');
  process.exit(0);
}

run().catch(async (err) => {
  console.error('❌ Error en seed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});


