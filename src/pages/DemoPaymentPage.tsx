/**
 * Demo Payment Page - Simulates ClickPesa Payment Experience
 * 
 * This page simulates the ClickPesa payment process for demo purposes.
 * In production, this would be replaced by actual ClickPesa payment pages.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Smartphone,
  CreditCard,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Shield,
  ArrowLeft,
  Clock,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { databaseService } from '@/lib/database-service';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  fee: string;
  processingTime: string;
}

const DemoPaymentPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  
  // Get URL parameters
  const orderId = searchParams.get('orderId');
  const amount = parseInt(searchParams.get('amount') || '0');
  const paymentRef = searchParams.get('paymentRef');
  
  // Component state
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Select Method, 2: Enter Details, 3: Processing, 4: Success
  
  // Demo payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay with Vodacom M-Pesa',
      icon: Smartphone,
      fee: t('noExtraFees'),
      processingTime: t('oneToTwoMinutes')
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      description: 'Pay with Airtel Money',
      icon: Wallet,
      fee: t('noExtraFees'),
      processingTime: t('oneToTwoMinutes')
    },
    {
      id: 'tigo_pesa',
      name: 'Tigo Pesa',
      description: 'Pay with Tigo Pesa',
      icon: Smartphone,
      fee: t('noExtraFees'),
      processingTime: t('oneToTwoMinutes')
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard',
      icon: CreditCard,
      fee: t('cardFee'),
      processingTime: t('instant')
    }
  ];

  // Check if required parameters are present
  useEffect(() => {
    if (!orderId || !amount || !paymentRef) {
      toast({
        title: t('invalidPaymentLink'),
        description: t('requiredPaymentParametersMissing'),
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [orderId, amount, paymentRef, navigate, toast, t]);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleContinue = () => {
    if (paymentStep === 1) {
      setPaymentStep(2);
    } else if (paymentStep === 2) {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    if (selectedMethod !== 'card' && !phoneNumber) {
      toast({
        title: t('phoneNumberRequired'),
        description: t('enterPhoneNumberToContinue'),
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    setPaymentStep(3);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update payment status in database
      const payments = await databaseService.findMany('payments', {
        filters: { orderId }
      });

      if (payments.items.length > 0) {
        const payment = payments.items[0];
        await databaseService.update('payments', payment.id, {
          status: 'completed',
          processedAt: new Date(),
          webhookReceived: true,
          webhookData: {
            status: 'SUCCESS',
            paymentReference: paymentRef,
            collectedAmount: amount.toString(),
            collectedCurrency: 'TZS',
            message: t('paymentReceivedDemo'),
            method: selectedMethod,
            phoneNumber: phoneNumber,
            demoMode: true
          }
        } as any);

        // Update order status
        await databaseService.update('orders', orderId!, {
          status: 'confirmed',
          paymentStatus: 'completed'
        } as any);
      }

      setPaymentStep(4);
      
      toast({
        title: t('paymentSuccessful'),
        description: t('paymentProcessedSuccessfully'),
      });

    } catch (error) {
      console.error('Demo payment processing error:', error);
      toast({
        title: t('paymentFailed'),
        description: t('somethingWentWrong'),
        variant: 'destructive',
      });
      setPaymentStep(2);
    } finally {
      setProcessing(false);
    }
  };

  const handleBackToOrder = () => {
    navigate(`/order-confirmation/${orderId}`);
  };

  if (!orderId || !amount) {
    return null;
  }

  const selectedMethodInfo = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold">ClickPesa</h1>
              <p className="text-sm text-muted-foreground">{t('securePayment')}</p>
            </div>
          </div>
          
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>{t('demoMode')}:</strong> {t('simulatedPaymentExperience')}
            </AlertDescription>
          </Alert>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {t('completePayment')}
            </CardTitle>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                TZS {amount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('order')} #{paymentRef}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentStep === 1 && (
              <>
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    {t('selectPaymentMethod')}
                  </Label>
                  <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <Label htmlFor={method.id} className="cursor-pointer">
                                <div className="font-medium">{method.name}</div>
                                <div className="text-sm text-muted-foreground">{method.description}</div>
                              </Label>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-green-600">{method.fee}</div>
                              <div className="text-xs text-muted-foreground">{method.processingTime}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </div>

                <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-700">
                  {t('continueWith')} {selectedMethodInfo?.name}
                </Button>
              </>
            )}

            {paymentStep === 2 && (
              <>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {selectedMethodInfo?.icon && <selectedMethodInfo.icon className="h-6 w-6 mr-2" />}
                    <span className="font-medium">{selectedMethodInfo?.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('fee')}: {selectedMethodInfo?.fee}
                  </div>
                </div>

                {selectedMethod !== 'card' && (
                  <div>
                    <Label htmlFor="phone" className="text-base font-medium">
                      {t('phoneNumber')}
                    </Label>
                    <div className="flex mt-2">
                      <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                        <Phone className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">+255</span>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t('phoneNumberPlaceholder')}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="rounded-l-none"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('enterYour')} {selectedMethodInfo?.name} {t('number')}
                    </p>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription>
                      {t('cardPaymentDemo')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setPaymentStep(1)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('back')}
                  </Button>
                  <Button onClick={handleContinue} className="flex-1 bg-green-600 hover:bg-green-700">
                    {t('pay')} TZS {amount.toLocaleString()}
                  </Button>
                </div>
              </>
            )}

            {paymentStep === 3 && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">{t('processingPayment')}...</h3>
                <p className="text-muted-foreground mb-4">
                  {t('pleaseWaitWhileWeProcess')} {selectedMethodInfo?.name} {t('payment')}.
                </p>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {t('estimatedTime')}: {selectedMethodInfo?.processingTime}
                </div>
              </div>
            )}

            {paymentStep === 4 && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t('paymentSuccessful')}!</h3>
                <p className="text-muted-foreground mb-6">
                  {t('yourPaymentOf')} TZS {amount.toLocaleString()} {t('hasBeenProcessedSuccessfully')}.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>{t('paymentReference')}:</span>
                      <span className="font-medium">{paymentRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('method')}:</span>
                      <span className="font-medium">{selectedMethodInfo?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('amount')}:</span>
                      <span className="font-medium">TZS {amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('status')}:</span>
                      <Badge variant="default" className="bg-green-600">{t('success')}</Badge>
                    </div>
                  </div>
                </div>

                <Button onClick={handleBackToOrder} className="w-full bg-green-600 hover:bg-green-700">
                  {t('backToOrderDetails')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <Shield className="h-3 w-3 mr-1" />
            {t('securedByClickPesa')} • {t('demoMode')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPaymentPage;