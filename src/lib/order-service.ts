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
    _uid: string;
    order_id?: string; // Custom order identifier
    status: string;
    total_amount: number;
    payment_method: string;
    delivery_address: string;
    delivery_phone: string;
    delivery_notes: string;
    delivery_date: string;
    delivery_time: string;
    created_at: number;
    updated_at: number;
}

export interface OrderItem {
    _id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
    created_at: number;
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
            const result = await table.getItems(ORDERS_TABLE_ID, {
                query: { _uid: userId },
                sort: 'created_at',
                order: 'desc',
                limit: 50
            });

            return result.items as Order[];
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
                    _uid: userId,
                    _id: orderId
                },
                limit: 1
            });

            const order = result.items.length > 0 ? result.items[0] as Order : null;
            
            // Additional security check: verify order belongs to the user
            if (order && order._uid !== userId) {
                console.warn(`Unauthorized order access attempt: User ${userId} tried to access order ${orderId} belonging to ${order._uid}`);
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
            return order !== null && order._uid === userId;
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
        
        if (order._uid !== userId) {
            throw new Error('Unauthorized: Order does not belong to this user');
        }
        
        return order;
    }
}