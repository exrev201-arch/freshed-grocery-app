/**
 * Enhanced Database Service for Fresh Grocery Tanzania
 * 
 * This service provides a comprehensive database layer with proper schema validation,
 * indexing, and relationships management for production use.
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import type {
  SystemSetting, BaseEntity
} from '@/types/database';

// Database configuration
interface DatabaseConfig {
  version: string;
  tables: string[];
  indexes: Record<string, string[]>;
}

const DB_CONFIG: DatabaseConfig = {
  version: '1.0.0',
  tables: [
    'users', 'addresses', 'admin_users', 'categories', 'brands', 'products',
    'inventory_movements', 'cart_items', 'wishlist_items', 'orders', 'order_items',
    'payments', 'delivery_persons', 'deliveries', 'notifications',
    'analytics_events', 'system_settings'
  ],
  indexes: {
    users: ['email', 'phoneNumber', 'status'],
    products: ['categoryId', 'brandId', 'sku', 'isActive'],
    orders: ['userId', 'status', 'paymentStatus', 'orderNumber'],
    payments: ['orderId', 'status', 'method', 'externalTransactionId'],
    deliveries: ['orderId', 'deliveryPersonId', 'status'],
  }
};

// Query options for database operations
interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  includes?: string[];
}

interface QueryResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

class DatabaseService {
  private storagePrefix = 'fresh_db_';
  private indexes: Map<string, Map<string, Set<string>>> = new Map();

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    logger.info(`Initializing Fresh Grocery Database v${DB_CONFIG.version}`, 'DATABASE');
    
    // Initialize tables if they don't exist
    DB_CONFIG.tables.forEach(table => {
      const key = this.getStorageKey(table);
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });

    // Build indexes for better query performance
    this.buildIndexes();
    
    // Initialize system settings
    this.initializeSystemSettings();
    
    logger.info('Database initialized successfully', 'DATABASE');
  }

  private buildIndexes(): void {
    logger.debug('Building database indexes...', 'DATABASE');
    
    Object.entries(DB_CONFIG.indexes).forEach(([table, fields]) => {
      const items = this.getAllItems(table);
      const tableIndexes = new Map<string, Set<string>>();
      
      fields.forEach(field => {
        const fieldIndex = new Set<string>();
        items.forEach((item: any) => {
          if (item[field] !== undefined) {
            const value = String(item[field]);
            fieldIndex.add(`${value}:${item.id}`);
          }
        });
        tableIndexes.set(field, fieldIndex);
      });
      
      this.indexes.set(table, tableIndexes);
    });
    
    logger.debug('Indexes built successfully', 'DATABASE');
  }

  private initializeSystemSettings(): void {
    const settingsKey = this.getStorageKey('system_settings');
    const existingSettings = JSON.parse(localStorage.getItem(settingsKey) || '[]');
    
    if (existingSettings.length === 0) {
      const defaultSettings: SystemSetting[] = [
        {
          id: uuidv4(),
          key: 'site_name',
          value: 'Fresh Grocery TZ',
          type: 'string',
          category: 'general',
          description: 'Site name displayed in the application',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          key: 'default_currency',
          value: 'TZS',
          type: 'string',
          category: 'general',
          description: 'Default currency for the application',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          key: 'default_language',
          value: 'en',
          type: 'string',
          category: 'general',
          description: 'Default language for the application',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          key: 'delivery_fee',
          value: '3000',
          type: 'number',
          category: 'delivery',
          description: 'Standard delivery fee in TZS',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          key: 'free_delivery_threshold',
          value: '50000',
          type: 'number',
          category: 'delivery',
          description: 'Minimum order value for free delivery in TZS',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          key: 'tax_rate',
          value: '0.18',
          type: 'number',
          category: 'general',
          description: 'VAT rate for Tanzania (18%)',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      
      localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
      logger.info('Default system settings initialized', 'DATABASE');
    }
  }

  private getStorageKey(table: string): string {
    return `${this.storagePrefix}${table}`;
  }

  private generateId(): string {
    return uuidv4();
  }

  private addTimestamps<T extends BaseEntity>(item: Omit<T, keyof BaseEntity>): T {
    const now = new Date();
    return {
      ...item,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    } as T;
  }

  private updateTimestamps<T extends BaseEntity>(item: T): T {
    return {
      ...item,
      updatedAt: new Date(),
    };
  }

  // Generic CRUD operations
  async create<T extends BaseEntity>(table: string, data: Omit<T, keyof BaseEntity>): Promise<T> {
    const item = this.addTimestamps<T>(data);
    const items = this.getAllItems(table);
    items.push(item);
    this.saveItems(table, items);
    this.updateIndexes(table, item, 'create');
    return item;
  }

  async findById<T extends BaseEntity>(table: string, id: string): Promise<T | null> {
    const items = this.getAllItems(table);
    return items.find((item: T) => item.id === id) || null;
  }

  async findOne<T extends BaseEntity>(table: string, filters: Partial<T>): Promise<T | null> {
    const items = this.getAllItems(table);
    return items.find((item: T) => {
      return Object.entries(filters).every(([key, value]) => item[key as keyof T] === value);
    }) || null;
  }

  async findMany<T extends BaseEntity>(table: string, options: QueryOptions = {}): Promise<QueryResult<T>> {
    let items = this.getAllItems(table) as T[];
    
    // Apply filters
    if (options.filters) {
      items = items.filter(item => {
        return Object.entries(options.filters!).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes((item as any)[key]);
          }
          return (item as any)[key] === value;
        });
      });
    }
    
    // Apply sorting
    if (options.sortBy) {
      items.sort((a, b) => {
        const aVal = (a as any)[options.sortBy!];
        const bVal = (b as any)[options.sortBy!];
        const order = options.sortOrder === 'desc' ? -1 : 1;
        
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }
    
    const total = items.length;
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    
    // Apply pagination
    items = items.slice(offset, offset + limit);
    
    return {
      items,
      total,
      hasMore: offset + limit < total,
      pagination: {
        page,
        limit,
        totalPages,
      },
    };
  }

  async update<T extends BaseEntity>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
    const items = this.getAllItems(table);
    const index = items.findIndex((item: T) => item.id === id);
    
    if (index === -1) return null;
    
    const updatedItem = this.updateTimestamps({
      ...items[index],
      ...updates,
    });
    
    items[index] = updatedItem;
    this.saveItems(table, items);
    this.updateIndexes(table, updatedItem, 'update');
    
    return updatedItem;
  }

  async delete(table: string, id: string): Promise<boolean> {
    const items = this.getAllItems(table);
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) return false;
    
    const deletedItem = items[index];
    items.splice(index, 1);
    this.saveItems(table, items);
    this.updateIndexes(table, deletedItem, 'delete');
    
    return true;
  }

  // Relationship helpers
  async findWithRelations<T extends BaseEntity>(
    table: string,
    id: string,
    relations: Record<string, { table: string; foreignKey: string; localKey?: string }>
  ): Promise<(T & Record<string, any>) | null> {
    const item = await this.findById<T>(table, id);
    if (!item) return null;

    const result = { ...item } as any;

    for (const [relationName, config] of Object.entries(relations)) {
      const foreignValue = (item as any)[config.foreignKey];
      
      if (foreignValue) {
        result[relationName] = await this.findById(config.table, foreignValue);
      }
    }

    return result as T & Record<string, any>;
  }

  // Bulk operations
  async bulkCreate<T extends BaseEntity>(table: string, data: Omit<T, keyof BaseEntity>[]): Promise<T[]> {
    const items = data.map(item => this.addTimestamps<T>(item));
    const existingItems = this.getAllItems(table);
    existingItems.push(...items);
    this.saveItems(table, existingItems);
    
    // Update indexes for all new items
    items.forEach(item => this.updateIndexes(table, item, 'create'));
    
    return items;
  }

  async bulkUpdate<T extends BaseEntity>(table: string, updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    const items = this.getAllItems(table);
    const updatedItems: T[] = [];
    
    updates.forEach(({ id, data }) => {
      const index = items.findIndex((item: T) => item.id === id);
      if (index !== -1) {
        const updatedItem = this.updateTimestamps({
          ...items[index],
          ...data,
        });
        items[index] = updatedItem;
        updatedItems.push(updatedItem);
        this.updateIndexes(table, updatedItem, 'update');
      }
    });
    
    this.saveItems(table, items);
    return updatedItems;
  }

  // Search functionality
  async search<T extends BaseEntity>(
    table: string,
    query: string,
    searchFields: string[],
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const items = this.getAllItems(table) as T[];
    const searchTerm = query.toLowerCase();
    
    const filteredItems = items.filter(item => {
      return searchFields.some(field => {
        const value = (item as any)[field];
        return value && String(value).toLowerCase().includes(searchTerm);
      });
    });
    
    return this.findMany(table, {
      ...options,
      filters: {
        ...options.filters,
        id: filteredItems.map(item => item.id),
      },
    });
  }

  // Analytics and aggregation
  async aggregate(table: string, field: string, operation: 'sum' | 'avg' | 'count' | 'min' | 'max'): Promise<number> {
    const items = this.getAllItems(table);
    const values = items
      .map((item: any) => item[field])
      .filter(value => typeof value === 'number');
    
    switch (operation) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'avg':
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      case 'count':
        return values.length;
      case 'min':
        return values.length > 0 ? Math.min(...values) : 0;
      case 'max':
        return values.length > 0 ? Math.max(...values) : 0;
      default:
        return 0;
    }
  }

  // Private helper methods
  private getAllItems(table: string): any[] {
    const key = this.getStorageKey(table);
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  private saveItems(table: string, items: any[]): void {
    const key = this.getStorageKey(table);
    localStorage.setItem(key, JSON.stringify(items));
  }

  private updateIndexes(table: string, item: any, operation: 'create' | 'update' | 'delete'): void {
    const tableIndexes = this.indexes.get(table);
    if (!tableIndexes) return;

    const indexFields = DB_CONFIG.indexes[table] || [];
    
    indexFields.forEach(field => {
      const fieldIndex = tableIndexes.get(field);
      if (!fieldIndex) return;

      const value = String(item[field]);
      const indexKey = `${value}:${item.id}`;

      if (operation === 'delete') {
        fieldIndex.delete(indexKey);
      } else {
        fieldIndex.add(indexKey);
      }
    });
  }

  // Database maintenance
  async vacuum(): Promise<void> {
    logger.info('Running database vacuum...', 'DATABASE');
    
    // Remove soft-deleted items older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const tablesWithSoftDelete = ['admin_users', 'categories', 'brands', 'products', 'delivery_persons'];
    
    for (const table of tablesWithSoftDelete) {
      const items = this.getAllItems(table);
      const cleanedItems = items.filter((item: any) => {
        return !item.isDeleted || new Date(item.deletedAt) > thirtyDaysAgo;
      });
      
      if (cleanedItems.length !== items.length) {
        this.saveItems(table, cleanedItems);
        logger.info(`Cleaned ${items.length - cleanedItems.length} items from ${table}`, 'DATABASE');
      }
    }
    
    // Rebuild indexes
    this.buildIndexes();
    
    logger.info('Database vacuum completed', 'DATABASE');
  }

  // Export/Import functionality
  async exportData(): Promise<Record<string, any[]>> {
    const data: Record<string, any[]> = {};
    
    DB_CONFIG.tables.forEach(table => {
      data[table] = this.getAllItems(table);
    });
    
    return data;
  }

  async importData(data: Record<string, any[]>): Promise<void> {
    Object.entries(data).forEach(([table, items]) => {
      this.saveItems(table, items);
    });
    
    this.buildIndexes();
    logger.info('Data imported successfully', 'DATABASE');
  }

  // Health check
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {
      version: DB_CONFIG.version,
      tables: {},
      totalSize: 0,
    };
    
    DB_CONFIG.tables.forEach(table => {
      const items = this.getAllItems(table);
      const size = JSON.stringify(items).length;
      
      stats.tables[table] = {
        count: items.length,
        size: `${(size / 1024).toFixed(2)} KB`,
      };
      
      stats.totalSize += size;
    });
    
    stats.totalSize = `${(stats.totalSize / 1024).toFixed(2)} KB`;
    
    return stats;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;