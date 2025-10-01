import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { OrderService } from '@/lib/order-service';
import { debugOrdersTable, debugOrderQuery, debugCreateTestOrder } from '@/lib/debug-orders';

const OrderDebugComponent: React.FC = () => {
  const { user } = useAuthStore();
  const [userId, setUserId] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      setUserId(user.uid);
    }
  }, [user]);

  const handleDebugTable = () => {
    debugOrdersTable();
  };

  const handleQueryOrders = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      await debugOrderQuery(userId);
      
      // Also try the actual OrderService method
      console.log('🔍 Testing OrderService.getUserOrders...');
      const userOrders = await OrderService.getUserOrders(userId);
      console.log('✅ OrderService.getUserOrders result:', userOrders);
      setOrders(userOrders);
    } catch (error) {
      console.error('❌ Error querying orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestOrder = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      await debugCreateTestOrder(userId);
      await handleQueryOrders(); // Refresh the order list
    } catch (error) {
      console.error('❌ Error creating test order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Order Debugging Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={handleQueryOrders} disabled={loading || !userId}>
                  {loading ? 'Querying...' : 'Query Orders'}
                </Button>
                <Button onClick={handleCreateTestOrder} disabled={loading || !userId} variant="secondary">
                  Create Test Order
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Button onClick={handleDebugTable} variant="outline">
                Debug Orders Table (Console)
              </Button>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Instructions:</h3>
                <ul className="text-sm space-y-1">
                  <li>1. Check the browser console (F12) for detailed logs</li>
                  <li>2. Enter your user ID and click "Query Orders"</li>
                  <li>3. Use "Debug Orders Table" to see raw localStorage contents</li>
                  <li>4. Use "Create Test Order" to create a test order for debugging</li>
                </ul>
              </div>
            </div>

            {orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Retrieved Orders ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order._id} className="border p-3 rounded">
                        <div className="font-medium">Order #{order.orderNumber}</div>
                        <div className="text-sm text-gray-600">
                          Status: {order.status} | Total: TZS {order.total_amount?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {order._id} | User ID: {order.userId}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDebugComponent;