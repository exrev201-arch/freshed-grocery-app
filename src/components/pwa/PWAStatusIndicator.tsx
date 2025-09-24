import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Download, 
  Bell, 
  BellOff, 
  HardDrive, 
  Signal,
  RefreshCw,
  Settings,
  Share,
  Vibrate
} from 'lucide-react'
import { useEnhancedPWA } from '@/hooks/use-enhanced-pwa'
import { toast } from '@/hooks/use-toast'

export default function PWAStatusIndicator() {
  const {
    isInstalled,
    isInstallable,
    isOffline,
    hasUpdate,
    isLoading,
    promptInstall,
    acceptUpdate,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    isNotificationSupported,
    isNotificationPermitted,
    isStandalone,
    networkSpeed,
    storageUsage,
    enableVibration,
    shareContent,
    addToHomeScreen
  } = useEnhancedPWA()

  const [showDetails, setShowDetails] = useState(false)

  // Get network status color and icon
  const getNetworkStatus = () => {
    if (isOffline) {
      return { color: 'destructive', icon: WifiOff, text: 'Offline' }
    }
    
    switch (networkSpeed) {
      case '4g':
        return { color: 'default', icon: Wifi, text: '4G' }
      case '3g':
        return { color: 'secondary', icon: Signal, text: '3G' }
      case '2g':
        return { color: 'destructive', icon: Signal, text: '2G' }
      case 'slow-2g':
        return { color: 'destructive', icon: Signal, text: 'Slow' }
      default:
        return { color: 'default', icon: Wifi, text: 'Online' }
    }
  }

  const networkStatus = getNetworkStatus()
  const NetworkIcon = networkStatus.icon

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        const success = await subscribeToNotifications()
        if (success) {
          toast({
            title: "Notifications Enabled",
            description: "You'll receive updates about your orders and special offers.",
          })
          enableVibration([100, 50, 100])
        } else {
          toast({
            title: "Notification Setup Failed",
            description: "Please check your browser settings and try again.",
            variant: "destructive"
          })
        }
      } else {
        const success = await unsubscribeFromNotifications()
        if (success) {
          toast({
            title: "Notifications Disabled",
            description: "You won't receive push notifications anymore.",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive"
      })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Fresh Grocery Tanzania',
      text: 'Get fresh groceries delivered to your door in Tanzania!',
      url: window.location.origin
    }

    const success = await shareContent(shareData)
    if (!success) {
      // Fallback for browsers without Web Share API
      try {
        await navigator.clipboard.writeText(window.location.origin)
        toast({
          title: "Link Copied",
          description: "Fresh Grocery link copied to clipboard!",
        })
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Could not share or copy link.",
          variant: "destructive"
        })
      }
    } else {
      enableVibration([50])
    }
  }

  const handleInstall = async () => {
    if (isInstallable) {
      await promptInstall()
    } else {
      await addToHomeScreen()
    }
  }

  const handleUpdate = () => {
    acceptUpdate()
    enableVibration([100, 100, 100])
  }

  const handleVibrationTest = () => {
    enableVibration([200, 100, 200, 100, 200])
  }

  // Only show PWA status indicator when:
  // 1. App is installable (can be installed as PWA)
  // 2. App is already installed/standalone
  // 3. There's an update available
  // 4. User is offline (to show network status)
  if (!isInstallable && !isStandalone && !hasUpdate && !isOffline) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <NetworkIcon className="h-4 w-4" />
              <Badge variant={networkStatus.color as any} className="text-xs">
                {networkStatus.text}
              </Badge>
              {hasUpdate && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
              {isInstallable && !isInstalled && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              App Status & Settings
            </DialogTitle>
            <DialogDescription>
              Manage your Fresh Grocery app experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Network Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <NetworkIcon className="h-4 w-4" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {isOffline ? 'You are offline' : `Connected via ${networkStatus.text}`}
                  </span>
                  <Badge variant={networkStatus.color as any}>
                    {networkStatus.text}
                  </Badge>
                </div>
                {isOffline && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Some features may be limited while offline. Your cart and browsing history are still available.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Storage Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">App Data</span>
                    <span>{storageUsage}% used</span>
                  </div>
                  <Progress value={storageUsage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Includes cached images, offline data, and app resources
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* App Installation */}
            {(!isInstalled || isInstallable) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    App Installation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Install Fresh Grocery as a native app for better performance and offline access.
                    </p>
                    <Button 
                      onClick={handleInstall} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isLoading ? 'Installing...' : 'Install App'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* App Update */}
            {hasUpdate && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                    <RefreshCw className="h-4 w-4" />
                    Update Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-blue-600">
                      A new version of Fresh Grocery is ready with bug fixes and improvements.
                    </p>
                    <Button 
                      onClick={handleUpdate} 
                      variant="default"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Update Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">App Settings</h4>
              
              {/* Notifications */}
              {isNotificationSupported && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isNotificationPermitted ? (
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Push Notifications</span>
                  </div>
                  <Switch
                    checked={isNotificationPermitted}
                    onCheckedChange={handleNotificationToggle}
                  />
                </div>
              )}

              {/* Vibration Test */}
              {'vibrate' in navigator && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vibrate className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Test Vibration</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVibrationTest}
                  >
                    Test
                  </Button>
                </div>
              )}

              {/* Share App */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Share Fresh Grocery</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Installation Status */}
            {isStandalone && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm font-medium">App Mode Active</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  You're using Fresh Grocery as an installed app with full offline capabilities.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}