/**
 * 🔧 SERVICIO DE STRIPE
 * Maneja todas las interacciones con la API de Stripe
 */

import Stripe from 'stripe';
import config from '../config/environment';

// Función para obtener instancia de Stripe (lazy initialization)
function getStripeInstance(): Stripe {
  const secretKey = config.stripe.secretKey || process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
  });
}

export interface CreatePaymentIntentParams {
  amount: number; // en centavos
  currency: string;
  metadata: {
    userId: string;
    propertyId: string;
    reservationId?: string;
    checkIn: string;
    checkOut: string;
    guests: number | string;
    // Campos adicionales opcionales para referencia
    pricePerNight?: string;
    totalNights?: string;
    subtotal?: string;
    cleaningFee?: string;
    serviceFee?: string;
    taxes?: string;
    total?: string;
    [key: string]: string | number | undefined; // Permitir campos adicionales
  };
}

export interface CreatePaymentMethodParams {
  type: 'card';
  card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details: {
    name: string;
    email?: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

/**
 * Crear un Payment Intent en Stripe
 */
export const createPaymentIntent = async (params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> => {
  try {
    const stripe = getStripeInstance();
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      metadata: {
        userId: params.metadata.userId,
        propertyId: params.metadata.propertyId,
        reservationId: params.metadata.reservationId || '',
        checkIn: params.metadata.checkIn,
        checkOut: params.metadata.checkOut,
        guests: params.metadata.guests.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Validar que el clientSecret tenga el formato correcto
    if (!paymentIntent.client_secret || !paymentIntent.client_secret.includes('_secret_')) {
      throw new Error('Stripe no devolvió un clientSecret válido');
    }

    // Validar que NO sea un mock
    if (paymentIntent.client_secret.includes('_mock_') || paymentIntent.client_secret.startsWith('pi_mock')) {
      throw new Error('El clientSecret es un mock. Verifica la configuración de Stripe.');
    }

    return paymentIntent;
  } catch (error) {
    console.error('Error creando Payment Intent:', error);
    throw error;
  }
};

/**
 * Obtener un Payment Intent por ID
 */
export const getPaymentIntent = async (paymentIntentId: string): Promise<Stripe.PaymentIntent> => {
  try {
    const stripe = getStripeInstance();
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error obteniendo Payment Intent:', error);
    throw error;
  }
};

/**
 * Confirmar un Payment Intent
 */
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const stripe = getStripeInstance();
    
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error confirmando Payment Intent:', error);
    throw error;
  }
};

/**
 * Crear un Payment Method en Stripe
 */
export const createPaymentMethod = async (params: CreatePaymentMethodParams): Promise<Stripe.PaymentMethod> => {
  try {
    const stripe = getStripeInstance();
    
    const paymentMethod = await stripe.paymentMethods.create({
      type: params.type,
      card: params.card,
      billing_details: params.billing_details,
    });

    return paymentMethod;
  } catch (error) {
    console.error('Error creando Payment Method:', error);
    throw error;
  }
};

/**
 * Crear un reembolso
 */
export const createRefund = async (
  chargeId: string,
  amount?: number
): Promise<Stripe.Refund> => {
  try {
    const stripe = getStripeInstance();
    
    const refundParams: Stripe.RefundCreateParams = {
      charge: chargeId,
    };

    if (amount) {
      refundParams.amount = amount;
    }

    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error('Error creando reembolso:', error);
    throw error;
  }
};

// Exportar función para obtener instancia si se necesita directamente
export const getStripe = getStripeInstance;

export default getStripeInstance;

