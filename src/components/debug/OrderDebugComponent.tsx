import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { databaseService } from '@/lib/database-service';
import { table } from '@/lib/backend-service';
import { getAllOrders } from '@/lib/delivery-service';

const OrderDebugComponent: React.FC = () => {
  const [modernOrders, setModernOrders] = useState<any[]>([]);
  const [legacyOrders, setLegacyOrders] = useState<any[]>([]);
  const [combinedOrders, setCombinedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testOrderCreation = async () => {
    console.log('🧪 Testing order creation...');
    
    try {
      // Test creating a simple order
      const testOrderData = {
        orderNumber: `TEST${Date.now()}`,
        userId: 'test-user',
        subtotal: 10000,
        taxAmount: 1800,
        shippingAmount: 3000,
        discountAmount: 0,
        totalAmount: 14800,
        currency: 'TZS' as const,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        fulfillmentStatus: 'pending' as const,
        customerInfo: {
          firstName: 'Test',
          lastName: 'Customer',
          email: 'test@test.com',
          phoneNumber: '+255123456789',
        },
        deliveryAddress: {
          street: 'Test Street',
          ward: 'Test Ward',
          district: 'Test District',
          region: 'Test Region',
          country: 'Tanzania',
          instructions: 'Test instructions',
        },
        deliveryDate: new Date(),
        deliveryTimeSlot: '08:00 - 12:00',
        deliveryMethod: 'standard' as const,
        paymentMethod: 'cash_on_delivery' as const,
        source: 'web' as const,
      };
      
      console.log('Creating test order with data:', testOrderData);
      const testOrder = await databaseService.create('orders', testOrderData);
      console.log('✅ Test order created:', testOrder);
      
      // Immediately try to retrieve it
      const retrievedOrder = await databaseService.findById('orders', testOrder.id);
      console.log('✅ Test order retrieved:', retrievedOrder);
      
      // Test the findMany function
      const allOrders = await databaseService.findMany('orders', { limit: 10 });
      console.log('✅ All orders found:', allOrders);
      
      return testOrder;
    } catch (error) {
      console.error('❌ Test order creation failed:', error);
      throw error;
    }
  };

  const debugOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting order debug...');
      
      // Check modern database service
      console.log('📦 Checking modern database service...');
      const modernResult = await databaseService.findMany('orders', {
        limit: 100
      });
      console.log('Modern orders:', modernResult);
      setModernOrders(modernResult.items || []);
      
      // Check legacy table service
      console.log('🗃️ Checking legacy table service...');
      const legacyResult = await table.getItems('orders', {
        limit: 100
      });
      console.log('Legacy orders:', legacyResult);
      setLegacyOrders(legacyResult.items || []);
      
      // Check combined getAllOrders function
      console.log('🔗 Checking combined getAllOrders function...');
      const combinedResult = await getAllOrders();
      console.log('Combined orders:', combinedResult);
      setCombinedOrders(combinedResult || []);
      
    } catch (err: any) {
      console.error('❌ Debug error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorage = () => {
    console.log('💾 Checking localStorage...');
    
    // Check all localStorage keys that might contain orders
    const keys = Object.keys(localStorage);
    const orderKeys = keys.filter(key => 
      key.includes('order') || 
      key.includes('fresh_db') ||
      key.includes('payment')
    );
    
    console.log('Found order-related keys:', orderKeys);
    
    orderKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        console.log(`${key}:`, data);
      } catch (e) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    });
  };

  const runFullTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Running full order test...');
      
      // Test order creation
      await testOrderCreation();
      
      // Run normal debug
      await debugOrders();
      
    } catch (err: any) {
      console.error('❌ Full test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    debugOrders();
    checkLocalStorage();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Debug Information</CardTitle>
          <div className="flex gap-2">
            <Button onClick={debugOrders} disabled={loading}>
              {loading ? 'Debugging...' : 'Refresh Debug'}
            </Button>
            <Button onClick={runFullTest} disabled={loading} variant="outline">
              {loading ? 'Testing...' : 'Run Full Test'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Modern Database Service */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Modern Database Service Orders 
              <Badge variant="secondary" className="ml-2">
                {modernOrders.length} items
              </Badge>
            </h3>
            {modernOrders.length === 0 ? (
              <p className="text-gray-500">No orders found in modern database service</p>
            ) : (
              <div className="space-y-2">
                {modernOrders.map((order, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded border">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>ID:</strong> {order.id}</div>
                      <div><strong>Order Number:</strong> {order.orderNumber}</div>
                      <div><strong>Status:</strong> {order.status}</div>
                      <div><strong>Payment Method:</strong> {order.paymentMethod}</div>
                      <div><strong>Total:</strong> {order.totalAmount}</div>
                      <div><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600">Full Object</summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(order, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Legacy Table Service */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Legacy Table Service Orders 
              <Badge variant="secondary" className="ml-2">
                {legacyOrders.length} items
              </Badge>
            </h3>
            {legacyOrders.length === 0 ? (
              <p className="text-gray-500">No orders found in legacy table service</p>
            ) : (
              <div className="space-y-2">
                {legacyOrders.map((order, index) => (
                  <div key={index} className="p-3 bg-orange-50 rounded border">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>ID:</strong> {order._id}</div>
                      <div><strong>UID:</strong> {order._uid}</div>
                      <div><strong>Status:</strong> {order.status}</div>
                      <div><strong>Payment:</strong> {order.payment_method}</div>
                      <div><strong>Total:</strong> {order.total_amount}</div>
                      <div><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-orange-600">Full Object</summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(order, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Combined Orders */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Combined getAllOrders() Result 
              <Badge variant="secondary" className="ml-2">
                {combinedOrders.length} items
              </Badge>
            </h3>
            {combinedOrders.length === 0 ? (
              <p className="text-gray-500">No orders returned from getAllOrders()</p>
            ) : (
              <div className="space-y-2">
                {combinedOrders.map((order, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded border">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>ID:</strong> {order._id}</div>
                      <div><strong>UID:</strong> {order._uid}</div>
                      <div><strong>Status:</strong> {order.status}</div>
                      <div><strong>Payment:</strong> {order.payment_method}</div>
                      <div><strong>Total:</strong> {order.total_amount}</div>
                      <div><strong>Address:</strong> {order.delivery_address}</div>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-green-600">Full Object</summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(order, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Instructions */}
          <div className="p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Debug Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Check the browser console for detailed logs</li>
              <li>Try placing a new COD order and refresh this page</li>
              <li>Check if orders appear in any of the three sections above</li>
              <li>If modern orders exist but combined is empty, there's a conversion issue</li>
              <li>Use "Run Full Test" to create a test order and see if it appears</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDebugComponent;