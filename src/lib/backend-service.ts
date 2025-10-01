/**
 * Backend Service - Replaces @devvai/devv-code-backend
 * 
 * This service provides a lightweight backend replacement using localStorage 
 * and mock data structures that mimic the original devv API interface.
 */

// Types matching the original devv structure
interface TableItem {
  _id: string;
  _uid: string;
  _tid?: string;
  [key: string]: any;
}

interface QueryOptions {
  limit?: number;
  query?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface TableResponse {
  items: TableItem[];
  total: number;
  hasMore: boolean;
}

// Database tables configuration (replacing hard-coded devv table IDs)
export const BACKEND_TABLES = {
  PRODUCTS: 'products',
  ADMIN_USERS: 'admin_users',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  USER_PROFILES: 'user_profiles',
  USER_FAVORITES: 'user_favorites',
  DELIVERY_TRACKING: 'delivery_tracking',
  OTP_CODES: 'otp_codes'
} as const;

// Storage keys for localStorage
const STORAGE_PREFIX = 'fresh_backend_';

// Utility functions
const generateId = (): string => {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateUid = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getStorageKey = (tableId: string): string => {
  return `${STORAGE_PREFIX}${tableId}`;
};

const loadTable = (tableId: string): TableItem[] => {
  try {
    const data = localStorage.getItem(getStorageKey(tableId));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading table ${tableId}:`, error);
    return [];
  }
};

const saveTable = (tableId: string, items: TableItem[]): void => {
  try {
    localStorage.setItem(getStorageKey(tableId), JSON.stringify(items));
  } catch (error) {
    console.error(`Error saving table ${tableId}:`, error);
    throw new Error(`Failed to save data to ${tableId}`);
  }
};

// Filter and query utilities
const matchesQuery = (item: TableItem, query: Record<string, any>): boolean => {
  return Object.entries(query).every(([key, value]) => {
    if (value === undefined || value === null) return true;
    const itemValue = item[key];
    const matches = itemValue === value;
    console.log(`🔍 Query match check: item[${key}] (${itemValue}) === query[${key}] (${value}) = ${matches}`);
    return matches;
  });
};

const sortItems = (items: TableItem[], sortField?: string, order: 'asc' | 'desc' = 'desc'): TableItem[] => {
  if (!sortField) return items;
  
  return [...items].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Main backend service class
class BackendService {
  // Add item to table
  async addItem(tableId: string, data: Omit<TableItem, '_id' | '_uid'> & { _uid?: string }): Promise<TableItem> {
    try {
      console.log(`📝 Adding item to ${tableId} with data:`, data);
      
      const items = loadTable(tableId);
      const newItem: TableItem = {
        _id: generateId(),
        _uid: data._uid || generateUid(), // Use provided _uid or generate new one
        ...data,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Important: Preserve the userId field if it exists in the data
      // The userId field is used for querying user orders and should not be removed
      // Only remove _uid from the final object to avoid duplication
      delete (newItem as any)._uid;
      
      console.log(`🔍 Generated item:`, newItem);
      
      items.push(newItem);
      saveTable(tableId, items);
      
      console.log(`✅ Item added to ${tableId}:`, newItem._id);
      return newItem;
    } catch (error) {
      console.error(`❌ Error adding item to ${tableId}:`, error);
      console.error(`❌ Error details:`, {
        tableId,
        data,
        error: error instanceof Error ? error.message : error
      });
      throw new Error(`Failed to add item to ${tableId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get items from table with query options
  async getItems(tableId: string, options: QueryOptions = {}): Promise<TableResponse> {
    try {
      let items = loadTable(tableId);
      
      // Apply query filter
      if (options.query) {
        items = items.filter(item => matchesQuery(item, options.query!));
      }
      
      // Apply sorting
      if (options.sort) {
        items = sortItems(items, options.sort, options.order);
      }
      
      const total = items.length;
      
      // Apply limit
      if (options.limit && options.limit > 0) {
        items = items.slice(0, options.limit);
      }
      
      console.log(`📊 Retrieved ${items.length}/${total} items from ${tableId}`);
      
      return {
        items,
        total,
        hasMore: options.limit ? total > options.limit : false
      };
    } catch (error) {
      console.error(`❌ Error getting items from ${tableId}:`, error);
      throw error;
    }
  }

  // Update item in table
  async updateItem(tableId: string, data: { _id: string; _uid: string; [key: string]: any }): Promise<void> {
    try {
      const items = loadTable(tableId);
      const index = items.findIndex(item => item._id === data._id && item._uid === data._uid);
      
      if (index === -1) {
        throw new Error(`Item not found in ${tableId}: ${data._id}`);
      }
      
      items[index] = {
        ...items[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      
      saveTable(tableId, items);
      console.log(`✅ Item updated in ${tableId}:`, data._id);
    } catch (error) {
      console.error(`❌ Error updating item in ${tableId}:`, error);
      throw error;
    }
  }

  // Delete item from table
  async deleteItem(tableId: string, data: { _id: string; _uid: string }): Promise<void> {
    try {
      const items = loadTable(tableId);
      const filteredItems = items.filter(item => !(item._id === data._id && item._uid === data._uid));
      
      if (filteredItems.length === items.length) {
        throw new Error(`Item not found in ${tableId}: ${data._id}`);
      }
      
      saveTable(tableId, filteredItems);
      console.log(`✅ Item deleted from ${tableId}:`, data._id);
    } catch (error) {
      console.error(`❌ Error deleting item from ${tableId}:`, error);
      throw error;
    }
  }

  // Clear all data (for development/testing)
  async clearAllTables(): Promise<void> {
    try {
      Object.values(BACKEND_TABLES).forEach(tableId => {
        localStorage.removeItem(getStorageKey(tableId));
      });
      console.log('🧹 All tables cleared');
    } catch (error) {
      console.error('❌ Error clearing tables:', error);
      throw error;
    }
  }

  // Get table statistics
  async getTableStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    Object.entries(BACKEND_TABLES).forEach(([key, tableId]) => {
      const items = loadTable(tableId);
      stats[key] = items.length;
    });
    
    return stats;
  }

  // Initialize tables with sample data
  async initializeTables(): Promise<void> {
    try {
      console.log('🚀 Initializing backend tables...');
      
      // Initialize with sample admin user
      const adminUsers = loadTable(BACKEND_TABLES.ADMIN_USERS);
      if (adminUsers.length === 0) {
        await this.addItem(BACKEND_TABLES.ADMIN_USERS, {
          email: 'admin@fresh.co.tz',
          name: 'Fresh Admin',
          role: 'ADMIN',
          is_active: 'active',
          password_hash: 'admin123', // In real app, this should be hashed
          last_login: new Date().toISOString()
        });
      }
      
      console.log('✅ Backend tables initialized');
    } catch (error) {
      console.error('❌ Error initializing tables:', error);
      throw error;
    }
  }
}

// Authentication service (replacing devv auth)
class AuthService {
  private otpCodes: Map<string, { code: string; expiresAt: number }> = new Map();

  async sendOTP(email: string): Promise<void> {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
    
    this.otpCodes.set(email, { code, expiresAt });
    
    // Store OTP in backend for persistence
    await backendService.addItem(BACKEND_TABLES.OTP_CODES, {
      email,
      code,
      expires_at: expiresAt,
      used: false
    });
    
    console.log(`📱 OTP sent to ${email}: ${code} (dev mode - check console)`);
    
    // In production, send actual email/SMS here
    // For development, show in console and use toast notification
    if (process.env.NODE_ENV === 'development') {
      // Show alert
      setTimeout(() => {
        alert(`Development Mode: Your OTP for ${email} is: ${code}`);
      }, 500);
      
      // Also log to console for easy access with styling
      console.log(`%c📱 DEVELOPMENT MODE: Your OTP code for ${email} is: ${code}`, 'font-size: 16px; font-weight: bold; color: #2196F3;');
      console.log('%c📋 You can also use the default test code: 123456 for any email', 'font-size: 14px; color: #666;');
      console.log('%c📋 TIP: Check the browser console for OTP codes if you don\'t receive an email', 'font-size: 14px; color: #FF9800;');
    }
  }

  async verifyOTP(email: string, code: string): Promise<{ user: any }> {
    const storedOtp = this.otpCodes.get(email);
    
    if (!storedOtp) {
      throw new Error('No OTP found for this email');
    }
    
    if (Date.now() > storedOtp.expiresAt) {
      this.otpCodes.delete(email);
      throw new Error('OTP has expired');
    }
    
    if (storedOtp.code !== code) {
      throw new Error('Invalid OTP code');
    }
    
    // OTP is valid, create/get user
    this.otpCodes.delete(email);
    
    // Check if user exists in profiles
    const profiles = await backendService.getItems(BACKEND_TABLES.USER_PROFILES, {
      query: { email }
    });
    
    let user;
    if (profiles.items.length > 0) {
      user = profiles.items[0];
    } else {
      // Create new user profile
      user = await backendService.addItem(BACKEND_TABLES.USER_PROFILES, {
        email,
        name: email.split('@')[0] || 'Fresh User',
        phone: '',
        address: '',
        preferences: '{}',
        is_active: true
      });
    }
    
    console.log('✅ User authenticated:', user.email);
    return { user };
  }

  async logout(): Promise<void> {
    // Clear any client-side tokens/data
    console.log('👋 User logged out');
    return Promise.resolve();
  }
}

// Export instances
export const backendService = new BackendService();
export const authService = new AuthService();

// Compatibility layer to match devv API exactly
export const table = {
  addItem: (tableId: string, data: any) => backendService.addItem(tableId, data),
  getItems: (tableId: string, options: any = {}) => backendService.getItems(tableId, options),
  updateItem: (tableId: string, data: any) => backendService.updateItem(tableId, data),
  deleteItem: (tableId: string, data: any) => backendService.deleteItem(tableId, data)
};

export const auth = {
  sendOTP: (email: string) => authService.sendOTP(email),
  verifyOTP: (email: string, code: string) => authService.verifyOTP(email, code),
  logout: () => authService.logout()
};

// Initialize on import
backendService.initializeTables().catch(console.error);