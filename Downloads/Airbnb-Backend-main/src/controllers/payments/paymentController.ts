import { Request, Response } from 'express';
import { PaymentRepositoryFactory } from '../../models/factories/PaymentRepositoryFactory';
import { ReservationRepositoryFactory } from '../../models/factories/ReservationRepositoryFactory';
import { NotificationRepositoryFactory } from '../../models/factories/NotificationRepositoryFactory';
import { CheckoutData } from '../../types/payments';

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
