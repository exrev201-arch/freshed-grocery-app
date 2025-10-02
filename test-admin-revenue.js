// Admin Revenue Calculation Test
// This script tests the revenue calculation logic used in the admin service

console.log('=== Admin Revenue Calculation Test ===');

// Test data based on the order examples you provided
const testOrders = [
    {
        _id: 'ff518c9f',
        status: 'delivered',
        total_amount: 8900,
        created_at: new Date('2025-10-01T13:14:31').getTime()
    },
    {
        _id: '04e1449c',
        status: 'delivered',
        total_amount: 7366,
        created_at: new Date('2025-09-30T17:35:46').getTime()
    },
    {
        _id: 'e9d583de',
        status: 'delivered',
        total_amount: 5124,
        created_at: new Date('2025-09-30T15:03:30').getTime()
    },
    {
        _id: 'e8a80c4e',
        status: 'delivered',
        total_amount: 5124,
        created_at: new Date('2025-09-29T18:15:12').getTime()
    },
    {
        _id: 'gj7gmskk',
        status: 'delivered',
        total_amount: 0,
        created_at: new Date('2025-10-02T12:56:10').getTime()
    },
    {
        _id: 'pfe1tsdg',
        status: 'delivered',
        total_amount: 0,
        created_at: new Date('2025-10-01T20:47:52').getTime()
    }
];

// Enhanced function to safely get order amount regardless of field name or data type
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

// Test the revenue calculation
console.log('🔍 Testing with sample orders...');

const completedOrders = testOrders.filter(order => ['delivered'].includes(order.status));

let totalRevenue = 0;
console.log('\n=== Order Analysis ===');
completedOrders.forEach((order, index) => {
    const amount = getOrderAmount(order);
    console.log(`Order ${index + 1} (${order._id}): status=${order.status}, amount=${amount}`);
    totalRevenue += amount;
});

console.log(`\n💰 Total Revenue: TZS ${totalRevenue.toLocaleString()}`);

// Test with different field names
console.log('\n=== Testing with different field names ===');
const testOrdersWithDifferentFields = [
    {
        _id: 'test1',
        status: 'delivered',
        totalAmount: 5000
    },
    {
        _id: 'test2',
        status: 'delivered',
        amount: '3500' // String amount
    },
    {
        _id: 'test3',
        status: 'delivered',
        price: 2000
    }
];

const completedOrders2 = testOrdersWithDifferentFields.filter(order => ['delivered'].includes(order.status));
let totalRevenue2 = 0;
completedOrders2.forEach((order, index) => {
    const amount = getOrderAmount(order);
    console.log(`Order ${index + 1} (${order._id}): amount=${amount}`);
    totalRevenue2 += amount;
});

console.log(`\n💰 Total Revenue (different fields): TZS ${totalRevenue2.toLocaleString()}`);

console.log('\n=== Test Complete ===');
console.log('If your actual revenue is 0, the issue is likely that your delivered orders have zero amounts.');