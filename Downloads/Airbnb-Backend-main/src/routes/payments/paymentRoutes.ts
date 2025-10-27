import { Router } from 'express';
import { 
  calculateCheckout,
  processCheckout,
  getPaymentMethodsController,
  addPaymentMethodController,
  deletePaymentMethodController,
  getTransactionsController,
  getTransactionController,
  refundTransactionController
} from '../../controllers/payments/paymentController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de checkout
router.post('/checkout/calculate', calculateCheckout);
router.post('/checkout/process', processCheckout);

// Rutas de métodos de pago
router.get('/methods', getPaymentMethodsController);
router.post('/methods', addPaymentMethodController);
router.delete('/methods/:id', deletePaymentMethodController);

// Rutas de transacciones
router.get('/transactions', getTransactionsController);
router.get('/transactions/:id', getTransactionController);
router.post('/transactions/:id/refund', refundTransactionController);

export default router;
