import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Smartphone, 
  Download, 
  Bell, 
  Wifi, 
  ShoppingCart, 
  Star, 
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useEnhancedPWA } from '@/hooks/use-enhanced-pwa'
import { toast } from '@/hooks/use-toast'

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Fresh Grocery App!',
    description: 'Experience grocery shopping like never before with our app-like features.',
    icon: Sparkles,
    color: 'text-green-600',
    action: null
  },
  {
    id: 'install',
    title: 'Install the App',
    description: 'Add Fresh Grocery to your home screen for quick access and better performance.',
    icon: Download,
    color: 'text-blue-600',
    action: 'install'
  },
  {
    id: 'notifications',
    title: 'Enable Notifications',
    description: 'Get updates about your orders, special deals, and delivery status.',
    icon: Bell,
    color: 'text-purple-600',
    action: 'notifications'
  },
  {
    id: 'offline',
    title: 'Works Offline',
    description: 'Browse products and manage your cart even when you\'re offline.',
    icon: Wifi,
    color: 'text-orange-600',
    action: null
  },
  {
    id: 'features',
    title: 'App-like Experience',
    description: 'Enjoy native app features like shortcuts, background sync, and more.',
    icon: Zap,
    color: 'text-yellow-600',
    action: null
  }
]

export default function PWAOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  const {
    isInstalled,
    isInstallable,
    promptInstall,
    subscribeToNotifications,
    isNotificationSupported,
    isNotificationPermitted,
    isStandalone,
    enableVibration
  } = useEnhancedPWA()

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenKey = 'fresh-grocery-onboarding-seen'
    const hasSeen = localStorage.getItem(hasSeenKey) === 'true'
    setHasSeenOnboarding(hasSeen)

    // Show onboarding for new users or if PWA features are available
    if (!hasSeen && (isInstallable || (!isInstalled && !isStandalone))) {
      const timer = setTimeout(() => {
        setShowOnboarding(true)
      }, 2000) // Show after 2 seconds
      
      return () => clearTimeout(timer)
    }
    
    // Return empty cleanup function if timer wasn't set
    return () => {}
  }, [isInstallable, isInstalled, isStandalone])

  // Track completed steps
  useEffect(() => {
    const completed: string[] = []
    
    if (isInstalled || isStandalone) {
      completed.push('install')
    }
    
    if (isNotificationPermitted) {
      completed.push('notifications')
    }
    
    setCompletedSteps(completed)
  }, [isInstalled, isStandalone, isNotificationPermitted])

  const handleStepAction = async (action: string | null) => {
    switch (action) {
      case 'install':
        if (isInstallable) {
          await promptInstall()
          enableVibration([100, 50, 100])
          toast({
            title: "App Installation",
            description: "Installing Fresh Grocery app...",
          })
        } else {
          toast({
            title: "Installation",
            description: "App installation is not available on this device.",
            variant: "default"
          })
        }
        break
        
      case 'notifications':
        if (isNotificationSupported) {
          const success = await subscribeToNotifications()
          if (success) {
            enableVibration([100, 50, 100])
            toast({
              title: "Notifications Enabled!",
              description: "You'll receive updates about your orders and deals.",
            })
          }
        } else {
          toast({
            title: "Notifications",
            description: "Notifications are not supported on this device.",
            variant: "default"
          })
        }
        break
    }
  }

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const skipOnboarding = () => {
    localStorage.setItem('fresh-grocery-onboarding-seen', 'true')
    setShowOnboarding(false)
    setHasSeenOnboarding(true)
  }

  const completeOnboarding = () => {
    localStorage.setItem('fresh-grocery-onboarding-seen', 'true')
    setShowOnboarding(false)
    setHasSeenOnboarding(true)
    enableVibration([200, 100, 200])
    toast({
      title: "Welcome Aboard! 🎉",
      description: "You're all set to enjoy the best grocery shopping experience.",
    })
  }

  const currentStepData = ONBOARDING_STEPS[currentStep]
  const StepIcon = currentStepData?.icon || Sparkles
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
  const isStepCompleted = completedSteps.includes(currentStepData?.id)

  if (!showOnboarding || hasSeenOnboarding) {
    return null
  }

  return (
    <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              App Setup
            </DialogTitle>
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} of {ONBOARDING_STEPS.length}
            </Badge>
          </div>
          <DialogDescription>
            Let's set up your Fresh Grocery app experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Setup Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          <Card className="border-2 border-dashed border-green-200 bg-green-50/50">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                  <StepIcon className={`h-6 w-6 ${currentStepData.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {currentStepData.title}
                    {isStepCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {currentStepData.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            {currentStepData.action && (
              <CardContent className="pt-0">
                <Button
                  onClick={() => handleStepAction(currentStepData.action)}
                  disabled={isStepCompleted}
                  className="w-full"
                  variant={isStepCompleted ? "outline" : "default"}
                >
                  {isStepCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <StepIcon className="h-4 w-4 mr-2" />
                      {currentStepData.action === 'install' ? 'Install App' : 'Enable Notifications'}
                    </>
                  )}
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Step Overview */}
          <div className="grid grid-cols-5 gap-2">
            {ONBOARDING_STEPS.map((step, index) => {
              const Icon = step.icon
              const isCurrent = index === currentStep
              const isCompleted = completedSteps.includes(step.id)
              const isPassed = index < currentStep
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    isCurrent 
                      ? 'bg-green-100 border-2 border-green-300' 
                      : isPassed || isCompleted
                      ? 'bg-gray-100'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className={`p-1 rounded ${
                    isCurrent
                      ? 'bg-green-200'
                      : isPassed || isCompleted
                      ? 'bg-green-100'
                      : 'bg-gray-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Icon className={`h-4 w-4 ${
                        isCurrent
                          ? step.color
                          : isPassed
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  <span className="text-xs text-center leading-tight">
                    {step.title.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={skipOnboarding}
              className="flex-1"
            >
              Skip Setup
            </Button>
            <Button
              onClick={nextStep}
              className="flex-1"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <>
                  Complete
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Features Preview */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              What you'll get:
            </h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-3 w-3" />
                <span>Faster shopping experience</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-3 w-3" />
                <span>Order updates & special offers</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-3 w-3" />
                <span>Works offline</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}