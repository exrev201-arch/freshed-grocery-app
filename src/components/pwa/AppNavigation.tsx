import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Search,
  Heart,
  Clock,
  Settings,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useEnhancedPWA } from '@/hooks/use-enhanced-pwa'
import { useLanguage } from '@/contexts/LanguageContext'

const BOTTOM_NAV_ITEMS = [
  {
    icon: Home,
    labelKey: 'homeLabel',
    path: '/',
    color: 'text-green-600'
  },
  {
    icon: ShoppingBag,
    labelKey: 'productsLabel',
    path: '/products',
    color: 'text-blue-600'
  },
  {
    icon: ShoppingCart,
    labelKey: 'cartLabel',
    path: '/cart',
    color: 'text-orange-600',
    showBadge: true
  },
  {
    icon: User,
    labelKey: 'profileLabel',
    path: '/profile',
    color: 'text-purple-600'
  }
]

const QUICK_ACTIONS = [
  {
    icon: Search,
    labelKey: 'search',
    action: 'search',
    color: 'bg-blue-500'
  },
  {
    icon: Heart,
    labelKey: 'favorites',
    action: 'favorites',
    color: 'bg-red-500'
  },
  {
    icon: Clock,
    labelKey: 'recent',
    action: 'recent',
    color: 'bg-yellow-500'
  },
  {
    icon: Settings,
    labelKey: 'settings',
    action: 'settings',
    color: 'bg-gray-500'
  }
]

export default function AppNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items } = useCartStore()
  const { isStandalone, enableVibration } = useEnhancedPWA()
  const { t } = useLanguage()
  
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)
  const isHomePage = location.pathname === '/'
  const isProductsPage = location.pathname.startsWith('/products')
  const isProductPage = location.pathname.startsWith('/product/')

  // Handle scroll for app bar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Only show enhanced navigation in standalone mode (installed PWA)
  if (!isStandalone) {
    return null
  }

  const handleNavigation = (path: string) => {
    enableVibration([50])
    navigate(path)
  }

  const handleQuickAction = (action: string) => {
    enableVibration([50])
    
    switch (action) {
      case 'search':
        navigate('/products?focus=search')
        break
      case 'favorites':
        navigate('/products?filter=favorites')
        break
      case 'recent':
        navigate('/products?filter=recent')
        break
      case 'settings':
        // Open settings in PWA status indicator
        break
    }
    setShowQuickActions(false)
  }

  const handleBackNavigation = () => {
    enableVibration([50])
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate('/')
    }
  }

  return (
    <>
      {/* Enhanced App Bar for non-home pages */}
      {!isHomePage && (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md border-b shadow-sm' 
            : 'bg-transparent'
        }`}>
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackNavigation}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 text-center">
              <h1 className="font-semibold text-lg">
                {isProductsPage ? t('products') : 
                 isProductPage ? t('product') : 
                 t('home')}
              </h1>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="p-2"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Actions Dropdown */}
          {showQuickActions && (
            <Card className="absolute top-full right-4 mt-2 w-48 shadow-lg">
              <CardContent className="p-2">
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.action}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickAction(action.action)}
                        className="flex flex-col gap-1 h-auto p-3"
                      >
                        <div className={`p-2 rounded-lg ${action.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs">{t(action.labelKey)}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path ||
                            (item.path === '/products' && location.pathname.startsWith('/product'))
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center gap-1 h-auto p-3 relative ${
                  isActive ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? item.color : ''}`} />
                  {item.showBadge && cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-0"
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                  {t(item.labelKey)}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full" />
                )}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Floating Action Button for Cart (when not on cart page) */}
      {location.pathname !== '/cart' && cartItemCount > 0 && (
        <Button
          onClick={() => handleNavigation('/cart')}
          className="fixed bottom-20 right-4 z-40 rounded-full h-14 w-14 shadow-lg bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-0"
            >
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </Badge>
          </div>
        </Button>
      )}

      {/* Spacer for bottom navigation */}
      <div className="h-16" />
    </>
  )
}