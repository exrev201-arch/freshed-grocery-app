import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { clickPesaService } from '@/lib/clickpesa-service';
import { useToast } from '@/hooks/use-toast';

const ClickPesaDiagnostics: React.FC = () => {
  const { toast } = useToast();
  const [healthStatus, setHealthStatus] = useState<{ status: string; message: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const checkServiceHealth = async () => {
    setIsChecking(true);
    setHealthStatus(null);
    setDiagnostics(null);
    
    try {
      const status = await clickPesaService.healthCheck();
      setHealthStatus(status);
      
      // Also get payment stats for additional diagnostics
      const stats = await clickPesaService.getPaymentStats();
      setDiagnostics(stats);
      
      toast({
        title: "Diagnostics Complete",
        description: "ClickPesa service health check completed successfully",
      });
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Diagnostics Failed",
        description: "Failed to check ClickPesa service health",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          ClickPesa Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Button 
            onClick={checkServiceHealth} 
            disabled={isChecking}
            className="w-full sm:w-auto"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Service Health...
              </>
            ) : (
              'Check ClickPesa Service Health'
            )}
          </Button>
        </div>

        {healthStatus && (
          <Alert variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}>
            <div className="flex items-start gap-3">
              {healthStatus.status === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div>
                <div className="font-medium">
                  Service Status: {healthStatus.status === 'healthy' ? 'Operational' : 'Issues Detected'}
                </div>
                <AlertDescription>
                  {healthStatus.message}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {diagnostics && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{diagnostics.total}</div>
                  <div className="text-sm text-gray-500">Total Payments</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{diagnostics.successful}</div>
                  <div className="text-sm text-gray-500">Successful</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{diagnostics.pending}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{diagnostics.failed}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
              </div>
              
              {diagnostics.byMethod && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">By Payment Method:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>M-Pesa:</span>
                      <span>{diagnostics.byMethod.mpesa || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Airtel Money:</span>
                      <span>{diagnostics.byMethod.airtel || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tigo Pesa:</span>
                      <span>{diagnostics.byMethod.tigo || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Card:</span>
                      <span>{diagnostics.byMethod.card || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-gray-500 space-y-2">
          <p><strong>Diagnostic Information:</strong></p>
          <p>• This tool checks ClickPesa's API connectivity and service status</p>
          <p>• Payment statistics show historical transaction data</p>
          <p>• If issues are detected, contact ClickPesa support</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClickPesaDiagnostics;