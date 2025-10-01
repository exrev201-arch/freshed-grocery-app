/**
 * Order Debugging Utilities
 * 
 * This module provides utility functions for debugging order storage and retrieval issues.
 */

import { table } from './backend-service';

/**
 * Debug function to inspect what's stored in the orders table
 */
export function debugOrdersTable(): void {
  try {
    const ordersData = localStorage.getItem('fresh_backend_orders');
    if (ordersData) {
      const orders = JSON.parse(ordersData);
      console.log('🔍 Orders table contents:', orders);
      
      // Analyze the structure
      console.log('📊 Orders table analysis:');
      console.log(`  Total orders: ${orders.length}`);
      
      if (orders.length > 0) {
        console.log('  First order structure:', Object.keys(orders[0]));
        console.log('  First order data:', orders[0]);
        
        // Check if userId field is present
        const hasUserId = orders[0].hasOwnProperty('userId');
        const has_uid = orders[0].hasOwnProperty('_uid');
        console.log(`  Has userId field: ${hasUserId}`);
        console.log(`  Has _uid field: ${has_uid}`);
        
        // Check userId values
        const userIds = orders.map((order: any) => order.userId).filter(Boolean);
        console.log(`  Unique userIds:`, [...new Set(userIds)]);
      }
    } else {
      console.log('🔍 Orders table is empty');
    }
  } catch (error) {
    console.error('❌ Error debugging orders table:', error);
  }
}

/**
 * Debug function to test order querying
 */
export async function debugOrderQuery(userId: string): Promise<void> {
  try {
    console.log(`🔍 Testing order query for userId: ${userId}`);
    const result = await table.getItems('orders', {
      query: { userId: userId },
      sort: 'created_at',
      order: 'desc',
      limit: 50
    });
    
    console.log(`🔍 Query result:`, result);
  } catch (error) {
    console.error('❌ Error in order query test:', error);
  }
}

/**
 * Debug function to test order creation
 */
export async function debugCreateTestOrder(userId: string): Promise<void> {
  try {
    console.log(`🔍 Creating test order for userId: ${userId}`);
    const testOrder = {
      orderNumber: `TEST_${Date.now()}`,
      userId: userId,
      status: 'pending',
      total_amount: 1000,
      payment_method: 'cash_on_delivery',
      delivery_address: 'Test Address',
      delivery_phone: '+255123456789',
      delivery_notes: 'Test order',
      delivery_date: new Date().toISOString().split('T')[0],
      delivery_time: '09:00-12:00',
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    const result = await table.addItem('orders', testOrder);
    console.log('✅ Test order created:', result);
    
    // Now try to retrieve it
    await debugOrderQuery(userId);
  } catch (error) {
    console.error('❌ Error creating test order:', error);
  }
}

// Make functions available globally for debugging
(window as any).debugOrdersTable = debugOrdersTable;
(window as any).debugOrderQuery = debugOrderQuery;
(window as any).debugCreateTestOrder = debugCreateTestOrder;

console.log('✅ Order debugging utilities loaded. Available functions:');
console.log('- debugOrdersTable()');
console.log('- debugOrderQuery(userId)');
console.log('- debugCreateTestOrder(userId)');

export default {
  debugOrdersTable,
  debugOrderQuery,
  debugCreateTestOrder
};