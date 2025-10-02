import { table } from './backend-service';
import { ADMIN_TABLES, QUERY_LIMITS, ADMIN_ERROR_MESSAGES, ADMIN_SUCCESS_MESSAGES, REVENUE_CALCULATION } from './admin-config';
import { validateProduct, validateAdminUser, ProductData, AdminUserData } from './validation';
import { errorHandler, AppError } from './error-handler';
import { logger } from './logger';

export interface Product {
    _id: string;
    _uid: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    stock_quantity: number;
    is_active: string;
    created_at: string;
    updated_at: string;
}

export interface AdminUser {
    _id: string;
    _uid: string;
    email: string;
    name: string;
    role: string;
    is_active: string;
    created_at: string;
    last_login: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    stock_quantity: number;
    is_active: string;
}

class AdminService {
    // Enhanced Product Management with validation and error handling
    async createProduct(productData: ProductFormData): Promise<Product> {
        try {
            console.log('🔧 Creating product with data:', productData);
            
            // Validate input data
            const validation = validateProduct(productData);
            if (!validation.success) {
                console.error('❌ Validation failed:', validation.error.errors);
                throw errorHandler.createError(
                    'VALIDATION_ERROR',
                    `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`,
                    'VALIDATION_FAILED',
                    validation.error.errors
                );
            }

            const now = new Date().toISOString();
            const productPayload = {
                ...productData,
                created_at: now,
                updated_at: now,
            };
            
            console.log('📦 Adding product to table:', productPayload);
            await table.addItem(ADMIN_TABLES.PRODUCTS, productPayload);
            
            // Get the created product more efficiently
            console.log('🔍 Retrieving created product...');
            const products = await this.getAllProducts(1);
            const createdProduct = products[0];
            
            if (!createdProduct) {
                console.error('❌ Product creation failed - product not found after creation');
                throw errorHandler.createError(
                    'SERVER_ERROR',
                    ADMIN_ERROR_MESSAGES.DATABASE_ERROR,
                    'PRODUCT_CREATE_FAILED'
                );
            }
            
            console.log('✅ Product created successfully:', createdProduct._id);
            return createdProduct;
        } catch (error) {
            console.error('❌ Error creating product:', error);
            if (error instanceof Error && 'type' in error) {
                throw error; // Re-throw AppError
            }
            throw errorHandler.handleError(error);
        }
    }

    async updateProduct(productId: string, uid: string, productData: Partial<ProductFormData>): Promise<Product> {
        try {
            // Validate input data if provided
            if (Object.keys(productData).length > 0) {
                const validation = validateProduct({ 
                    name: '',
                    description: '',
                    price: 0,
                    category: 'other',
                    image_url: 'https://example.com/image.jpg',
                    stock_quantity: 0,
                    is_active: 'active',
                    ...productData 
                } as ProductFormData);
                if (!validation.success) {
                    throw errorHandler.createError(
                        'VALIDATION_ERROR',
                        `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`,
                        'VALIDATION_FAILED',
                        validation.error.errors
                    );
                }
            }

            await table.updateItem(ADMIN_TABLES.PRODUCTS, {
                _uid: uid,
                _id: productId,
                ...productData,
                updated_at: new Date().toISOString(),
            });
            
            // Return updated product
            const products = await this.getAllProducts();
            const updatedProduct = products.find(p => p._id === productId);
            
            if (!updatedProduct) {
                throw errorHandler.createError(
                    'NOT_FOUND_ERROR',
                    ADMIN_ERROR_MESSAGES.PRODUCT_NOT_FOUND,
                    'PRODUCT_NOT_FOUND'
                );
            }
            
            return updatedProduct;
        } catch (error) {
            logger.error('Error updating product', 'ADMIN_SERVICE', error);
            if (error instanceof Error && 'type' in error) {
                throw error;
            }
            throw errorHandler.handleError(error);
        }
    }

    async deleteProduct(productId: string, uid: string): Promise<void> {
        try {
            // Check if product exists before deletion
            const products = await this.getAllProducts();
            const productExists = products.some(p => p._id === productId);
            
            if (!productExists) {
                throw errorHandler.createError(
                    'NOT_FOUND_ERROR',
                    ADMIN_ERROR_MESSAGES.PRODUCT_NOT_FOUND,
                    'PRODUCT_NOT_FOUND'
                );
            }

            await table.deleteItem(ADMIN_TABLES.PRODUCTS, {
                _uid: uid,
                _id: productId
            });
        } catch (error) {
            logger.error('Error deleting product', 'ADMIN_SERVICE', error);
            if (error instanceof Error && 'type' in error) {
                throw error;
            }
            throw errorHandler.handleError(error);
        }
    }

    async getAllProducts(limit?: number): Promise<Product[]> {
        try {
            const queryLimit = limit || QUERY_LIMITS.PRODUCTS_PER_PAGE;
            const response = await table.getItems(ADMIN_TABLES.PRODUCTS, { 
                limit: Math.min(queryLimit, QUERY_LIMITS.MAX_QUERY_LIMIT) 
            });
            return response.items as Product[];
        } catch (error) {
            console.error('Error fetching products:', error);
            throw errorHandler.handleError(error);
        }
    }

    async getProductsByCategory(category: string): Promise<Product[]> {
        try {
            // More efficient approach - should use database filtering if available
            // For now, we'll optimize the client-side filtering
            const response = await table.getItems(ADMIN_TABLES.PRODUCTS, { 
                limit: QUERY_LIMITS.MAX_QUERY_LIMIT 
            });
            const products = response.items as Product[];
            return products.filter(p => p.category === category && p.is_active === 'active');
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw errorHandler.handleError(error);
        }
    }

    async getActiveProducts(): Promise<Product[]> {
        try {
            const response = await table.getItems(ADMIN_TABLES.PRODUCTS, { 
                limit: QUERY_LIMITS.MAX_QUERY_LIMIT 
            });
            const products = response.items as Product[];
            return products.filter(p => p.is_active === 'active');
        } catch (error) {
            console.error('Error fetching active products:', error);
            throw errorHandler.handleError(error);
        }
    }

    // Bulk Operations
    async bulkUpdateProducts(updates: Array<{id: string, uid: string, data: Partial<ProductFormData>}>): Promise<{success: number, failed: number, errors: string[]}> {
        const results = { success: 0, failed: 0, errors: [] as string[] };
        
        for (const update of updates) {
            try {
                await this.updateProduct(update.id, update.uid, update.data);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Product ${update.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        
        return results;
    }

    async bulkDeleteProducts(products: Array<{id: string, uid: string}>): Promise<{success: number, failed: number, errors: string[]}> {
        const results = { success: 0, failed: 0, errors: [] as string[] };
        
        for (const product of products) {
            try {
                await this.deleteProduct(product.id, product.uid);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Product ${product.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        
        return results;
    }

    // Enhanced Admin User Management
    async createAdminUser(userData: {
        email: string;
        name: string;
        role: string;
    }): Promise<AdminUser> {
        try {
            // Validate input data
            const validation = validateAdminUser(userData);
            if (!validation.success) {
                throw errorHandler.createError(
                    'VALIDATION_ERROR',
                    `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`,
                    'VALIDATION_FAILED',
                    validation.error.errors
                );
            }

            // Check if admin user already exists
            const existingAdmin = await this.getAdminUserByEmail(userData.email);
            if (existingAdmin) {
                throw errorHandler.createError(
                    'VALIDATION_ERROR',
                    `Admin user with email ${userData.email} already exists`,
                    'ADMIN_ALREADY_EXISTS'
                );
            }

            const now = new Date().toISOString();
            await table.addItem(ADMIN_TABLES.ADMIN_USERS, {
                ...userData,
                is_active: 'active',
                created_at: now,
                last_login: '',
            });
            
            // Return created admin user
            const users = await this.getAllAdminUsers();
            const createdUser = users.find(u => u.email === userData.email);
            
            if (!createdUser) {
                throw errorHandler.createError(
                    'SERVER_ERROR',
                    ADMIN_ERROR_MESSAGES.DATABASE_ERROR,
                    'ADMIN_CREATE_FAILED'
                );
            }
            
            return createdUser;
        } catch (error) {
            console.error('Error creating admin user:', error);
            if (error instanceof Error && 'type' in error) {
                throw error;
            }
            throw errorHandler.handleError(error);
        }
    }

    async updateAdminUser(userId: string, uid: string, userData: Partial<{
        name: string;
        role: string;
        is_active: string;
    }>): Promise<AdminUser> {
        try {
            // Validate input data if provided
            if (userData.name || userData.role) {
                const validation = validateAdminUser({
                    email: 'temp@example.com', // Temp email for validation
                    name: userData.name || 'temp',
                    role: userData.role || 'EMPLOYEE'
                });
                if (!validation.success) {
                    throw errorHandler.createError(
                        'VALIDATION_ERROR',
                        `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`,
                        'VALIDATION_FAILED',
                        validation.error.errors
                    );
                }
            }

            await table.updateItem(ADMIN_TABLES.ADMIN_USERS, {
                _uid: uid,
                _id: userId,
                ...userData
            });
            
            // Return updated admin user
            const users = await this.getAllAdminUsers();
            const updatedUser = users.find(u => u._id === userId);
            
            if (!updatedUser) {
                throw errorHandler.createError(
                    'NOT_FOUND_ERROR',
                    ADMIN_ERROR_MESSAGES.ADMIN_NOT_FOUND,
                    'ADMIN_NOT_FOUND'
                );
            }
            
            return updatedUser;
        } catch (error) {
            console.error('Error updating admin user:', error);
            if (error instanceof Error && 'type' in error) {
                throw error;
            }
            throw errorHandler.handleError(error);
        }
    }

    async getAllAdminUsers(): Promise<AdminUser[]> {
        try {
            const response = await table.getItems(ADMIN_TABLES.ADMIN_USERS, { 
                limit: QUERY_LIMITS.ADMIN_USERS_PER_PAGE 
            });
            return response.items as AdminUser[];
        } catch (error) {
            console.error('Error fetching admin users:', error);
            throw errorHandler.handleError(error);
        }
    }

    async getAdminUserByEmail(email: string): Promise<AdminUser | null> {
        try {
            // More efficient query if database supports filtering
            const response = await table.getItems(ADMIN_TABLES.ADMIN_USERS, { 
                limit: QUERY_LIMITS.MAX_QUERY_LIMIT 
            });
            const users = response.items as AdminUser[];
            return users.find(u => u.email === email) || null;
        } catch (error) {
            console.error('Error fetching admin user by email:', error);
            throw errorHandler.handleError(error);
        }
    }

    async updateLastLogin(userId: string, uid: string): Promise<void> {
        try {
            await table.updateItem(ADMIN_TABLES.ADMIN_USERS, {
                _uid: uid,
                _id: userId,
                last_login: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error updating last login:', error);
            throw errorHandler.handleError(error);
        }
    }

    // Enhanced Dashboard Analytics with better error handling
    async getDashboardStats(): Promise<{
        totalProducts: number;
        activeProducts: number;
        lowStockProducts: number;
        totalOrders: number;
        totalRevenue: number;
        recentActivity: any[];
    }> {
        try {
            const [products, ordersResponse] = await Promise.all([
                this.getAllProducts(),
                table.getItems(ADMIN_TABLES.ORDERS, { limit: QUERY_LIMITS.MAX_QUERY_LIMIT }),
            ]);

            console.log('🔍 Debug - All orders:', ordersResponse.items);

            const activeProducts = products.filter(p => p.is_active === 'active').length;
            const lowStockProducts = products.filter(p => p.stock_quantity <= 10).length;
            
            // Only count revenue and orders from completed orders (as defined in configuration)
            const completedOrders = ordersResponse.items.filter(
                (order: any) => REVENUE_CALCULATION.COMPLETED_ORDER_STATUSES.includes(order.status)
            );
            
            // Enhanced function to safely get order amount regardless of field name or data type
            const getOrderAmount = (order: any): number => {
                // Try different possible field names for total amount
                const possibleFields = ['total_amount', 'totalAmount', 'amount', 'price', 'total'];
                
                for (const field of possibleFields) {
                    if (order[field] !== undefined && order[field] !== null) {
                        // Handle string amounts by converting to number
                        const value = typeof order[field] === 'string' ? parseFloat(order[field]) : order[field];
                        if (!isNaN(value)) {
                            return value;
                        }
                    }
                }
                
                return 0; // Default to 0 if no valid amount found
            };
            
            // Calculate total revenue with enhanced logging
            let totalRevenue = 0;
            console.log('🔍 Debug - Analyzing completed orders for revenue:');
            completedOrders.forEach((order: any, index: number) => {
                const amount = getOrderAmount(order);
                console.log(`🔍 Order ${index + 1} (${order._id}): status=${order.status}, amount=${amount}`);
                totalRevenue += amount;
            });

            console.log('🔍 Debug - Completed orders:', completedOrders);
            console.log('🔍 Debug - Total revenue calculated:', totalRevenue);
            
            // Also get counts for other statuses for better visibility
            const statusCounts: Record<string, number> = {};
            ordersResponse.items.forEach((order: any) => {
                const status = order.status || 'unknown';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            
            console.log('🔍 Debug - Order status distribution:', statusCounts);

            // Get recent activity (last 10 orders)
            const recentActivity = ordersResponse.items
                .sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0))
                .slice(0, 10)
                .map((order: any) => ({
                    type: 'order',
                    id: order._id,
                    status: order.status,
                    amount: getOrderAmount(order),
                    timestamp: order.created_at
                }));

            const stats = {
                totalProducts: products.length,
                activeProducts,
                lowStockProducts,
                totalOrders: completedOrders.length,
                totalRevenue,
                recentActivity
            };

            console.log('🔍 Debug - Dashboard stats:', stats);

            return stats;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw errorHandler.handleError(error);
        }
    }
}

export const adminService = new AdminService();