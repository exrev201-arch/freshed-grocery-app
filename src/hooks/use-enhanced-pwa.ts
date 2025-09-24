import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface EnhancedPWAState {
  isInstalled: boolean
  isInstallable: boolean
  isOffline: boolean
  hasUpdate: boolean
  isLoading: boolean
  promptInstall: () => Promise<void>
  acceptUpdate: () => void
  dismissUpdate: () => void
  subscribeToNotifications: () => Promise<boolean>
  unsubscribeFromNotifications: () => Promise<boolean>
  isNotificationSupported: boolean
  isNotificationPermitted: boolean
  isStandalone: boolean
  networkSpeed: string
  storageUsage: number
  enableVibration: (pattern: number[]) => void
  shareContent: (data: ShareData) => Promise<boolean>
  addToHomeScreen: () => Promise<void>
}

export const useEnhancedPWA = (): EnhancedPWAState => {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [hasUpdate, setHasUpdate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isNotificationPermitted, setIsNotificationPermitted] = useState(
    'Notification' in window && Notification.permission === 'granted'
  )
  const [networkSpeed, setNetworkSpeed] = useState('unknown')
  const [storageUsage, setStorageUsage] = useState(0)

  // Check if app is running in standalone mode (installed as PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://')

  const isNotificationSupported = 'Notification' in window && 'serviceWorker' in navigator

  // Monitor network connection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        setNetworkSpeed(connection.effectiveType || 'unknown')
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateNetworkInfo)
      updateNetworkInfo()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  // Monitor storage usage
  useEffect(() => {
    const updateStorageUsage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate()
          const usage = estimate.usage || 0
          const quota = estimate.quota || 1
          setStorageUsage(Math.round((usage / quota) * 100))
        } catch (error) {
          console.warn('Could not estimate storage usage:', error)
        }
      }
    }

    updateStorageUsage()
    const interval = setInterval(updateStorageUsage, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Handle PWA installation events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      
      // Show welcome notification for new installations
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Welcome to Fresh Grocery! 🛒', {
          body: 'Your app has been installed successfully. Enjoy fresh groceries delivered to your door!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'welcome',
          requireInteraction: true
        })
      }
      
      // Track installation analytics
      if ('gtag' in window) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'PWA Installation'
        })
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already installed
    setIsInstalled(isStandalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isStandalone])

  // Handle service worker updates with enhanced UX
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true)
                
                // Show update notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Fresh Grocery Update Available! 🚀', {
                    body: 'A new version of the app is ready. Tap to update for the latest features.',
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    tag: 'update',
                    requireInteraction: true
                  })
                }
              }
            })
          }
        })
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
          setHasUpdate(true)
        }
      })

      // Handle notification actions
      navigator.serviceWorker.addEventListener('notificationclick', (event: any) => {
        if (event.action === 'update') {
          acceptUpdate()
        }
        event.notification.close()
      })
    }
  }, [])

  // PWA Installation prompt with enhanced UX
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return

    setIsLoading(true)
    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        
        // Haptic feedback on successful installation
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100])
        }
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error prompting for installation:', error)
    } finally {
      setIsLoading(false)
    }
  }, [deferredPrompt])

  // Accept service worker update
  const acceptUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          
          // Show loading indicator before reload
          setIsLoading(true)
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      })
    }
    setHasUpdate(false)
  }, [])

  // Dismiss update notification
  const dismissUpdate = useCallback(() => {
    setHasUpdate(false)
  }, [])

  // Subscribe to push notifications
  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    if (!isNotificationSupported) return false

    try {
      const permission = await Notification.requestPermission()
      setIsNotificationPermitted(permission === 'granted')
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            // VAPID public key - replace with your actual key
            'BEl62iUYgUivxIkv69yViEuiBIa40HI80xBHlrRbGkww'
          )
        })
        
        // Send subscription to your server
        try {
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
          })
        } catch (error) {
          console.warn('Could not register push subscription on server:', error)
        }
        
        // Show confirmation notification
        new Notification('Notifications Enabled! 🔔', {
          body: 'You\'ll now receive updates about your orders and special offers.',
          icon: '/icons/icon-192x192.png',
          tag: 'notification-enabled'
        })
        
        return true
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
    }
    
    return false
  }, [isNotificationSupported])

  // Unsubscribe from push notifications
  const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
    if (!isNotificationSupported) return false

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        setIsNotificationPermitted(false)
        
        // Notify server of unsubscription
        try {
          await fetch('/api/notifications/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          })
        } catch (error) {
          console.warn('Could not unregister push subscription on server:', error)
        }
        
        return true
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error)
    }
    
    return false
  }, [isNotificationSupported])

  // Haptic feedback
  const enableVibration = useCallback((pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  // Web Share API
  const shareContent = useCallback(async (data: ShareData): Promise<boolean> => {
    if ('share' in navigator) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        console.error('Error sharing content:', error)
      }
    }
    return false
  }, [])

  // Enhanced add to home screen
  const addToHomeScreen = useCallback(async () => {
    if (deferredPrompt) {
      await promptInstall()
    } else if (!isInstalled) {
      // Show manual instructions for browsers that don't support beforeinstallprompt
      const userAgent = navigator.userAgent.toLowerCase()
      let instructions = ''
      
      if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        instructions = 'Tap the Share button and then "Add to Home Screen"'
      } else if (userAgent.includes('chrome')) {
        instructions = 'Tap the menu (⋮) and select "Add to Home screen"'
      } else if (userAgent.includes('firefox')) {
        instructions = 'Tap the menu and select "Install"'
      } else {
        instructions = 'Look for "Add to Home Screen" or "Install" in your browser menu'
      }
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Add Fresh Grocery to Home Screen', {
          body: instructions,
          icon: '/icons/icon-192x192.png',
          requireInteraction: true
        })
      } else {
        alert(`Add Fresh Grocery to your home screen:\n\n${instructions}`)
      }
    }
  }, [deferredPrompt, promptInstall, isInstalled])

  return {
    isInstalled,
    isInstallable,
    isOffline,
    hasUpdate,
    isLoading,
    promptInstall,
    acceptUpdate,
    dismissUpdate,
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
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default useEnhancedPWA