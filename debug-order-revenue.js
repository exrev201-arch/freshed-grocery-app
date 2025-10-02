// Fresh Grocery Order Revenue Debug Tool
// Run this in your browser's developer console (F12 -> Console tab)

(function() {
    console.log('=== Fresh Grocery Order Revenue Debug Tool ===');
    
    // Function to safely get order amount regardless of field name or data type
    function getOrderAmount(order) {
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
    }
    
    // Function to analyze order data
    function analyzeOrders() {
        try {
            console.log('🔍 Searching for order data in localStorage...');
            
            // Check all possible localStorage keys that might contain orders
            const possibleKeys = Object.keys(localStorage).filter(key => 
                key.includes('order') || key.includes('backend') || key.includes('fresh')
            );
            
            console.log('🔍 Found potential order storage keys:', possibleKeys);
            
            // Look for orders data
            let orders = [];
            let foundKey = null;
            
            for (const key of possibleKeys) {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsed = JSON.parse(data);
                        // Check if this is an array of orders or an object containing orders
                        if (Array.isArray(parsed)) {
                            orders = parsed;
                            foundKey = key;
                            break;
                        } else if (parsed.items && Array.isArray(parsed.items)) {
                            orders = parsed.items;
                            foundKey = key;
                            break;
                        } else if (parsed.orders && Array.isArray(parsed.orders)) {
                            orders = parsed.orders;
                            foundKey = key;
                            break;
                        }
                    }
                } catch (e) {
                    // Not a valid JSON, continue to next key
                    continue;
                }
            }
            
            if (orders.length === 0) {
                console.log('❌ No orders found in localStorage');
                console.log('💡 Try checking if orders are stored in IndexedDB or a backend database');
                return;
            }
            
            console.log(`✅ Found ${orders.length} orders in key: ${foundKey}`);
            
            // Filter for delivered orders
            const deliveredOrders = orders.filter(order => 
                order.status && order.status.toLowerCase() === 'delivered'
            );
            
            console.log(`📦 Total orders: ${orders.length}`);
            console.log(`🚚 Delivered orders: ${deliveredOrders.length}`);
            
            if (deliveredOrders.length === 0) {
                console.log('⚠️  No delivered orders found');
                console.log('💡 Check if orders have different status values like "completed" or "fulfilled"');
                // Show all status values
                const statusDistribution = {};
                orders.forEach(order => {
                    const status = order.status || 'unknown';
                    statusDistribution[status] = (statusDistribution[status] || 0) + 1;
                });
                console.log('📊 All order statuses:', statusDistribution);
                return;
            }
            
            // Analyze delivered orders
            console.log('\n=== Delivered Order Analysis ===');
            let totalRevenue = 0;
            let zeroAmountOrders = 0;
            
            deliveredOrders.forEach((order, index) => {
                const amount = getOrderAmount(order);
                const orderId = order._id || order.id || order.order_id || `Order ${index + 1}`;
                
                console.log(`\n📦 Order ${index + 1}: ${orderId}`);
                console.log(`   Status: ${order.status}`);
                console.log(`   Amount: TZS ${amount.toLocaleString()}`);
                
                // Show all amount-related fields
                const amountFields = {};
                Object.keys(order).forEach(key => {
                    if (key.toLowerCase().includes('amount') || 
                        key.toLowerCase().includes('total') || 
                        key.toLowerCase().includes('price')) {
                        amountFields[key] = order[key];
                    }
                });
                
                if (Object.keys(amountFields).length > 0) {
                    console.log(`   Amount fields:`, amountFields);
                }
                
                totalRevenue += amount;
                
                if (amount === 0) {
                    zeroAmountOrders++;
                    console.log(`   ⚠️  Zero amount order`);
                }
            });
            
            console.log('\n=== Revenue Summary ===');
            console.log(`💰 Total Revenue (delivered orders): TZS ${totalRevenue.toLocaleString()}`);
            console.log(`📊 Zero amount delivered orders: ${zeroAmountOrders}`);
            console.log(`📊 Non-zero amount delivered orders: ${deliveredOrders.length - zeroAmountOrders}`);
            
            // Show order status distribution
            const statusDistribution = {};
            orders.forEach(order => {
                const status = order.status || 'unknown';
                statusDistribution[status] = (statusDistribution[status] || 0) + 1;
            });
            
            console.log('\n=== Order Status Distribution ===');
            Object.entries(statusDistribution).forEach(([status, count]) => {
                console.log(`   ${status}: ${count} orders`);
            });
            
            // If total revenue is 0, show detailed analysis
            if (totalRevenue === 0) {
                console.log('\n🚨 ALERT: Total revenue is 0!');
                console.log('Possible causes:');
                console.log('1. All delivered orders have zero amounts');
                console.log('2. Amount fields are stored with different names');
                console.log('3. Amount fields contain non-numeric values');
                console.log('4. Orders are missing amount fields entirely');
                console.log('\n💡 Suggested fixes:');
                console.log('- Check if delivered orders should have a different status (e.g., "completed")');
                console.log('- Verify that order amounts are being stored correctly during checkout');
                console.log('- Ensure that the admin dashboard is looking for the correct status values');
            } else {
                console.log('\n✅ Revenue calculation appears to be working correctly!');
                console.log('💡 If the admin dashboard still shows "TZS 0", check that it is using the same status filter');
            }
            
        } catch (error) {
            console.error('❌ Error analyzing orders:', error);
        }
    }
    
    // Run the analysis
    analyzeOrders();
    
    console.log('\n=== Debug Complete ===');
    console.log('💡 Tip: Copy and paste this entire output when reporting issues to your developer');
    
    // Return the function for manual execution if needed
    return {
        analyzeOrders: analyzeOrders,
        getOrderAmount: getOrderAmount
    };
})();

console.log('🔧 To run the analysis again, type: analyzeOrders()');