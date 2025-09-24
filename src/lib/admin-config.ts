/**
 * Admin Configuration Constants
 * Centralized configuration for admin operations
 */

// Database Table IDs (updated to use new backend)
export const ADMIN_TABLES = {
  PRODUCTS: 'products',
  ADMIN_USERS: 'admin_users', 
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  USER_PROFILES: 'user_profiles',
  USER_FAVORITES: 'user_favorites',
  DELIVERY_TRACKING: 'delivery_tracking'
} as const;

// Admin Role Permissions
export const ADMIN_PERMISSIONS = {
  SUPER_ADMIN: {
    read: true,
    write: true,
    delete: true,
    admin: true,
    bulk_operations: true,
    system_config: true
  },
  ADMIN: {
    read: true,
    write: true,
    delete: true,
    admin: true,
    bulk_operations: true,
    system_config: false
  },
  MANAGER: {
    read: true,
    write: true,
    delete: false,
    admin: false,
    bulk_operations: true,
    system_config: false
  },
  EMPLOYEE: {
    read: true,
    write: false,
    delete: false,
    admin: false,
    bulk_operations: false,
    system_config: false
  }
} as const;

// Query Limits
export const QUERY_LIMITS = {
  PRODUCTS_PER_PAGE: 50,
  ORDERS_PER_PAGE: 25,
  ADMIN_USERS_PER_PAGE: 20,
  MAX_QUERY_LIMIT: 100,
  DEFAULT_LIMIT: 50
} as const;

// Product Categories
export const PRODUCT_CATEGORIES = [
  'vegetables',
  'fruits', 
  'herbs',
  'dairy',
  'grains',
  'meat',
  'beverages',
  'snacks',
  'household',
  'other'
] as const;

// Order Status Values
export const ORDER_STATUSES = [
  'pending',
  'confirmed', 
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded'
] as const;

// Admin Action Types (for audit logging)
export const ADMIN_ACTIONS = {
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product', 
  DELETE_PRODUCT: 'delete_product',
  CREATE_ADMIN: 'create_admin',
  UPDATE_ADMIN: 'update_admin',
  UPDATE_ORDER_STATUS: 'update_order_status',
  BULK_UPDATE: 'bulk_update',
  SYSTEM_CONFIG: 'system_config'
} as const;

// Validation Constants
export const VALIDATION_LIMITS = {
  PRODUCT_NAME_MIN: 2,
  PRODUCT_NAME_MAX: 100,
  PRODUCT_DESCRIPTION_MIN: 10,
  PRODUCT_DESCRIPTION_MAX: 1000,
  PRODUCT_PRICE_MIN: 1,
  PRODUCT_PRICE_MAX: 10000000,
  STOCK_QUANTITY_MIN: 0,
  STOCK_QUANTITY_MAX: 50000,
  ADMIN_NAME_MIN: 2,
  ADMIN_NAME_MAX: 50
} as const;

// Error Messages
export const ADMIN_ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_ROLE: 'Invalid admin role specified',
  PRODUCT_NOT_FOUND: 'Product not found',
  ADMIN_NOT_FOUND: 'Admin user not found',
  VALIDATION_FAILED: 'Validation failed. Please check your input',
  DATABASE_ERROR: 'Database operation failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  BULK_OPERATION_FAILED: 'Bulk operation failed for some items'
} as const;

// Success Messages  
export const ADMIN_SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  ADMIN_CREATED: 'Admin user created successfully',
  ADMIN_UPDATED: 'Admin user updated successfully',
  ORDER_STATUS_UPDATED: 'Order status updated successfully',
  BULK_OPERATION_SUCCESS: 'Bulk operation completed successfully'
} as const;

export type AdminRole = keyof typeof ADMIN_PERMISSIONS;
export type AdminAction = typeof ADMIN_ACTIONS[keyof typeof ADMIN_ACTIONS];
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
export type OrderStatus = typeof ORDER_STATUSES[number];