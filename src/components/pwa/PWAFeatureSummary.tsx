import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Smartphone,
  Download,
  Bell,
  Wifi,
  WifiOff,
  Palette,
  Navigation,
  RefreshCw,
  Share,
  Vibrate,
  Star,
  CheckCircle2,
  Zap,
  Shield,
  Gauge,
  Heart
} from 'lucide-react'
import { useEnhancedPWA } from '@/hooks/use-enhanced-pwa'

interface PWAFeature {
  id: string
  name: string
  description: string
  icon: any
  status: 'available' | 'active' | 'unavailable'
  category: 'core' | 'enhanced' | 'experimental'
}

export default function PWAFeatureSummary() {
  const [showSummary, setShowSummary] = useState(false)
  const [features, setFeatures] = useState<PWAFeature[]>([])
  
  const {
    isInstalled,
    isInstallable,
    isOffline,
    hasUpdate,
    isNotificationSupported,
    isNotificationPermitted,
    isStandalone,
    networkSpeed,
    storageUsage
  } = useEnhancedPWA()

  useEffect(() => {
    // Check if user should see feature summary
    const hasSeenSummary = localStorage.getItem('fresh-grocery-pwa-summary-seen')
    
    if (!hasSeenSummary && (isStandalone || isInstalled)) {
      setTimeout(() => setShowSummary(true), 3000)
    }
  }, [isStandalone, isInstalled])

  useEffect(() => {
    const featureList: PWAFeature[] = [
      {
        id: 'installation',
        name: 'App Installation',
        description: 'Install as native app',
        icon: Download,
        status: isInstalled || isStandalone ? 'active' : isInstallable ? 'available' : 'unavailable',
        category: 'core'
      },
      {
        id: 'offline',
        name: 'Offline Support',
        description: 'Works without internet',
        icon: isOffline ? WifiOff : Wifi,
        status: 'active',
        category: 'core'
      },
      {
        id: 'notifications',
        name: 'Push Notifications',
        description: 'Receive order updates',
        icon: Bell,
        status: isNotificationPermitted ? 'active' : isNotificationSupported ? 'available' : 'unavailable',
        category: 'core'
      },
      {
        id: 'navigation',
        name: 'Native Navigation',
        description: 'App-like bottom navigation',
        icon: Navigation,
        status: isStandalone ? 'active' : 'available',
        category: 'enhanced'
      },
      {
        id: 'theme',
        name: 'Theme Customization',
        description: 'Personalize appearance',
        icon: Palette,
        status: 'active',
        category: 'enhanced'
      },
      {
        id: 'pullrefresh',
        name: 'Pull to Refresh',
        description: 'Swipe down to update',
        icon: RefreshCw,
        status: isStandalone ? 'active' : 'available',
        category: 'enhanced'
      },
      {
        id: 'sharing',
        name: 'Web Share API',
        description: 'Share products easily',
        icon: Share,
        status: 'share' in navigator ? 'active' : 'unavailable',
        category: 'enhanced'
      },
      {
        id: 'haptics',
        name: 'Haptic Feedback',
        description: 'Touch vibrations',
        icon: Vibrate,
        status: 'vibrate' in navigator ? 'active' : 'unavailable',
        category: 'enhanced'
      },
      {
        id: 'performance',
        name: 'Fast Performance',
        description: 'Optimized loading',
        icon: Zap,
        status: 'active',
        category: 'core'
      },
      {
        id: 'security',
        name: 'Secure HTTPS',
        description: 'Encrypted connections',
        icon: Shield,
        status: location.protocol === 'https:' ? 'active' : 'unavailable',
        category: 'core'
      }
    ]
    
    setFeatures(featureList)
  }, [isInstalled, isStandalone, isInstallable, isOffline, isNotificationSupported, isNotificationPermitted])

  const dismissSummary = () => {
    localStorage.setItem('fresh-grocery-pwa-summary-seen', 'true')
    setShowSummary(false)
  }

  if (!showSummary) {
    return null
  }

  const activeFeatures = features.filter(f => f.status === 'active').length
  const availableFeatures = features.filter(f => f.status === 'available').length
  const totalFeatures = features.length
  const completionPercentage = (activeFeatures / totalFeatures) * 100

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl">
            Welcome to Your Enhanced App Experience! 🚀
          </CardTitle>
          <CardDescription>
            Fresh Grocery now works like a native mobile app with powerful features
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">PWA Features Active</span>
              <span className="text-muted-foreground">{activeFeatures} of {totalFeatures}</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>{activeFeatures} Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>{availableFeatures} Available</span>
              </div>
            </div>
          </div>

          {/* Feature Categories */}
          {['core', 'enhanced'].map((category) => (
            <div key={category}>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                {category === 'core' ? (
                  <>
                    <Star className="h-4 w-4 text-yellow-500" />
                    Core Features
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 text-red-500" />
                    Enhanced Features
                  </>
                )}
              </h4>
              <div className="grid gap-2">
                {features
                  .filter(f => f.category === category)
                  .map((feature) => {
                    const Icon = feature.icon
                    return (
                      <div
                        key={feature.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                      >
                        <div className={`p-2 rounded-lg ${
                          feature.status === 'active' 
                            ? 'bg-green-100 text-green-600' 
                            : feature.status === 'available'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{feature.name}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                        <Badge 
                          variant={
                            feature.status === 'active' 
                              ? 'default' 
                              : feature.status === 'available' 
                              ? 'secondary' 
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {feature.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {feature.status === 'active' ? 'Active' : 
                           feature.status === 'available' ? 'Available' : 'N/A'}
                        </Badge>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}

          {/* App Stats */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              App Performance
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Network</p>
                <p className="font-medium">{isOffline ? 'Offline' : networkSpeed || 'Online'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Storage Used</p>
                <p className="font-medium">{storageUsage}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mode</p>
                <p className="font-medium">{isStandalone ? 'Standalone' : 'Browser'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Updates</p>
                <p className="font-medium">{hasUpdate ? 'Available' : 'Current'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={dismissSummary} className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Got it, thanks!
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You can access PWA settings anytime from the status indicator in the bottom right
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}