// This script is meant to be run in the browser console to debug orders
console.log('=== Order Debug Information ===');

// Check localStorage for orders
const ordersKey = 'fresh_backend_orders';
const ordersData = localStorage.getItem(ordersKey);

if (ordersData) {
  try {
    const orders = JSON.parse(ordersData);
    console.log(`Found ${orders.length} orders in localStorage:`);
    
    // Show order details
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total Amount: ${order.total_amount || order.totalAmount || 0}`);
      console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
      console.log('---');
    });
    
    // Calculate revenue by status
    const revenueByStatus = {};
    let totalRevenue = 0;
    
    orders.forEach(order => {
      const status = order.status || 'unknown';
      const amount = order.total_amount || order.totalAmount || 0;
      
      if (!revenueByStatus[status]) {
        revenueByStatus[status] = { count: 0, revenue: 0 };
      }
      
      revenueByStatus[status].count++;
      revenueByStatus[status].revenue += amount;
      
      // Only count delivered orders as revenue (based on current config)
      if (status === 'delivered') {
        totalRevenue += amount;
      }
    });
    
    console.log('Revenue by Status:');
    Object.keys(revenueByStatus).forEach(status => {
      console.log(`  ${status}: ${revenueByStatus[status].count} orders, TZS ${revenueByStatus[status].revenue.toLocaleString()}`);
    });
    
    console.log(`Total Revenue (delivered orders only): TZS ${totalRevenue.toLocaleString()}`);
    
  } catch (e) {
    console.error('Error parsing orders data:', e);
  }
} else {
  console.log('No orders found in localStorage');
}

// Also check for any other relevant data
Object.keys(localStorage).forEach(key => {
  if (key.includes('order') || key.includes('backend')) {
    console.log(`Found localStorage key: ${key}`);
  }
});