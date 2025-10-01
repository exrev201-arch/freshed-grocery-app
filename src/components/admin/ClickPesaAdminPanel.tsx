import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const ClickPesaAdminPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>ClickPesa Integration Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Diagnostic and testing tools for ClickPesa payment integration.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Service Diagnostics</h3>
              <p className="text-sm text-gray-600 mb-3">
                Check ClickPesa service health and view payment statistics.
              </p>
              <Button 
                onClick={() => navigate('/clickpesa-test')}
                variant="outline"
                size="sm"
              >
                Run Diagnostics
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Test Payment</h3>
              <p className="text-sm text-gray-600 mb-3">
                Manually initiate test payments to verify integration.
              </p>
              <Button 
                onClick={() => navigate('/clickpesa-test')}
                variant="outline"
                size="sm"
              >
                Test Payment
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">External Resources</h4>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between"
              onClick={() => window.open('https://dashboard.clickpesa.com', '_blank')}
            >
              ClickPesa Merchant Dashboard
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between"
              onClick={() => window.open('https://dev.to/clickpesa', '_blank')}
            >
              ClickPesa Developer Documentation
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClickPesaAdminPanel;