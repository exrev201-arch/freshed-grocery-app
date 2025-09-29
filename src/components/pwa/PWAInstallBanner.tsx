import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { useLanguage } from '@/contexts/LanguageContext';

interface PWAInstallBannerProps {
  onDismiss?: () => void;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onDismiss }) => {
  const { promptInstall, showInstallBanner, isInstallable } = usePWA();
  const { t } = useLanguage();

  if (!showInstallBanner || !isInstallable) {
    return null;
  }

  const handleInstall = () => {
    promptInstall();
    onDismiss?.();
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                {t('installFreshApp')}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {t('addToHomeScreen')}
              </p>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="text-xs h-8 px-3"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {t('install')}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDismiss}
                  className="text-xs h-8 px-2"
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

export default PWAInstallBanner;