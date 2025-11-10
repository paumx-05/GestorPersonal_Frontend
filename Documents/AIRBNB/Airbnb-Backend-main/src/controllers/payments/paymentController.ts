import { Request, Response } from 'express';
import { PaymentRepositoryFactory } from '../../models/factories/PaymentRepositoryFactory';
import { ReservationRepositoryFactory } from '../../models/factories/ReservationRepositoryFactory';
import { NotificationRepositoryFactory } from '../../models/factories/NotificationRepositoryFactory';
import { CheckoutData } from '../../types/payments';
import { createPaymentIntent, getPaymentIntent } from '../../utils/stripe';
import { getPropertyById, checkAvailability } from '../../models';

const paymentRepo = PaymentRepositoryFactory.create();
const reservationRepo = ReservationRepositoryFactory.create();
const notificationRepo = NotificationRepositoryFactory.create();

// POST /api/payments/checkout/calculate
export const calculateCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    // Validaciones básicas
    if (!propertyId || !checkIn || !checkOut || !guests) {
      res.status(400).json({
        success: false,
        error: { message: 'Faltan datos requeridos para el cálculo' }
      });
      return;
    }

    const pricing = await paymentRepo.calculatePricing(propertyId, checkIn, checkOut, guests);

    res.json({
      success: true,
      data: {
        pricing,
        breakdown: {
          nights: pricing.nights,
          basePrice: pricing.basePrice,
          subtotal: pricing.subtotal,
          cleaningFee: pricing.cleaningFee,
          serviceFee: pricing.serviceFee,
          taxes: pricing.taxes,
          total: pricing.total,
          currency: pricing.currency
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error calculando el total' }
    });
  }
};

// POST /api/payments/checkout/process
export const processCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const checkoutData: CheckoutData = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validar datos de pago
    const isValid = await paymentRepo.validatePaymentData(checkoutData.paymentInfo);
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: { 
          message: 'Datos de pago inválidos'
        }
      });
      return;
    }

    // Calcular pricing
    const pricing = await paymentRepo.calculatePricing(
      checkoutData.propertyId,
      checkoutData.checkIn,
      checkoutData.checkOut,
      checkoutData.guests
    );

    // Crear método de pago (sin guardar número completo por seguridad)
    // En producción, esto debería usar un gateway de pago real como Stripe
    const paymentMethod = await paymentRepo.addPaymentMethod(userId, {
      userId,
      type: 'card',
      cardNumber: checkoutData.paymentInfo.cardNumber, // Se guarda temporalmente para el proceso
      cardBrand: paymentRepo.getCardBrand(checkoutData.paymentInfo.cardNumber) as any,
      expiryMonth: checkoutData.paymentInfo.expiryMonth,
      expiryYear: checkoutData.paymentInfo.expiryYear,
      cardholderName: checkoutData.paymentInfo.cardholderName,
      isDefault: false
    });

    // Crear transacción
    const transaction = await paymentRepo.createTransaction({
      userId,
      propertyId: checkoutData.propertyId,
      reservationId: 'pending',
      amount: pricing.total,
      currency: pricing.currency,
      status: 'processing',
      paymentMethod: paymentMethod,
      transactionId: `txn_${Date.now()}`,
      description: `Reserva de propiedad ${checkoutData.propertyId}`
    });

    // Procesar pago simulado
    const paymentResult = await paymentRepo.processPayment(checkoutData);

    if (paymentResult) {
      // Crear reserva
      const reservation = await reservationRepo.createReservation({
        userId,
        propertyId: checkoutData.propertyId,
        hostId: 'host-1',
        checkIn: checkoutData.checkIn,
        checkOut: checkoutData.checkOut,
        guests: checkoutData.guests,
        totalPrice: pricing.total,
        status: 'confirmed',
        paymentStatus: 'paid'
      });

      // Actualizar transacción con ID de reserva
      await paymentRepo.updateTransactionStatus(transaction.id, 'completed');

      // Crear notificación
      await notificationRepo.createNotification({
        userId,
        type: 'payment',
        title: 'Pago exitoso',
        message: 'Tu pago ha sido procesado exitosamente. Tu reserva está confirmada.',
        isRead: false,
        data: {
          reservationId: reservation.id,
          transactionId: transaction.transactionId
        }
      });

      res.status(201).json({
        success: true,
        data: {
          reservation,
          transaction,
          message: 'Checkout completado exitosamente'
        }
      });
    } else {
      // Fallo en el pago
      await paymentRepo.updateTransactionStatus(transaction.id, 'failed');

      res.status(400).json({
        success: false,
        error: {
          message: 'Error al procesar el pago',
          transactionId: transaction.transactionId
        }
      });
    }
  } catch (error) {
    console.error('Error procesando checkout:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error procesando checkout' }
    });
  }
};

// POST /api/payments/methods
export const addPaymentMethodController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName, isDefault } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validaciones básicas
    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
      res.status(400).json({
        success: false,
        error: { message: 'Faltan datos requeridos del método de pago' }
      });
      return;
    }

    const paymentMethod = await paymentRepo.addPaymentMethod(userId, {
      userId,
      type: 'card',
      cardNumber: cardNumber, // Se guarda completo temporalmente
      cardBrand: paymentRepo.getCardBrand(cardNumber) as any,
      expiryMonth,
      expiryYear,
      cardholderName,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      data: {
        paymentMethod,
        message: 'Método de pago agregado exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error agregando método de pago' }
    });
  }
};

// GET /api/payments/methods
export const getPaymentMethodsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const paymentMethods = await paymentRepo.getUserPaymentMethods(userId);

    res.json({
      success: true,
      data: {
        paymentMethods,
        total: paymentMethods.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo métodos de pago' }
    });
  }
};

// GET /api/payments/transactions
export const getTransactionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { limit } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    let transactions = await paymentRepo.getUserTransactions(userId);
    
    if (limit) {
      transactions = transactions.slice(0, Number(limit));
    }

    res.json({
      success: true,
      data: {
        transactions,
        total: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo transacciones' }
    });
  }
};

// GET /api/payments/transactions/:id
export const getTransactionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const transaction = await paymentRepo.getTransactionById(id);

    if (!transaction || transaction.userId !== userId) {
      res.status(404).json({
        success: false,
        error: { message: 'Transacción no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo transacción' }
    });
  }
};

// POST /api/payments/refund/:id
export const refundTransactionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const transaction = await paymentRepo.getTransactionById(id);

    if (!transaction || transaction.userId !== userId) {
      res.status(404).json({
        success: false,
        error: { message: 'Transacción no encontrada' }
      });
      return;
    }

    if (transaction.status !== 'completed') {
      res.status(400).json({
        success: false,
        error: { message: 'Solo se pueden reembolsar transacciones completadas' }
      });
      return;
    }

    // Procesar reembolso
    await paymentRepo.updateTransactionStatus(transaction.id, 'refunded');

    // Crear notificación
    await notificationRepo.createNotification({
      userId,
      type: 'payment',
      title: 'Reembolso procesado',
      message: `Tu reembolso de $${transaction.amount} ${transaction.currency} ha sido procesado.`,
      isRead: false,
      data: {
        transactionId: transaction.transactionId,
        amount: transaction.amount
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Reembolso procesado exitosamente',
        transactionId: transaction.transactionId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error procesando reembolso' }
    });
  }
};

// DELETE /api/payments/methods/:id
export const deletePaymentMethodController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = await paymentRepo.deletePaymentMethod(userId, id);

    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Método de pago no encontrado' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Método de pago eliminado exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando método de pago' }
    });
  }
};

// POST /api/payments/checkout/create-intent
export const createPaymentIntentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { propertyId, checkIn, checkOut, guests, reservationId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validar datos de entrada
    if (!propertyId || !checkIn || !checkOut || !guests) {
      res.status(400).json({
        success: false,
        error: { message: 'Faltan datos requeridos: propertyId, checkIn, checkOut, guests' }
      });
      return;
    }

    // Validar formato de fechas
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      res.status(400).json({
        success: false,
        error: { message: 'Formato de fechas inválido' }
      });
      return;
    }

    if (checkInDate >= checkOutDate) {
      res.status(400).json({
        success: false,
        error: { message: 'La fecha de check-out debe ser posterior a la de check-in' }
      });
      return;
    }

    // Obtener la propiedad
    const property = await getPropertyById(propertyId);
    if (!property) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    // ✅ Verificar que la propiedad tiene un precio válido
    const pricePerNight = property.pricePerNight || property.price || 0;
    if (!pricePerNight || pricePerNight <= 0) {
      res.status(400).json({
        success: false,
        error: { message: 'La propiedad no tiene un precio válido' }
      });
      return;
    }

    // Verificar disponibilidad
    const isAvailable = await checkAvailability(propertyId, checkIn, checkOut);
    if (!isAvailable) {
      res.status(400).json({
        success: false,
        error: { message: 'La propiedad no está disponible para las fechas seleccionadas' }
      });
      return;
    }

    // ✅ Calcular pricing usando el precio REAL de la propiedad
    const pricing = await paymentRepo.calculatePricing(propertyId, checkIn, checkOut, guests);

    // Convertir a centavos (Stripe usa centavos)
    const amountInCents = Math.round(pricing.total * 100);

    // ✅ Logs detallados para verificación (según instrucciones)
    console.log('🔍 [Backend] ============================================');
    console.log('🔍 [Backend] Creando Payment Intent');
    console.log('🔍 [Backend] Property ID:', propertyId);
    console.log('🔍 [Backend] Precio por noche (desde BD):', pricePerNight);
    console.log('🔍 [Backend] Noches:', pricing.nights);
    console.log('🔍 [Backend] Subtotal:', pricing.subtotal);
    console.log('🔍 [Backend] Tarifa de limpieza (5%):', pricing.cleaningFee);
    console.log('🔍 [Backend] Tarifa de servicio (8%):', pricing.serviceFee);
    console.log('🔍 [Backend] Impuestos (12%):', pricing.taxes);
    console.log('🔍 [Backend] Total:', pricing.total);
    console.log('🔍 [Backend] ============================================');
    console.log('🔍 [Backend] Monto para Stripe (centavos):', amountInCents);
    console.log('🔍 [Backend] Monto para Stripe (dólares):', amountInCents / 100);

    // ✅ Crear Payment Intent con Stripe usando el monto calculado (precio real + impuestos + servicios)
    const paymentIntent = await createPaymentIntent({
      amount: amountInCents,
      currency: pricing.currency,
      metadata: {
        userId,
        propertyId,
        reservationId: reservationId || '',
        checkIn,
        checkOut,
        guests: guests.toString(),
        // Campos adicionales en metadata (Stripe permite campos adicionales)
        pricePerNight: pricePerNight.toString(),  // Guardar precio por noche para referencia
        totalNights: pricing.nights.toString(),
        subtotal: pricing.subtotal.toFixed(2),
        cleaningFee: pricing.cleaningFee.toFixed(2),
        serviceFee: pricing.serviceFee.toFixed(2),
        taxes: pricing.taxes.toFixed(2),
        total: pricing.total.toFixed(2)
      }
    });

    const clientSecret = paymentIntent.client_secret;
    const paymentIntentId = paymentIntent.id;

    if (!clientSecret) {
      console.error('❌ Error: Stripe no devolvió un clientSecret');
      res.status(500).json({
        success: false,
        error: { message: 'Error creando payment intent' }
      });
      return;
    }

    console.log('✅ [Backend] Payment Intent creado exitosamente');
    console.log('✅ [Backend] PaymentIntentId:', paymentIntentId);
    console.log('✅ [Backend] Monto cobrado por Stripe:', amountInCents / 100, 'USD');
    console.log(`🔑 [Backend] Client Secret (primeros 30 chars): ${clientSecret.substring(0, 30)}...`);

    // Crear transacción en la base de datos
    const transaction = await paymentRepo.createTransaction({
      userId,
      propertyId,
      reservationId: reservationId || 'pending',
      amount: pricing.total,
      currency: pricing.currency,
      status: 'processing',
      paymentMethod: 'stripe',
      transactionId: `txn_${Date.now()}`,
      description: `Reserva de propiedad ${propertyId}`,
      stripePaymentIntentId: paymentIntentId
    } as any);

    // Devolver respuesta
    res.status(200).json({
      success: true,
      data: {
        clientSecret,
        paymentIntentId,
        transactionId: transaction.id,
        amount: pricing.total,
        currency: pricing.currency,
        pricing
      }
    });
  } catch (error: any) {
    console.error('❌ Error creando payment intent:', error);
    
    // Manejar errores específicos de Stripe
    if (error.type === 'StripeCardError') {
      res.status(400).json({
        success: false,
        error: { message: 'Tarjeta rechazada: ' + error.message }
      });
      return;
    }

    if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({
        success: false,
        error: { message: 'Error en la solicitud: ' + error.message }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creando payment intent' }
    });
  }
};

// POST /api/payments/checkout/confirm
export const confirmPaymentAndCreateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { paymentIntentId, checkIn, checkOut, guests, guestInfo } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validar datos de entrada
    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        error: { message: 'Falta paymentIntentId' }
      });
      return;
    }

    console.log(`🔍 Verificando Payment Intent en Stripe: ${paymentIntentId}`);

    // Obtener Payment Intent de Stripe
    const paymentIntent = await getPaymentIntent(paymentIntentId);

    // Validar ownership del Payment Intent
    if (paymentIntent.metadata.userId !== userId) {
      res.status(403).json({
        success: false,
        error: { message: 'Este Payment Intent no pertenece al usuario actual' }
      });
      return;
    }

    // Verificar que el pago fue exitoso
    if (paymentIntent.status !== 'succeeded') {
      res.status(400).json({
        success: false,
        error: { 
          message: `El pago no fue exitoso. Estado: ${paymentIntent.status}`,
          status: paymentIntent.status
        }
      });
      return;
    }

    console.log(`✅ Estado del pago: ${paymentIntent.status}`);
    console.log(`💰 Monto pagado: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);

    const propertyId = paymentIntent.metadata.propertyId;
    const checkInFromMetadata = paymentIntent.metadata.checkIn;
    const checkOutFromMetadata = paymentIntent.metadata.checkOut;
    const guestsFromMetadata = parseInt(paymentIntent.metadata.guests || '1');

    // Usar fechas del metadata si no se proporcionan
    const finalCheckIn = checkIn || checkInFromMetadata;
    const finalCheckOut = checkOut || checkOutFromMetadata;
    const finalGuests = guests || guestsFromMetadata;

    // Verificar disponibilidad nuevamente antes de crear la reserva
    const isAvailable = await checkAvailability(propertyId, finalCheckIn, finalCheckOut);
    if (!isAvailable) {
      res.status(400).json({
        success: false,
        error: { message: 'La propiedad ya no está disponible para las fechas seleccionadas' }
      });
      return;
    }

    // Obtener la propiedad para obtener el hostId
    const property = await getPropertyById(propertyId);
    if (!property) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    const hostId = property.hostId || (property as any).host?.id;

    // Crear la reserva
    const reservation = await reservationRepo.createReservation({
      userId,
      propertyId,
      hostId: hostId || 'unknown',
      checkIn: finalCheckIn,
      checkOut: finalCheckOut,
      guests: finalGuests,
      totalPrice: paymentIntent.amount / 100,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    // Actualizar la transacción
    const chargeId = paymentIntent.latest_charge;
    const transactions = await paymentRepo.getUserTransactions(userId);
    const transaction = transactions.find(t => 
      (t as any).stripePaymentIntentId === paymentIntentId
    );

    if (transaction) {
      await paymentRepo.updateTransactionStatus(transaction.id, 'completed');
      // Actualizar con chargeId si existe
      if (chargeId && typeof chargeId === 'string') {
        // Note: We might need to update the repository to support updating these fields
        // For now, the transaction is marked as completed
      }
    }

    // Crear notificación
    await notificationRepo.createNotification({
      userId,
      type: 'payment',
      title: 'Pago confirmado',
      message: 'Tu pago ha sido confirmado y tu reserva está activa.',
      isRead: false,
      data: {
        reservationId: reservation.id,
        paymentIntentId
      }
    });

    res.status(200).json({
      success: true,
      data: {
        reservation,
        transaction: transaction || null,
        message: 'Pago confirmado y reserva creada exitosamente'
      }
    });
  } catch (error: any) {
    console.error('❌ Error confirmando pago:', error);

    if (error.type === 'StripeInvalidRequestError' && error.message.includes('No such payment_intent')) {
      res.status(404).json({
        success: false,
        error: { message: 'Payment Intent no encontrado' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error confirmando pago y creando reserva' }
    });
  }
};
