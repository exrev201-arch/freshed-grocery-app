// Run this in the browser console to debug order data
console.log('=== Detailed Order Debug ===');

// Check localStorage for orders
const ordersKey = 'fresh_backend_orders';
const ordersData = localStorage.getItem(ordersKey);

if (ordersData) {
  try {
    const orders = JSON.parse(ordersData);
    console.log(`Total orders in localStorage: ${orders.length}`);
    
    // Filter for delivered orders
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    console.log(`Delivered orders: ${deliveredOrders.length}`);
    
    // Show details of delivered orders
    deliveredOrders.forEach((order, index) => {
      console.log(`\n--- Delivered Order ${index + 1} ---`);
      console.log(`ID: ${order._id}`);
      console.log(`Status: ${order.status}`);
      console.log(`Total Amount Fields:`);
      console.log(`  total_amount: ${order.total_amount}`);
      console.log(`  totalAmount: ${order.totalAmount}`);
      console.log(`  amount: ${order.amount}`);
      console.log(`  price: ${order.price}`);
      console.log(`Created: ${new Date(order.created_at).toLocaleString()}`);
    });
    
    // Calculate revenue with detailed logging
    console.log('\n=== Revenue Calculation ===');
    let totalRevenue = 0;
    deliveredOrders.forEach(order => {
      const amount = order.total_amount || order.totalAmount || order.amount || order.price || 0;
      console.log(`Order ${order._id}: ${amount}`);
      totalRevenue += amount;
    });
    console.log(`Total Revenue: TZS ${totalRevenue.toLocaleString()}`);
    
  } catch (e) {
    console.error('Error parsing orders data:', e);
  }
} else {
  console.log('No orders found in localStorage');
}