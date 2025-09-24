import React from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';

const OfflineIndicator: React.FC = () => {
  const { isOffline } = usePWA();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Badge variant="destructive" className="shadow-lg animate-pulse">
        <WifiOff className="h-3 w-3 mr-1" />
        You're offline
      </Badge>
    </div>
  );
};

export default OfflineIndicator;