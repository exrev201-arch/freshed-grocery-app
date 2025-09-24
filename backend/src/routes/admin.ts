import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middleware/auth';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const adminController = new AdminController();

// Validation rules
const createAdminValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Invalid role'),
  validateRequest
];

const updateAdminValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('role').optional().isIn(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  body('isActive').optional().isBoolean(),
  validateRequest
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
];

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Fresh Grocery Admin API',
    version: '1.0.0'
  });
});

// Dashboard routes
router.get('/dashboard', adminController.getDashboardStats);

// Admin user management (Super Admin only)
router.get('/users', requireSuperAdmin, queryValidation, adminController.getAdminUsers);
router.post('/users', requireSuperAdmin, createAdminValidation, adminController.createAdminUser);
router.put('/users/:id', requireSuperAdmin, updateAdminValidation, adminController.updateAdminUser);
router.delete('/users/:id', requireSuperAdmin, adminController.deleteAdminUser);

// Order management
router.get('/orders', queryValidation, adminController.getAllOrders);
router.get('/orders/stats', adminController.getOrderStats);

// Product management
router.get('/products/stats', adminController.getProductStats);

export default router;