import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const orderController = new OrderController();

// Validation rules
const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
  body('paymentMethod').isIn(['CASH_ON_DELIVERY', 'MOBILE_MONEY', 'CARD']).withMessage('Invalid payment method'),
  body('deliveryAddress').trim().isLength({ min: 10 }).withMessage('Delivery address is required'),
  body('deliveryPhone').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('deliveryDate').isISO8601().withMessage('Valid delivery date is required'),
  body('deliveryTime').notEmpty().withMessage('Delivery time is required'),
  validateRequest
];

const updateStatusValidation = [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).withMessage('Invalid status'),
  body('notes').optional().trim(),
  validateRequest
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().trim(),
  validateRequest
];

// User routes
router.post('/', authenticateToken, createOrderValidation, orderController.createOrder);
router.get('/', authenticateToken, queryValidation, orderController.getUserOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, queryValidation, orderController.getAllOrders);
router.put('/:id/status', authenticateToken, requireAdmin, updateStatusValidation, orderController.updateOrderStatus);
router.post('/:id/assign-delivery', authenticateToken, requireAdmin, orderController.assignDeliveryPerson);

export default router;