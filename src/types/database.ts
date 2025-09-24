/**
 * Database Schema Types for Fresh Grocery Tanzania
 * 
 * This file defines the complete database schema with proper typing
 * for all entities including users, products, orders, payments, and delivery
 */

// Base types for common fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable {
  deletedAt?: Date;
  isDeleted: boolean;
}

// User Management Schema
export interface User extends BaseEntity {
  // Basic Information
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  
  // Authentication
  passwordHash?: string; // For email/password login
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: Date;
  
  // Profile Information
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  
  // Preferences
  language: 'en' | 'sw'; // English or Swahili
  currency: 'TZS' | 'USD';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  
  // Status
  status: 'active' | 'suspended' | 'blocked';
  
  // Business fields
  customerType: 'individual' | 'business';
  businessName?: string;
  taxNumber?: string;
}

// Address Management
export interface Address extends BaseEntity {
  userId: string;
  type: 'home' | 'office' | 'other';
  label: string; // "Home", "Office", etc.
  
  // Address details
  street: string;
  ward: string;
  district: string;
  region: string;
  country: string;
  postalCode?: string;
  
  // Geocoding
  latitude?: number;
  longitude?: number;
  plusCode?: string; // Google Plus Code
  
  // Delivery preferences
  isDefault: boolean;
  deliveryInstructions?: string;
  isActive: boolean;
}

// Admin User Management
export interface AdminUser extends BaseEntity, SoftDeletable {
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  
  permissions: {
    products: ['create', 'read', 'update', 'delete'];
    orders: ['create', 'read', 'update', 'delete'];
    users: ['create', 'read', 'update', 'delete'];
    analytics: ['read'];
    settings: ['read', 'update'];
  };
  
  status: 'active' | 'inactive';
  lastLoginAt?: Date;
  createdBy: string; // Admin ID who created this user
}

// Product Management Schema
export interface Category extends BaseEntity, SoftDeletable {
  name: string;
  nameSwahili: string;
  slug: string;
  description?: string;
  descriptionSwahili?: string;
  
  // Hierarchy
  parentId?: string;
  level: number; // 0 = root, 1 = subcategory, etc.
  path: string; // "/fruits/citrus"
  
  // Media
  image?: string;
  icon?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Display
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  
  // Business rules
  commission: number; // Percentage for multi-vendor
  taxRate: number;
}

export interface Brand extends BaseEntity, SoftDeletable {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  
  isActive: boolean;
  sortOrder: number;
}

export interface Product extends BaseEntity, SoftDeletable {
  // Basic Information
  name: string;
  nameSwahili: string;
  slug: string;
  description: string;
  descriptionSwahili: string;
  shortDescription?: string;
  
  // Classification
  categoryId: string;
  brandId?: string;
  sku: string; // Stock Keeping Unit
  barcode?: string;
  
  // Pricing
  price: number; // Base price in TZS
  compareAtPrice?: number; // Original price for discounts
  costPrice?: number; // Cost to business
  currency: 'TZS' | 'USD';
  
  // Inventory
  trackInventory: boolean;
  inventoryQuantity: number;
  lowStockThreshold: number;
  allowOutOfStock: boolean;
  
  // Physical attributes
  weight?: number; // in grams
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  // Digital attributes
  images: string[]; // Array of image URLs
  tags: string[];
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Business rules
  isActive: boolean;
  isFeatured: boolean;
  requiresAgeVerification: boolean;
  shelfLife?: number; // days
  storageInstructions?: string;
  
  // Multi-vendor (future)
  vendorId?: string;
  commission?: number;
  
  // Analytics
  viewCount: number;
  salesCount: number;
  rating: number; // Average rating
  reviewCount: number;
  
  // Pricing tiers (wholesale)
  priceTiers?: {
    quantity: number;
    price: number;
  }[];
}

// Inventory Management
export interface InventoryMovement extends BaseEntity {
  productId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage' | 'expiry';
  quantity: number; // Positive for increase, negative for decrease
  previousQuantity: number;
  newQuantity: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  reference?: string; // Order ID, Purchase ID, etc.
  userId: string; // Who made the change
}

// Shopping Cart & Wishlist
export interface CartItem extends BaseEntity {
  userId: string;
  productId: string;
  quantity: number;
  unitPrice: number; // Price at time of adding to cart
  totalPrice: number;
  sessionId?: string; // For guest users
}

export interface WishlistItem extends BaseEntity {
  userId: string;
  productId: string;
  addedAt: Date;
}

// Order Management Schema
export interface Order extends BaseEntity {
  // Identification
  orderNumber: string; // Human-readable order number
  userId: string;
  
  // Financial
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: 'TZS' | 'USD';
  
  // Status tracking
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  fulfillmentStatus: 'pending' | 'processing' | 'shipped' | 'delivered';
  
  // Customer information
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  
  // Delivery information
  deliveryAddress: {
    street: string;
    ward: string;
    district: string;
    region: string;
    country: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    instructions?: string;
  };
  
  // Delivery preferences
  deliveryDate: Date;
  deliveryTimeSlot: string; // "09:00-12:00", "12:00-15:00", etc.
  deliveryMethod: 'standard' | 'express' | 'scheduled';
  
  // Payment information
  paymentMethod: 'mpesa' | 'airtel_money' | 'tigo_pesa' | 'card' | 'cash_on_delivery';
  paymentReference?: string;
  
  // Notes and instructions
  orderNotes?: string;
  internalNotes?: string;
  
  // Timing
  estimatedDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  
  // Source tracking
  source: 'web' | 'mobile' | 'admin' | 'phone';
  referrer?: string;
  
  // Promotions
  discountCodes?: string[];
  loyaltyPointsUsed?: number;
  loyaltyPointsEarned?: number;
}

export interface OrderItem extends BaseEntity {
  orderId: string;
  productId: string;
  
  // Product snapshot at time of order
  productName: string;
  productSku: string;
  productImage?: string;
  
  // Pricing
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // Fulfillment
  quantityFulfilled: number;
  quantityRefunded: number;
  
  // Special instructions
  notes?: string;
}

// Payment Management Schema
export interface Payment extends BaseEntity {
  orderId: string;
  userId: string;
  
  // Amount details
  amount: number;
  currency: 'TZS' | 'USD';
  
  // Payment method details
  method: 'mpesa' | 'airtel_money' | 'tigo_pesa' | 'card' | 'cash_on_delivery';
  provider: 'clickpesa' | 'manual'; // Payment processor
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  
  // External references
  externalTransactionId?: string; // ClickPesa transaction ID
  externalReference?: string; // Provider reference
  checkoutUrl?: string; // For hosted payments
  
  // ClickPesa specific fields
  clickPesaPaymentId?: string;
  clickPesaStatus?: string;
  clickPesaMessage?: string;
  
  // Mobile money details
  mobileNumber?: string;
  mobileProvider?: 'vodacom' | 'airtel' | 'tigo' | 'halotel';
  
  // Card details (tokenized)
  cardLast4?: string;
  cardBrand?: string;
  cardToken?: string; // Tokenized card for future payments
  
  // Timing
  processedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  
  // Metadata
  metadata?: Record<string, any>;
  failureReason?: string;
  
  // Webhook data
  webhookReceived: boolean;
  webhookData?: Record<string, any>;
}

// Delivery Management Schema
export interface DeliveryPerson extends BaseEntity, SoftDeletable {
  // Personal information
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  nationalId: string;
  
  // Work information
  employeeId: string;
  status: 'active' | 'inactive' | 'on_break' | 'off_duty';
  vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'van' | 'on_foot';
  vehicleRegistration?: string;
  
  // Performance metrics
  rating: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  avgDeliveryTime: number; // in minutes
  
  // Current location (for active delivery persons)
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: Date;
  
  // Availability
  isAvailable: boolean;
  workingHours: {
    start: string; // "08:00"
    end: string; // "18:00"
  };
  workingDays: number[]; // [1,2,3,4,5] for Mon-Fri
}

export interface Delivery extends BaseEntity {
  orderId: string;
  deliveryPersonId?: string;
  
  // Status
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'returned';
  
  // Timing
  estimatedPickupAt: Date;
  estimatedDeliveryAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  
  // Location tracking
  pickupAddress: string;
  deliveryAddress: string;
  
  // Real-time tracking
  trackingCode: string;
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: Date;
  
  // Delivery proof
  deliveryProofType?: 'signature' | 'photo' | 'sms_confirmation';
  deliveryProof?: string; // URL to image or signature data
  recipientName?: string;
  
  // Special instructions
  deliveryInstructions?: string;
  deliveryNotes?: string;
  
  // Performance
  distance?: number; // in kilometers
  actualDeliveryTime?: number; // in minutes
  
  // Issues
  failureReason?: string;
  customerRating?: number;
  customerFeedback?: string;
}

// Notification Management
export interface Notification extends BaseEntity {
  userId: string;
  type: 'order_update' | 'delivery_update' | 'payment_update' | 'promotion' | 'system';
  
  // Content
  title: string;
  titleSwahili?: string;
  message: string;
  messageSwahili?: string;
  
  // Delivery channels
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  readAt?: Date;
  
  // Metadata
  relatedEntityType?: 'order' | 'payment' | 'delivery';
  relatedEntityId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Scheduling
  scheduledAt?: Date;
  sentAt?: Date;
  
  // Tracking
  emailOpened?: boolean;
  emailClicked?: boolean;
  smsDelivered?: boolean;
  pushOpened?: boolean;
}

// Analytics and Reporting
export interface AnalyticsEvent extends BaseEntity {
  userId?: string;
  sessionId: string;
  
  // Event details
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search' | 'click';
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  
  // Page/Product context
  pageUrl?: string;
  pageTitle?: string;
  productId?: string;
  categoryId?: string;
  searchQuery?: string;
  
  // Device/Browser info
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  
  // Timing
  timestamp: Date;
  sessionDuration?: number;
}

// System Configuration
export interface SystemSetting extends BaseEntity {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'general' | 'payment' | 'delivery' | 'notification' | 'analytics';
  description?: string;
  isPublic: boolean; // Whether to expose in frontend
}

// All interfaces are exported inline above
