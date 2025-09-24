import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const userController = new UserController();

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('address').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Address must be 5-200 characters'),
  validateRequest
];

const addFavoriteValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  validateRequest
];

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidation, userController.updateProfile);

// Favorites routes
router.get('/favorites', userController.getFavorites);
router.post('/favorites', addFavoriteValidation, userController.addToFavorites);
router.delete('/favorites/:productId', userController.removeFromFavorites);

export default router;