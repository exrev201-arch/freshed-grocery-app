import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';

const PWAUpdateNotification: React.FC = () => {
  const { updateAvailable, reloadApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  const handleUpdate = () => {
    reloadApp();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1 text-blue-900">
                App Update Available
              </h3>
              <p className="text-xs text-blue-700 mb-3">
                A new version is ready. Restart to get the latest features and improvements.
              </p>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleUpdate}
                  className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Update
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDismiss}
                  className="text-xs h-8 px-2 text-blue-600 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAUpdateNotification;