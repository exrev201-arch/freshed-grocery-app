import React from 'react';
import { table } from '@/lib/backend-service';

const OrderDebugComponent: React.FC = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersResponse = await table.getItems('orders', { limit: 100 });
        console.log('🔍 Debug - All orders:', ordersResponse.items);
        setOrders(ordersResponse.items);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <div>Loading order data...</div>;
  }

  // Count orders by status
  const statusCounts: Record<string, number> = {};
  let totalRevenue = 0;
  orders.forEach(order => {
    const status = order.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    // Only count revenue from delivered orders
    if (status === 'delivered') {
      totalRevenue += order.total_amount || 0;
    }
  });

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-bold mb-2">Order Debug Information</h3>
      <p>Total orders: {orders.length}</p>
      <p className="font-bold">Total Revenue (from delivered orders only): TZS {totalRevenue.toLocaleString()}</p>
      <div className="mt-2">
        <h4 className="font-semibold">Order Status Distribution:</h4>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status}>
            {status}: {count} orders
          </div>
        ))}
      </div>
      <div className="mt-2">
        <h4 className="font-semibold">Sample Orders:</h4>
        {orders.slice(0, 3).map(order => (
          <div key={order._id} className="border p-2 mb-2">
            <p>ID: {order._id}</p>
            <p>Status: {order.status}</p>
            <p>Amount: TZS {(order.total_amount || 0).toLocaleString()}</p>
            <p>Created: {new Date(order.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDebugComponent;