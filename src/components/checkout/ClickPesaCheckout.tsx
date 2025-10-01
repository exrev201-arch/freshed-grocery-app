/**
 * ClickPesa Checkout Component for Fresh Grocery Tanzania
 * 
 * Provides a comprehensive checkout experience with ClickPesa integration
 * supporting M-Pesa, Airtel Money, Tigo Pesa, and card payments
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Smartphone,
  Wallet,
  ShoppingCart,
  MapPin,
  Clock,
  User,
  CheckCircle,
  Loader2,
  ArrowRight,
  Shield,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { clickPesaService } from '@/lib/clickpesa-service';
import axios from 'axios';
import { databaseService } from '@/lib/database-service';
import { table } from '@/lib/backend-service';
import type { PaymentMethod, PaymentInitiationResponse } from '@/lib/clickpesa-service';
import type { Order } from '@/types/database';
import { useLanguage } from '@/contexts/LanguageContext';

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface DeliveryInfo {
  address: string;
  ward: string;
  district: string;
  region: string;
  phone: string;
  instructions?: string;
  deliveryDate: string;
  timeSlot: string;
}

interface PaymentInfo {
  method: PaymentMethod;
  phoneNumber?: string;
  email?: string;
}

// Add type for backend service order
type BackendOrder = {
  _id: string;
  orderNumber: string;
  // ... other order properties
} & Record<string, any>;

const ClickPesaCheckout: React.FC = () => {
  const { toast } = useToast();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Component state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [checkoutProgress, setCheckoutProgress] = useState(0);

  // Form data
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    address: '',
    ward: '',
    district: 'Kinondoni',
    region: 'Dar es Salaam',
    phone: '',
    deliveryDate: '',
    timeSlot: '',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'tigo_pesa', // Default to your most active payment method
  });

  // Order and payment state
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<PaymentInitiationResponse | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);

  // Checkout steps
  const steps: CheckoutStep[] = [
    {
      id: 1,
      title: t('deliveryDetails'),
      description: t('enterDeliveryInformation'),
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: t('paymentMethod'),
      description: t('choosePaymentMethod'),
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: t('reviewConfirm'),
      description: t('reviewOrderBeforePayment'),
      completed: currentStep > 3,
    },
    {
      id: 4,
      title: t('payment'),
      description: t('completePayment'),
      completed: false,
    },
  ];

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 50000 ? 0 : 3000; // Free delivery over 50,000 TZS
  const taxRate = 0.18; // 18% VAT in Tanzania
  const taxAmount = Math.round(subtotal * taxRate);
  const finalTotal = subtotal + deliveryFee + taxAmount;

  // Time slots for delivery
  const timeSlots = [
    t('timeSlot1'),
    t('timeSlot2'),
    t('timeSlot3'),
  ];

  // Payment methods ordered by your ClickPesa account availability
  const paymentMethods = [
    {
      id: 'tigo_pesa' as PaymentMethod,
      name: t('tigoPesa'),
      description: t('payWithTigoPesa'),
      icon: Smartphone,
      popular: true,
      fee: t('noAdditionalFees'),
      status: 'active',
    },
    {
      id: 'airtel_money' as PaymentMethod,
      name: t('airtelMoney'),
      description: t('payWithAirtelMoney'),
      icon: Wallet,
      popular: true,
      fee: t('noAdditionalFees'),
      status: 'active',
    },
    {
      id: 'mpesa' as PaymentMethod,
      name: t('mpesa'),
      description: t('payWithMpesa'),
      icon: Smartphone,
      popular: false,
      fee: t('contactSupportToActivate'),
      status: 'contact_required',
    },
    {
      id: 'card' as PaymentMethod,
      name: t('creditDebitCard'),
      description: t('visaMastercard'),
      icon: CreditCard,
      popular: false,
      fee: t('completeKycToEnable'),
      status: 'kyc_required',
    },
    {
      id: 'cash_on_delivery' as PaymentMethod,
      name: t('cashOnDelivery'),
      description: t('payWhenReceiveOrder'),
      icon: User,
      popular: false,
      fee: t('deliveryFeeTzs'),
      status: 'active',
    },
  ];

  useEffect(() => {
    const progress = (currentStep - 1) * 25;
    setCheckoutProgress(progress);
  }, [currentStep]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(deliveryInfo.address && deliveryInfo.ward && deliveryInfo.phone && 
                 deliveryInfo.deliveryDate && deliveryInfo.timeSlot);
      case 2:
        return !!(paymentInfo.method);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast({
        title: t('missingInformation'),
        description: t('pleaseFillRequiredFields'),
        variant: 'destructive',
      });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const createOrder = async (): Promise<any> => {
    console.log('🔍 Creating order with user data:', user);
    console.log('🔍 Delivery info:', deliveryInfo);
    console.log('🔍 Cart items:', items);
    
    // Handle both user object structures (auth store vs backend service)
    const userId = user?.uid || (user && (user as any)._uid) || 'guest';
    
    // Use the backend service (table) instead of databaseService to ensure consistency
    const orderData = {
      orderNumber: `FG${Date.now()}`,
      userId: userId,
      subtotal,
      taxAmount,
      shippingAmount: deliveryFee,
      discountAmount: 0,
      totalAmount: finalTotal,
      currency: 'TZS',
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'pending',
      customerInfo: {
        firstName: user?.name?.split(' ')[0] || 'Guest',
        lastName: user?.name?.split(' ').slice(1).join(' ') || 'Customer',
        email: user?.email || 'customer@freshgrocery.co.tz',
        phoneNumber: deliveryInfo.phone,
      },
      deliveryAddress: {
        street: deliveryInfo.address,
        ward: deliveryInfo.ward,
        district: deliveryInfo.district,
        region: deliveryInfo.region,
        country: 'Tanzania',
        instructions: deliveryInfo.instructions,
      },
      deliveryDate: deliveryInfo.deliveryDate, // Store as string
      deliveryTimeSlot: deliveryInfo.timeSlot,
      deliveryMethod: 'standard',
      paymentMethod: paymentInfo.method,
      source: 'web',
      // Pass the user ID to ensure it's preserved
      _uid: userId,
    };

    console.log('🔍 Order data to create:', orderData);

    // Use backend service instead of databaseService
    console.log('🔍 Creating order with data:', orderData);
    const order = await table.addItem('orders', orderData);
    console.log('✅ Order created:', order);
    
    // Verify the order was saved correctly
    const verifyResult = await table.getItems('orders', {
      query: { _id: order._id },
      limit: 1
    });
    console.log('🔍 Order verification result:', verifyResult);

    // Create order items using backend service
    for (const item of items) {
      const orderItemData = {
        orderId: order._id, // Use _id from backend service
        productId: item.id,
        productName: item.name,
        productSku: `SKU-${item.id}`,
        productImage: item.image,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        quantityFulfilled: 0,
        quantityRefunded: 0,
        // Pass the user ID to ensure it's preserved
        _uid: userId,
      };
      
      console.log('🔍 Creating order item:', orderItemData);
      await table.addItem('order_items', orderItemData);
    }

    console.log('✅ All order items created');
    return order;
  };

  const handleCompleteOrder = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setPaymentProcessing(true);

    try {
      // Create order
      const order = await createOrder();
      setCreatedOrder(order);

      // For cash on delivery, complete immediately
      if (paymentInfo.method === 'cash_on_delivery') {
        // Create a payment record for cash on delivery
        // Handle both user object structures (auth store vs backend service)
        const userId = user?.uid || (user && (user as any)?._uid) || 'guest';
        
        const paymentData = {
          orderId: order._id, // Use _id from backend service
          userId: userId,
          amount: finalTotal,
          currency: 'TZS',
          method: 'cash_on_delivery',
          provider: 'manual',
          status: 'pending', // Will be completed when delivered
          webhookReceived: false,
          metadata: {
            deliveryInfo,
            cartItems: items.length,
            paymentNote: t('paymentToBeCollectedOnDelivery'),
          },
          // Pass the user ID to ensure it's preserved
          _uid: userId,
        };

        // Use backend service instead of databaseService
        await table.addItem('payments', paymentData);

        toast({
          title: t('orderPlacedSuccessfully'),
          description: t('yourOrderHasBeenPlaced'),
        });
        clearCart();
        
        // Redirect to order confirmation after 2 seconds
        setTimeout(() => {
          navigate(`/order-confirmation/${order._id}`); // Use _id from backend service
        }, 2000);
        return;
      }

      // For other payment methods, initiate ClickPesa payment
      const paymentRequest = {
        orderId: order._id, // Use _id from backend service
        amount: finalTotal,
        currency: 'TZS' as const,
        method: paymentInfo.method,
        customerInfo: {
          name: user?.name || '',
          email: user?.email || '',
          phone: deliveryInfo.phone,
        },
      };

      // Initiate payment through ClickPesa service
      console.log('🔍 Initiating ClickPesa payment with request:', paymentRequest);
      const paymentResponse = await clickPesaService.initiatePayment(paymentRequest);
      console.log('✅ ClickPesa payment response:', paymentResponse);
      setPaymentResponse(paymentResponse);

      // Show success message
      toast({
        title: t('orderPlacedSuccessfully'),
        description: t('yourOrderHasBeenPlaced'),
      });

      // For Mobile Money payments, show payment dialog
      if (['mpesa', 'airtel_money', 'tigo_pesa'].includes(paymentInfo.method)) {
        setPaymentDialog(true);
      } 
      // For card payments or other methods, redirect to checkout URL
      else if (paymentResponse.checkoutUrl) {
        // Open ClickPesa checkout in new tab
        window.open(paymentResponse.checkoutUrl, '_blank');
        
        // Show success message
        toast({
          title: t('redirectedToPayment'),
          description: t('completePaymentInNewTab'),
        });

        // Clear cart after successful initiation
        clearCart();
        
        // Redirect to order confirmation after 3 seconds
        setTimeout(() => {
          if (createdOrder) {
            navigate(`/order-confirmation/${order._id}`);
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error('Order creation failed:', error);
      
      // Provide more specific error messages
      let errorMessage = t('failedToCreateOrder');
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('orderFailed'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
    }
  };

  const handlePaymentComplete = () => {
    // For Mobile Money payments, just show instructions
    toast({
      title: t('paymentInitiated'),
      description: t('checkYourPhoneForPaymentPrompt'),
    });

    // Clear cart after successful initiation
    clearCart();
    
    // Close payment dialog
    setPaymentDialog(false);
    
    // Redirect to order confirmation after 2 seconds
    setTimeout(() => {
      if (createdOrder) {
        // Handle both backend service (_id) and database types (id) formats
        const orderId = createdOrder._id || createdOrder.id;
        navigate(`/order-confirmation/${orderId}`);
      }
    }, 2000);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : step.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.completed ? <CheckCircle className="h-5 w-5" /> : step.id}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <Progress value={checkoutProgress} className="h-2" />
    </div>
  );

  const renderDeliveryStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t('deliveryInformation')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address">{t('streetAddress')} *</Label>
            <Textarea
              id="address"
              placeholder={t('enterFullAddress')}
              value={deliveryInfo.address}
              onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="ward">{t('ward')} *</Label>
            <Input
              id="ward"
              placeholder={t('e.g., Mikocheni, Masaki')}
              value={deliveryInfo.ward}
              onChange={(e) => setDeliveryInfo(prev => ({ ...prev, ward: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="district">{t('district')}</Label>
            <Input
              id="district"
              value={deliveryInfo.district}
              onChange={(e) => setDeliveryInfo(prev => ({ ...prev, district: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="phone">{t('phoneNumber')} *</Label>
            <Input
              id="phone"
              placeholder={t('phoneNumberPlaceholderSw')}
              value={deliveryInfo.phone}
              onChange={(e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deliveryDate">{t('deliveryDate')} *</Label>
            <Input
              id="deliveryDate"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={deliveryInfo.deliveryDate}
              onChange={(e) => setDeliveryInfo(prev => ({ ...prev, deliveryDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>{t('timeSlot')} *</Label>
            <RadioGroup
              value={deliveryInfo.timeSlot}
              onValueChange={(value) => setDeliveryInfo(prev => ({ ...prev, timeSlot: value }))}
            >
              {timeSlots.map((slot) => (
                <div key={slot} className="flex items-center space-x-2">
                  <RadioGroupItem value={slot} id={slot} />
                  <Label htmlFor={slot} className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {slot}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label htmlFor="instructions">{t('deliveryInstructions')} ({t('optional')})</Label>
          <Textarea
            id="instructions"
            placeholder={t('specialInstructionsForDelivery')}
            value={deliveryInfo.instructions}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, instructions: e.target.value }))}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('paymentMethod')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentInfo.method}
          onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, method: value as PaymentMethod }))}
        >
          <div className="grid grid-cols-1 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isDisabled = method.status !== 'active';
              return (
                <div key={method.id} className="relative">
                  <RadioGroupItem 
                    value={method.id} 
                    id={method.id} 
                    className="peer sr-only" 
                    disabled={isDisabled}
                  />
                  <Label
                    htmlFor={method.id}
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      isDisabled 
                        ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50' 
                        : 'peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isDisabled ? 'text-gray-400' : 'text-primary'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isDisabled ? 'text-gray-500' : ''}`}>
                          {method.name}
                        </span>
                        {method.popular && method.status === 'active' && (
                          <Badge variant="secondary" className="text-xs">{t('popular')}</Badge>
                        )}
                        {method.status === 'contact_required' && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                            {t('contactRequired')}
                          </Badge>
                        )}
                        {method.status === 'kyc_required' && (
                          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                            {t('kycRequired')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <p className={`text-xs ${
                        method.status === 'active' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {method.fee}
                      </p>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {(paymentInfo.method === 'mpesa' || paymentInfo.method === 'airtel_money' || paymentInfo.method === 'tigo_pesa') && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t('youWillBeRedirectedTo')} {paymentMethods.find(m => m.id === paymentInfo.method)?.name} {t('toCompletePayment')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('orderSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{t('qty')}: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">TZS {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <span>TZS {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('vat')} (18%)</span>
              <span>TZS {taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('deliveryFee')}</span>
              <span>{deliveryFee === 0 ? t('free') : `TZS ${deliveryFee.toLocaleString()}`}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t('total')}</span>
              <span>TZS {finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t('deliveryDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>{t('address')}:</strong> {deliveryInfo.address}, {deliveryInfo.ward}</p>
            <p><strong>{t('phone')}:</strong> {deliveryInfo.phone}</p>
            <p><strong>{t('dateAndTime')}:</strong> {deliveryInfo.deliveryDate} - {deliveryInfo.timeSlot}</p>
            {deliveryInfo.instructions && (
              <p><strong>{t('instructions')}:</strong> {deliveryInfo.instructions}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>{t('paymentMethod')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {(() => {
              const method = paymentMethods.find(m => m.id === paymentInfo.method);
              const Icon = method?.icon || CreditCard;
              return (
                <>
                  <Icon className="h-6 w-6" />
                  <span className="font-medium">{method?.name}</span>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('checkout')}</h1>
        <p className="text-muted-foreground">{t('completeYourOrderSecurely')}</p>
      </div>

      {renderStepIndicator()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentStep === 1 && renderDeliveryStep()}
          {currentStep === 2 && renderPaymentStep()}
          {currentStep === 3 && renderReviewStep()}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>{t('orderTotal')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('items')} ({items.length})</span>
                  <span>TZS {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('vat')}</span>
                  <span>TZS {taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('delivery')}</span>
                  <span>{deliveryFee === 0 ? t('free') : `TZS ${deliveryFee.toLocaleString()}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('total')}</span>
                  <span>TZS {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {currentStep < 3 && (
                  <>
                    {currentStep > 1 && (
                      <Button
                        variant="outline"
                        onClick={handlePrevStep}
                        className="w-full"
                        disabled={loading}
                      >
                        {t('previous')}
                      </Button>
                    )}
                    <Button
                      onClick={handleNextStep}
                      className="w-full"
                      disabled={loading || !validateStep(currentStep)}
                    >
                      {t('continue')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}

                {currentStep === 3 && (
                  <Button
                    onClick={handleCompleteOrder}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading || paymentProcessing}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('processing')}
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        {t('placeOrder')}
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="mt-4 text-xs text-muted-foreground text-center">
                <Shield className="inline h-3 w-3 mr-1" />
                {t('securedByClickPesa')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{t('completePayment')}</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">{t('paymentInitiated')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('orderNumber')} #{createdOrder?.orderNumber}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">{t('paymentAmount')}</p>
              <p className="text-2xl font-bold text-green-600">
                TZS {finalTotal.toLocaleString()}
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t('checkYourPhoneForPaymentPrompt')}
              </AlertDescription>
            </Alert>

            <Button
              onClick={handlePaymentComplete}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {t('continueToOrderConfirmation')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-xs text-muted-foreground">
              {t('youWillReceiveUSSDPrompt')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClickPesaCheckout;