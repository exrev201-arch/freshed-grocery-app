import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import { clickPesaService } from '@/lib/clickpesa-service';
import type { PaymentInitiationRequest } from '@/lib/clickpesa-service';
import { useLanguage } from '@/contexts/LanguageContext';

const ClickPesaTestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    checkoutUrl?: string;
  } | null>(null);
  const { t } = useLanguage();

  const runConnectionTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Test health check
      const health = await clickPesaService.healthCheck();
      console.log(t('clickPesaHealthCheck'), health);

      // Create a test payment request
      const testPaymentRequest: PaymentInitiationRequest = {
        orderId: `test-order-${Date.now()}`,
        amount: 1000, // 1000 TZS test amount
        currency: 'TZS',
        method: 'mpesa',
        customerInfo: {
          name: t('testCustomer'),
          email: 'test@example.com',
          phone: '+255123456789',
        },
        metadata: {
          testMode: true,
          description: t('clickPesaIntegrationTestPayment'),
        },
      };

      // Test payment initiation
      const result = await clickPesaService.initiatePayment(testPaymentRequest);
      
      setTestResult({
        success: true,
        message: t('clickPesaIntegrationTestSuccessful'),
        checkoutUrl: result.checkoutUrl,
      });

      console.log(`✅ ${t('clickPesaTestResult')}`, result);

    } catch (error) {
      console.error(`❌ ${t('clickPesaTestFailed')}`, error);
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : t('unknownErrorOccurred'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCheckoutUrl = () => {
    if (testResult?.checkoutUrl) {
      window.open(testResult.checkoutUrl, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('clickPesaIntegrationTest')}
        </CardTitle>
        <CardDescription>
          {t('testYourClickPesaCredentials')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="space-y-2">
          <h3 className="font-medium">{t('configurationStatus')}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-start">
              {t('apiKey')}: {import.meta.env.VITE_CLICKPESA_API_KEY ? `✅ ${t('set')}` : `❌ ${t('missing')}`}
            </Badge>
            <Badge variant="outline" className="justify-start">
              {t('merchantId')}: {import.meta.env.VITE_CLICKPESA_MERCHANT_ID ? `✅ ${t('set')}` : `❌ ${t('missing')}`}
            </Badge>
            <Badge variant="outline" className="justify-start">
              {t('payBill')}: {import.meta.env.VITE_CLICKPESA_PAY_BILL_NUMBER ? `✅ ${t('set')}` : `❌ ${t('missing')}`}
            </Badge>
            <Badge variant={import.meta.env.VITE_CLICKPESA_DEMO_MODE === 'true' ? 'secondary' : 'default'}>
              {t('mode')}: {import.meta.env.VITE_CLICKPESA_DEMO_MODE === 'true' ? t('demo') : t('production')}
            </Badge>
          </div>
        </div>

        {/* Test Button */}
        <Button 
          onClick={runConnectionTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              {t('testingClickPesaConnection')}
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4 mr-2" />
              {t('testClickPesaIntegration')}
            </>
          )}
        </Button>

        {/* Test Results */}
        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {testResult.success ? t('testSuccessful') : t('testFailed')}
                </p>
                <p className="text-sm mt-1">{testResult.message}</p>
                
                {testResult.success && testResult.checkoutUrl && (
                  <Button
                    onClick={openCheckoutUrl}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    {t('openTestPaymentPage')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>{t('toCompleteSetup')}:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>{t('updateYourEnvFile')}</li>
            <li>{t('setDemoModeToFalse')}</li>
            <li>{t('restartDevelopmentServer')}</li>
            <li>{t('clickTestClickPesaIntegration')}</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClickPesaTestComponent;