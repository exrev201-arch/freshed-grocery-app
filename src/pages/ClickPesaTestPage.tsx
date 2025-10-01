import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { clickPesaService } from '@/lib/clickpesa-service';
import ClickPesaDiagnostics from '@/components/debug/ClickPesaDiagnostics';

const ClickPesaTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testData, setTestData] = useState({
    orderId: '',
    amount: '',
    phone: '+255712345678',
    method: 'airtel_money',
    name: 'Test User',
    email: 'test@example.com',
  });

  const handleInputChange = (field: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const runTestPayment = async () => {
    if (!testData.orderId || !testData.amount || !testData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // First, let's create a mock order for testing
      const mockOrder = {
        _id: testData.orderId || `test_order_${Date.now()}`,
        orderNumber: `TEST${Date.now()}`,
        userId: 'test_user',
        total_amount: parseInt(testData.amount) || 1000,
      };

      // Mock the table service to return our test order
      const originalGetItems = (window as any).table?.getItems;
      if (originalGetItems) {
        (window as any).table.getItems = async (tableId: string, options: any) => {
          if (tableId === 'orders' && options.query?._id === mockOrder._id) {
            return {
              items: [mockOrder],
              total: 1,
              hasMore: false
            };
          }
          return await originalGetItems(tableId, options);
        };
      }

      // Run the payment initiation
      const paymentRequest = {
        orderId: mockOrder._id,
        amount: parseInt(testData.amount),
        currency: 'TZS' as const,
        method: testData.method as any,
        customerInfo: {
          name: testData.name,
          email: testData.email,
          phone: testData.phone,
        },
      };

      console.log('🔍 Initiating test payment with request:', paymentRequest);
      const response = await clickPesaService.initiatePayment(paymentRequest);
      console.log('✅ Test payment response:', response);

      toast({
        title: "Test Payment Initiated",
        description: `Payment reference: ${response.paymentReference || 'N/A'}`,
      });

      // Restore original getItems method
      if (originalGetItems) {
        (window as any).table.getItems = originalGetItems;
      }
    } catch (error: any) {
      console.error('❌ Test payment failed:', error);
      
      toast({
        title: "Test Payment Failed",
        description: error.message || 'Failed to initiate test payment',
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">ClickPesa Integration Test</h1>
          <Button onClick={() => navigate(-1)} variant="outline">
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Test Payment Initiation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID *</Label>
                <Input
                  id="orderId"
                  value={testData.orderId}
                  onChange={(e) => handleInputChange('orderId', e.target.value)}
                  placeholder="Enter order ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (TZS) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={testData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={testData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+255712345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={testData.method} onValueChange={(value) => handleInputChange('method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airtel_money">Airtel Money</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="tigo_pesa">Tigo Pesa</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  value={testData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Customer Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={testData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter customer email"
                />
              </div>

              <Button 
                onClick={runTestPayment} 
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Initiating Payment...
                  </>
                ) : (
                  'Initiate Test Payment'
                )}
              </Button>

              <div className="text-sm text-gray-500 mt-4">
                <p><strong>Important:</strong> This is a test tool for debugging ClickPesa integration.</p>
                <p>For actual payments, use the regular checkout flow.</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <ClickPesaDiagnostics />
            
            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">If USSD prompts aren't received:</h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    <li>Verify phone number format (+255XXXXXXXXX)</li>
                    <li>Check network connectivity</li>
                    <li>Wait up to 2 minutes for delivery</li>
                    <li>Try a different phone number</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">If service appears unhealthy:</h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    <li>Check ClickPesa dashboard for outages</li>
                    <li>Verify API credentials in .env file</li>
                    <li>Test with different network connection</li>
                    <li>Contact ClickPesa support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClickPesaTestPage;