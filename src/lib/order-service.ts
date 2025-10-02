// Order management service
import { table } from './backend-service';

// Table IDs for orders
const ORDERS_TABLE_ID = 'orders';
const ORDER_ITEMS_TABLE_ID = 'order_items';

export interface CreateOrderData {
    items: Array<{
        productId: string;
        productName: string;
        productPrice: number;
        quantity: number;
    }>;
    totalAmount: number;
    paymentMethod: 'cash_on_delivery' | 'mobile_money';
    deliveryAddress: string;
    deliveryPhone: string;
    deliveryNotes: string;
    deliveryDate: string; // YYYY-MM-DD
    deliveryTime: string; // Time slot
}

export interface Order {
    _id: string;
    userId: string; // User ID for order ownership
    order_id?: string; // Custom order identifier
    orderNumber: string; // Human-readable order number
    status: string;
    total_amount?: number;
    totalAmount?: number; // Alternative field name
    payment_method: string;
    paymentMethod?: string; // Alternative field name
    delivery_address: string;
    deliveryAddress?: string; // Alternative field name
    delivery_phone: string;
    deliveryPhone?: string; // Alternative field name
    delivery_notes: string;
    deliveryNotes?: string; // Alternative field name
    delivery_date: string;
    deliveryDate?: string; // Alternative field name
    delivery_time: string;
    deliveryTime?: string; // Alternative field name
    deliveryTimeSlot?: string; // Additional field
    created_at: number;
    updated_at: number;
    // Customer information
    customerInfo?: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    // Delivery information
    deliveryAddressInfo?: {
        street: string;
        ward: string;
        district: string;
        region: string;
        country: string;
        instructions?: string;
    };
    // Payment information
    paymentStatus?: string;
    fulfillmentStatus?: string;
    subtotal?: number;
    taxAmount?: number;
    shippingAmount?: number;
    discountAmount?: number;
    currency?: string;
    source?: string;
    // Add other TableItem properties that might be present
    _uid?: string;
    [key: string]: any;
}

export interface OrderItem {
    _id: string;
    orderId: string; // Reference to order _id
    productId: string;
    productName: string;
    productSku?: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    quantityFulfilled: number;
    quantityRefunded: number;
    created_at: number;
    // Add other TableItem properties that might be present
    _uid?: string;
    [key: string]: any;
}

export class OrderService {
    static async createOrder(orderData: CreateOrderData): Promise<string> {
        try {
            const now = Date.now();

            // Generate a unique order ID using timestamp and random component
            const orderId = `order_${now}_${Math.random().toString(36).substr(2, 9)}`;

            // Create the main order
            const orderPayload = {
                order_id: orderId, // Add custom order ID for reference
                status: 'pending',
                total_amount: orderData.totalAmount,
                payment_method: orderData.paymentMethod,
                delivery_address: orderData.deliveryAddress,
                delivery_phone: orderData.deliveryPhone,
                delivery_notes: orderData.deliveryNotes,
                delivery_date: orderData.deliveryDate,
                delivery_time: orderData.deliveryTime,
                created_at: now,
                updated_at: now
            };

            await table.addItem(ORDERS_TABLE_ID, orderPayload);

            // Create order items using the custom order ID
            for (const item of orderData.items) {
                await table.addItem(ORDER_ITEMS_TABLE_ID, {
                    order_id: orderId,
                    product_id: item.productId,
                    product_name: item.productName,
                    product_price: item.productPrice,
                    quantity: item.quantity,
                    subtotal: item.productPrice * item.quantity,
                    created_at: now
                });
            }

            return orderId;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    static async getUserOrders(userId: string): Promise<Order[]> {
        try {
            console.log(`🔍 getUserOrders called with userId: ${userId}`);
            const result = await table.getItems(ORDERS_TABLE_ID, {
                query: { userId: userId },
                sort: 'created_at',
                order: 'desc',
                limit: 50
            });
            
            console.log(`🔍 Found ${result.items.length} orders for userId: ${userId}`);
            console.log(`🔍 Order items:`, result.items);

            return result.items as unknown as Order[];
        } catch (error) {
            console.error('Error fetching user orders:', error);
            throw error;
        }
    }

    static async getOrderItems(orderId: string): Promise<OrderItem[]> {
        try {
            const result = await table.getItems(ORDER_ITEMS_TABLE_ID, {
                query: { order_id: orderId },
                sort: 'created_at',
                order: 'asc'
            });

            return result.items as unknown as OrderItem[];
        } catch (error) {
            console.error('Error fetching order items:', error);
            throw error;
        }
    }

    static async updateOrderStatus(orderId: string, userId: string, status: string): Promise<void> {
        try {
            await table.updateItem(ORDERS_TABLE_ID, {
                _uid: userId,
                _id: orderId,
                userId: userId,
                status: status,
                updated_at: Date.now()
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    static async getOrder(orderId: string, userId: string): Promise<Order | null> {
        try {
            const result = await table.getItems(ORDERS_TABLE_ID, {
                query: {
                    userId: userId,
                    _id: orderId
                },
                limit: 1
            });

            const order = result.items.length > 0 ? result.items[0] as unknown as Order : null;
            
            // Additional security check: verify order belongs to the user
            if (order && order.userId !== userId) {
                console.warn(`Unauthorized order access attempt: User ${userId} tried to access order ${orderId} belonging to ${order.userId}`);
                return null;
            }

            return order;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    }

    /**
     * Verify order ownership - additional security layer
     */
    static async verifyOrderOwnership(orderId: string, userId: string): Promise<boolean> {
        try {
            const order = await this.getOrder(orderId, userId);
            return order !== null && order.userId === userId;
        } catch (error) {
            console.error('Error verifying order ownership:', error);
            return false;
        }
    }

    /**
     * Get order with strict ownership verification
     */
    static async getOrderSecure(orderId: string, userId: string): Promise<Order> {
        const order = await this.getOrder(orderId, userId);
        
        if (!order) {
            throw new Error('Order not found or access denied');
        }
        
        if (order.userId !== userId) {
            throw new Error('Unauthorized: Order does not belong to this user');
        }
        
        return order;
    }
}