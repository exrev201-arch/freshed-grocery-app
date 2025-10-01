import React from 'react';
import { table } from '@/lib/backend-service';
import { Button } from '@/components/ui/button';

const MarkOrderAsDelivered: React.FC = () => {
  const markRandomOrderAsDelivered = async () => {
    try {
      // Get all orders
      const ordersResponse = await table.getItems('orders', { limit: 100 });
      const orders = ordersResponse.items;
      
      if (orders.length === 0) {
        alert('No orders found');
        return;
      }
      
      // Find a non-delivered order
      const nonDeliveredOrders = orders.filter((order: any) => order.status !== 'delivered');
      
      if (nonDeliveredOrders.length === 0) {
        alert('All orders are already marked as delivered');
        return;
      }
      
      // Pick a random non-delivered order
      const randomOrder = nonDeliveredOrders[Math.floor(Math.random() * nonDeliveredOrders.length)];
      
      // Update its status to delivered
      await table.updateItem('orders', {
        _uid: randomOrder._uid,
        _id: randomOrder._id,
        status: 'delivered',
        updated_at: Date.now()
      });
      
      alert(`Order ${randomOrder._id} marked as delivered!`);
      console.log('Order marked as delivered:', randomOrder);
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      alert('Error marking order as delivered');
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <h3 className="text-lg font-bold mb-2">Test Revenue Calculation</h3>
      <p className="mb-2">Click the button below to mark a random order as delivered for testing purposes.</p>
      <Button onClick={markRandomOrderAsDelivered} variant="outline">
        Mark Random Order as Delivered
      </Button>
    </div>
  );
};

export default MarkOrderAsDelivered;