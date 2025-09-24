import { z } from 'zod';
import { PRODUCT_CATEGORIES, VALIDATION_LIMITS, ADMIN_PERMISSIONS } from './admin-config';

// Checkout form validation schema
export const checkoutSchema = z.object({
  deliveryAddress: z.string()
    .min(10, 'Address must be at least 10 characters long')
    .max(255, 'Address is too long'),
  deliveryPhone: z.string()
    .regex(/^(\+255|0)[67]\d{8}$/, 'Please enter a valid Tanzanian phone number'),
  deliveryNotes: z.string().optional(),
  deliveryDate: z.string()
    .refine((date) => {
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, 'Delivery date must be today or in the future'),
  deliveryTime: z.string()
    .min(1, 'Please select a delivery time slot'),
  paymentMethod: z.enum(['cash_on_delivery', 'mobile_money'])
});

// User profile validation schema
export const userProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name is too long'),
  phone: z.string()
    .regex(/^(\+255|0)[67]\d{8}$/, 'Please enter a valid Tanzanian phone number')
    .optional(),
  address: z.string()
    .min(5, 'Address must be at least 5 characters long')
    .max(255, 'Address is too long')
    .optional(),
});

// Enhanced product form validation schema with admin config
export const productSchema = z.object({
  name: z.string()
    .min(VALIDATION_LIMITS.PRODUCT_NAME_MIN, `Product name must be at least ${VALIDATION_LIMITS.PRODUCT_NAME_MIN} characters long`)
    .max(VALIDATION_LIMITS.PRODUCT_NAME_MAX, `Product name must not exceed ${VALIDATION_LIMITS.PRODUCT_NAME_MAX} characters`)
    .regex(/^[a-zA-Z0-9\s\-&'.,()]+$/, 'Product name contains invalid characters'),
  description: z.string()
    .min(VALIDATION_LIMITS.PRODUCT_DESCRIPTION_MIN, `Description must be at least ${VALIDATION_LIMITS.PRODUCT_DESCRIPTION_MIN} characters long`)
    .max(VALIDATION_LIMITS.PRODUCT_DESCRIPTION_MAX, `Description must not exceed ${VALIDATION_LIMITS.PRODUCT_DESCRIPTION_MAX} characters`),
  price: z.number()
    .min(VALIDATION_LIMITS.PRODUCT_PRICE_MIN, `Price must be at least ${VALIDATION_LIMITS.PRODUCT_PRICE_MIN} TZS`)
    .max(VALIDATION_LIMITS.PRODUCT_PRICE_MAX, `Price must not exceed ${VALIDATION_LIMITS.PRODUCT_PRICE_MAX} TZS`)
    .multipleOf(0.01, 'Price must be a valid currency amount'),
  category: z.enum(['vegetables', 'fruits', 'herbs', 'dairy', 'grains', 'meat', 'beverages', 'snacks', 'household', 'other'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  image_url: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // Allow empty
      try {
        new URL(val); // Check if valid URL
        // Allow Unsplash URLs specifically, or URLs ending with image extensions
        return val.includes('images.unsplash.com') || /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(val);
      } catch {
        return false;
      }
    }, 'Image URL must be a valid URL from images.unsplash.com or ending with .jpg, .png, .webp, or .gif')
    .transform((val) => val || ''), // Transform undefined/null to empty string
  stock_quantity: z.number()
    .min(VALIDATION_LIMITS.STOCK_QUANTITY_MIN, 'Stock quantity cannot be negative')
    .max(VALIDATION_LIMITS.STOCK_QUANTITY_MAX, `Stock quantity cannot exceed ${VALIDATION_LIMITS.STOCK_QUANTITY_MAX}`)
    .int('Stock quantity must be a whole number'),
  is_active: z.enum(['active', 'inactive'])
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers')
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name is too long'),
  email: z.string()
    .email('Please enter a valid email address'),
  phone: z.string()
    .regex(/^(\+255|0)[67]\d{8}$/, 'Please enter a valid Tanzanian phone number')
    .optional(),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters long')
    .max(100, 'Subject is too long'),
  message: z.string()
    .min(20, 'Message must be at least 20 characters long')
    .max(1000, 'Message is too long')
});

// Order item validation schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  productPrice: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().min(1, 'Quantity must be at least 1')
});

// Enhanced admin user validation schema
export const adminUserSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters long')
    .max(100, 'Email is too long')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email format'),
  name: z.string()
    .min(VALIDATION_LIMITS.ADMIN_NAME_MIN, `Name must be at least ${VALIDATION_LIMITS.ADMIN_NAME_MIN} characters long`)
    .max(VALIDATION_LIMITS.ADMIN_NAME_MAX, `Name must not exceed ${VALIDATION_LIMITS.ADMIN_NAME_MAX} characters`)
    .regex(/^[a-zA-Z\s\-',.]+$/, 'Name contains invalid characters'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'], {
    errorMap: () => ({ message: 'Please select a valid admin role' })
  })
});

// Delivery location validation schema
export const deliveryLocationSchema = z.object({
  latitude: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),
  longitude: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),
  address: z.string()
    .min(5, 'Address must be at least 5 characters long')
    .optional()
});

// Export types for TypeScript
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type ProductData = z.infer<typeof productSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type OrderItemData = z.infer<typeof orderItemSchema>;
export type AdminUserData = z.infer<typeof adminUserSchema>;
export type DeliveryLocationData = z.infer<typeof deliveryLocationSchema>;

// Validation helper functions
export const validateCheckoutForm = (data: unknown) => {
  return checkoutSchema.safeParse(data);
};

export const validateUserProfile = (data: unknown) => {
  return userProfileSchema.safeParse(data);
};

export const validateProduct = (data: unknown) => {
  return productSchema.safeParse(data);
};

export const validateLogin = (data: unknown) => {
  return loginSchema.safeParse(data);
};

export const validateContact = (data: unknown) => {
  return contactSchema.safeParse(data);
};

export const validateOrderItem = (data: unknown) => {
  return orderItemSchema.safeParse(data);
};

export const validateAdminUser = (data: unknown) => {
  return adminUserSchema.safeParse(data);
};

export const validateDeliveryLocation = (data: unknown) => {
  return deliveryLocationSchema.safeParse(data);
};

// Bulk operations validation schema
export const bulkOperationSchema = z.object({
  operation: z.enum(['update_status', 'delete', 'update_category', 'update_price']),
  items: z.array(z.string()).min(1, 'At least one item must be selected').max(50, 'Cannot process more than 50 items at once'),
  data: z.record(z.any()).optional()
});

// Admin settings validation schema
export const adminSettingsSchema = z.object({
  low_stock_threshold: z.number().min(1).max(100),
  default_delivery_fee: z.number().min(0).max(50000),
  max_order_amount: z.number().min(1000).max(10000000),
  business_hours_start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  business_hours_end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  enable_notifications: z.boolean(),
  enable_auto_confirm: z.boolean()
});

// Admin action log validation schema
export const adminActionLogSchema = z.object({
  action: z.string().min(1),
  resource_type: z.enum(['product', 'order', 'admin_user', 'settings']),
  resource_id: z.string().min(1),
  details: z.record(z.any()).optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional()
});

// Enhanced validation helper functions
export const validateBulkOperation = (data: unknown) => {
  return bulkOperationSchema.safeParse(data);
};

export const validateAdminSettings = (data: unknown) => {
  return adminSettingsSchema.safeParse(data);
};

export const validateAdminActionLog = (data: unknown) => {
  return adminActionLogSchema.safeParse(data);
};