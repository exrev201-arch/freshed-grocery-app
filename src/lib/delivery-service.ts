import { table } from './backend-service';
import { databaseService } from './database-service';

// Table IDs
const DELIVERY_TABLE_ID = 'delivery_tracking';
const ORDERS_TABLE_ID = 'orders';
const ORDER_ITEMS_TABLE_ID = 'order_items';

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready_for_pickup'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';

export interface LocationUpdate {
    timestamp: string;
    latitude: number;
    longitude: number;
    address?: string;
    notes?: string;
    speed?: number;
    accuracy?: number;
}

export interface DeliveryTracker {
    _id: string;
    _uid: string;
    order_id: string;
    delivery_person_name: string;
    delivery_person_phone: string;
    status: string; // delivery status: assigned, picked_up, in_transit, delivered, failed
    assigned_at: string;
    picked_up_at?: string;
    delivered_at?: string;
    delivery_notes?: string;
    location_updates?: string; // JSON string of LocationUpdate[]
    current_location?: string; // JSON string of current LocationUpdate
    estimated_arrival?: string;
    distance_remaining?: number;
    customer_rating?: number;
    customer_feedback?: string;
}

export interface DeliveryPersonnel {
    _id: string;
    name: string;
    phone: string;
    status: 'available' | 'busy' | 'offline';
    current_orders: number;
}

export interface Order {
    _id: string;
    _uid: string;
    status: OrderStatus;
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

// Order Processing Functions
export async function processOrder(orderId: string, adminUid: string): Promise<boolean> {
    try {
        // Try modern database service first
        const modernOrder = await databaseService.findById('orders', orderId);
        if (modernOrder) {
            await databaseService.update('orders', orderId, {
                status: 'confirmed',
            } as any);
        } else {
            // Fallback to legacy table service
            const orderResult = await table.getItems(ORDERS_TABLE_ID, {
                query: { _id: orderId },
                limit: 1
            });

            if (!orderResult.items.length) {
                throw new Error('Order not found');
            }

            // Update order status to confirmed
            await table.updateItem(ORDERS_TABLE_ID, {
                _uid: orderResult.items[0]._uid,
                _id: orderId,
                status: 'confirmed',
                updated_at: Date.now()
            });
        }

        return true;
    } catch (error) {
        console.error('Error processing order:', error);
        return false;
    }
}

export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminUid: string,
    notes?: string
): Promise<boolean> {
    try {
        // Try to update in modern database service first
        const modernOrder = await databaseService.findById('orders', orderId);
        if (modernOrder) {
            await databaseService.update('orders', orderId, {
                status: newStatus,
            } as any); // Type assertion for compatibility
        } else {
            // Fallback to legacy table service
            const orderResult = await table.getItems(ORDERS_TABLE_ID, {
                query: { _id: orderId },
                limit: 1
            });

            if (!orderResult.items.length) {
                throw new Error('Order not found');
            }

            // Update order status in legacy system
            await table.updateItem(ORDERS_TABLE_ID, {
                _uid: orderResult.items[0]._uid,
                _id: orderId,
                status: newStatus,
                updated_at: Date.now()
            });
        }

        // Update delivery tracker if exists (this remains the same for both systems)
        // Get all delivery records and find by order_id
        const deliveryResult = await table.getItems(DELIVERY_TABLE_ID, {
            limit: 100
        });
        const deliveryItems = deliveryResult.items.filter((item: any) => item.order_id === orderId);

        if (deliveryItems.length > 0) {
            // Map order status to delivery status
            let deliveryStatus = 'assigned';
            if (newStatus === 'ready_for_pickup') deliveryStatus = 'assigned';
            else if (newStatus === 'out_for_delivery') deliveryStatus = 'picked_up';
            else if (newStatus === 'delivered') deliveryStatus = 'delivered';

            await table.updateItem(DELIVERY_TABLE_ID, {
                _uid: deliveryItems[0]._uid,
                _id: deliveryItems[0]._id,
                status: deliveryStatus,
                delivery_notes: notes || `Order status updated to ${newStatus}`
            });
        }

        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
}

export async function assignDeliveryPerson(
    orderId: string,
    deliveryPersonPhone: string,
    deliveryPersonName: string,
    adminUid: string
): Promise<boolean> {
    try {
        // Create delivery tracker
        const deliveryTracker = {
            order_id: orderId,
            delivery_person_name: deliveryPersonName,
            delivery_person_phone: deliveryPersonPhone,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
            delivery_notes: 'Delivery assigned to ' + deliveryPersonName
        };

        await table.addItem(DELIVERY_TABLE_ID, deliveryTracker);

        // Update order status to out_for_delivery
        await updateOrderStatus(orderId, 'out_for_delivery', adminUid);

        return true;
    } catch (error) {
        console.error('Error assigning delivery person:', error);
        return false;
    }
}

export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
        // Get all orders using the updated getAllOrders function
        const allOrders = await getAllOrders();
        
        // Filter by status
        return allOrders.filter(order => order.status === status);
    } catch (error) {
        console.error('Error fetching orders by status:', error);
        throw error;
    }
}

export async function getAllOrders(): Promise<Order[]> {
    try {
        console.log('🔍 getAllOrders: Starting to fetch orders...');
        
        // First try to get orders from the modern database service (used by checkout)
        const modernOrders = await databaseService.findMany('orders', {
            sortBy: 'createdAt',
            sortOrder: 'desc',
            limit: 100
        });
        
        console.log('📦 Modern orders found:', modernOrders.items?.length || 0, modernOrders);
        
        // Convert modern order format to legacy format for admin compatibility
        const convertedOrders = (modernOrders.items || []).map((order: any) => {
            console.log('🔄 Converting modern order:', order.id, order);
            
            try {
                const converted = {
                    _id: order.id,
                    _uid: order.userId,
                    status: order.status,
                    total_amount: order.totalAmount,
                    payment_method: order.paymentMethod,
                    delivery_address: order.deliveryAddress ? 
                        `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.ward || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : 
                        'No address',
                    delivery_phone: order.customerInfo?.phoneNumber || '',
                    delivery_notes: order.deliveryAddress?.instructions || '',
                    delivery_date: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
                    delivery_time: order.deliveryTimeSlot || '',
                    created_at: new Date(order.createdAt).getTime(),
                    updated_at: new Date(order.updatedAt).getTime()
                };
                
                console.log('✅ Converted order:', converted);
                return converted;
            } catch (conversionError) {
                console.error('❌ Error converting order:', order.id, conversionError);
                // Return a safe fallback
                return {
                    _id: order.id || 'unknown',
                    _uid: order.userId || 'unknown',
                    status: order.status || 'pending',
                    total_amount: order.totalAmount || 0,
                    payment_method: order.paymentMethod || 'unknown',
                    delivery_address: 'Conversion error',
                    delivery_phone: '',
                    delivery_notes: '',
                    delivery_date: '',
                    delivery_time: '',
                    created_at: Date.now(),
                    updated_at: Date.now()
                };
            }
        });
        
        console.log('🔄 Converted orders:', convertedOrders.length, convertedOrders);
        
        // Also get orders from legacy table service for backward compatibility
        console.log('🗃️ Fetching legacy orders...');
        const legacyResult = await table.getItems(ORDERS_TABLE_ID, {
            sort: 'created_at',
            order: 'desc',
            limit: 100
        });
        
        console.log('📂 Legacy orders found:', legacyResult.items?.length || 0, legacyResult);
        const legacyOrders = legacyResult.items as unknown as Order[] || [];
        
        // Combine and deduplicate orders (modern orders take precedence)
        const allOrders = [...convertedOrders, ...legacyOrders];
        const uniqueOrders = allOrders.filter((order, index, self) => 
            index === self.findIndex(o => o._id === order._id)
        );
        
        // Sort by creation time descending
        uniqueOrders.sort((a, b) => b.created_at - a.created_at);
        
        console.log('🎯 Final combined orders:', uniqueOrders.length, uniqueOrders);
        
        return uniqueOrders;
    } catch (error) {
        console.error('❌ Error fetching all orders:', error);
        throw error;
    }
}

export async function getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    try {
        // First try to get order items from modern database service
        const modernOrderItems = await databaseService.findMany('order_items', {
            filters: { orderId },
            limit: 100
        });
        
        // Convert modern order item format to legacy format
        const convertedItems = modernOrderItems.items.map((item: any) => ({
            _id: item.id,
            order_id: item.orderId,
            product_id: item.productId,
            product_name: item.productName,
            product_price: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.totalPrice,
            created_at: new Date(item.createdAt).getTime()
        }));
        
        // Also get from legacy table service for backward compatibility
        const legacyResult = await table.getItems(ORDER_ITEMS_TABLE_ID, {
            limit: 100
        });
        
        const legacyItems = legacyResult.items as unknown as OrderItem[] || [];
        const filteredLegacyItems = legacyItems.filter(item => item.order_id === orderId);
        
        // Combine and deduplicate (modern items take precedence)
        const allItems = [...convertedItems, ...filteredLegacyItems];
        const uniqueItems = allItems.filter((item, index, self) => 
            index === self.findIndex(i => i._id === item._id)
        );
        
        return uniqueItems;
    } catch (error) {
        console.error('Error fetching order items:', error);
        throw error;
    }
}

export async function getOrderDelivery(orderId: string): Promise<DeliveryTracker | null> {
    try {
        // Get all delivery records and find by order_id
        const result = await table.getItems(DELIVERY_TABLE_ID, {
            limit: 100
        });

        const deliveryItems = result.items.filter((item: any) => item.order_id === orderId);
        return deliveryItems.length > 0 ? deliveryItems[0] as DeliveryTracker : null;
    } catch (error) {
        console.error('Error fetching order delivery:', error);
        throw error;
    }
}

export async function updateDeliveryLocation(
    orderId: string,
    latitude: number,
    longitude: number,
    address?: string,
    notes?: string,
    speed?: number,
    accuracy?: number
): Promise<boolean> {
    try {
        // Get all delivery records and find by order_id
        const deliveryResult = await table.getItems(DELIVERY_TABLE_ID, {
            limit: 100
        });

        const deliveryItems = deliveryResult.items.filter((item: any) => item.order_id === orderId);
        if (!deliveryItems.length) {
            throw new Error('Delivery tracker not found');
        }

        const delivery = deliveryItems[0];

        // Create new location update
        const locationUpdate: LocationUpdate = {
            timestamp: new Date().toISOString(),
            latitude,
            longitude,
            address,
            notes,
            speed,
            accuracy
        };

        // Update location history
        const existingUpdates = delivery.location_updates ? JSON.parse(delivery.location_updates) : [];
        existingUpdates.push(locationUpdate);

        // Keep only last 50 updates to prevent data bloat
        const recentUpdates = existingUpdates.slice(-50);

        await table.updateItem(DELIVERY_TABLE_ID, {
            _uid: delivery._uid,
            _id: delivery._id,
            location_updates: JSON.stringify(recentUpdates),
            current_location: JSON.stringify(locationUpdate),
            delivery_notes: notes || delivery.delivery_notes,
            status: 'in_transit'
        });

        return true;
    } catch (error) {
        console.error('Error updating delivery location:', error);
        return false;
    }
}

export async function updateEstimatedArrival(
    orderId: string,
    estimatedArrival: string,
    distanceRemaining?: number
): Promise<boolean> {
    try {
        const deliveryResult = await table.getItems(DELIVERY_TABLE_ID, {
            limit: 100
        });

        const deliveryItems = deliveryResult.items.filter((item: any) => item.order_id === orderId);
        if (!deliveryItems.length) {
            throw new Error('Delivery tracker not found');
        }

        const delivery = deliveryItems[0];

        await table.updateItem(DELIVERY_TABLE_ID, {
            _uid: delivery._uid,
            _id: delivery._id,
            estimated_arrival: estimatedArrival,
            distance_remaining: distanceRemaining
        });

        return true;
    } catch (error) {
        console.error('Error updating estimated arrival:', error);
        return false;
    }
}

export async function startDeliveryRoute(orderId: string): Promise<boolean> {
    try {
        const deliveryResult = await table.getItems(DELIVERY_TABLE_ID, {
            limit: 100
        });

        const deliveryItems = deliveryResult.items.filter((item: any) => item.order_id === orderId);
        if (!deliveryItems.length) {
            throw new Error('Delivery tracker not found');
        }

        const delivery = deliveryItems[0];

        await table.updateItem(DELIVERY_TABLE_ID, {
            _uid: delivery._uid,
            _id: delivery._id,
            status: 'picked_up',
            picked_up_at: new Date().toISOString(),
            delivery_notes: 'Delivery person has picked up the order and started route'
        });

        return true;
    } catch (error) {
        console.error('Error starting delivery route:', error);
        return false;
    }
}

export async function completeDelivery(orderId: string, finalLocation?: LocationUpdate): Promise<boolean> {
    try {
        // Get all delivery records and find by order_id
        const deliveryResult = await table.getItems(DELIVERY_TABLE_ID, {
            limit: 100
        });

        const deliveryItems = deliveryResult.items.filter((item: any) => item.order_id === orderId);
        if (!deliveryItems.length) {
            throw new Error('Delivery tracker not found');
        }

        const delivery = deliveryItems[0];

        // Add final location if provided
        const updateData: any = {
            _uid: delivery._uid,
            _id: delivery._id,
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            delivery_notes: 'Order successfully delivered'
        };

        if (finalLocation) {
            const existingUpdates = delivery.location_updates ? JSON.parse(delivery.location_updates) : [];
            existingUpdates.push(finalLocation);
            updateData.location_updates = JSON.stringify(existingUpdates);
            updateData.current_location = JSON.stringify(finalLocation);
        }

        await table.updateItem(DELIVERY_TABLE_ID, updateData);

        // Update order status
        const orderResult = await table.getItems(ORDERS_TABLE_ID, {
            query: { _id: orderId },
            limit: 1
        });

        if (orderResult.items.length > 0) {
            await table.updateItem(ORDERS_TABLE_ID, {
                _uid: orderResult.items[0]._uid,
                _id: orderId,
                status: 'delivered',
                updated_at: Date.now()
            });
        }

        return true;
    } catch (error) {
        console.error('Error completing delivery:', error);
        return false;
    }
}

// Utility function to calculate distance between two points
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

// Get delivery personnel location tracking
export async function getActiveDeliveries(): Promise<DeliveryTracker[]> {
    try {
        const result = await table.getItems(DELIVERY_TABLE_ID, {
            limit: 100
        });

        const deliveries = result.items as DeliveryTracker[] || [];
        return deliveries.filter(delivery =>
            delivery.status === 'assigned' ||
            delivery.status === 'picked_up' ||
            delivery.status === 'in_transit'
        );
    } catch (error) {
        console.error('Error fetching active deliveries:', error);
        return [];
    }
}