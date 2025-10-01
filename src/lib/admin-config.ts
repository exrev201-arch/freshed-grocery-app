/**
 * Admin Configuration Constants
 * Centralized configuration for admin operations
 */

// Admin configuration and constants
export const ADMIN_TABLES = {
    PRODUCTS: 'products',
    ADMIN_USERS: 'admin_users',
    ORDERS: 'orders',
    DELIVERY_TRACKING: 'delivery_tracking'
};

export const QUERY_LIMITS = {
    PRODUCTS_PER_PAGE: 50,
    ADMIN_USERS_PER_PAGE: 50,
    MAX_QUERY_LIMIT: 1000
};

export const ADMIN_ROLES = {
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    VIEWER: 'viewer'
};

export const ADMIN_PERMISSIONS = {
    admin: ['read', 'write', 'delete', 'admin'],
    employee: ['read', 'write'],
    viewer: ['read']
};

// Product categories
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

// Revenue calculation configuration
export const REVENUE_CALCULATION = {
    // Only orders with these statuses will be counted in revenue calculations
    // According to project specification, only 'delivered' orders should be counted
    COMPLETED_ORDER_STATUSES: ['delivered'] as string[],
    
    // Alternative configuration if we want to count other completed statuses
    // COMPLETED_ORDER_STATUSES: ['delivered', 'ready_for_pickup'] as string[],
};

// Error Messages
export const ADMIN_ERROR_MESSAGES = {
    UNAUTHORIZED: 'You are not authorized to perform this action',
    INVALID_ROLE: 'Invalid admin role specified',
    PRODUCT_NOT_FOUND: 'Product not found',
    ADMIN_NOT_FOUND: 'Admin user not found',
    PERMISSION_DENIED: 'Permission denied',
    INVALID_INPUT: 'Invalid input data',
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