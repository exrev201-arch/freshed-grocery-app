import { useState, useEffect, useRef, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { useEnhancedPWA } from '@/hooks/use-enhanced-pwa'
import { toast } from '@/hooks/use-toast'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  enabled?: boolean
  threshold?: number
  maxPullDistance?: number
}

export default function PullToRefresh({
  onRefresh,
  children,
  enabled = true,
  threshold = 80,
  maxPullDistance = 120
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const { isStandalone, enableVibration } = useEnhancedPWA()

  // Only enable pull-to-refresh in standalone mode and when enabled
  const isEnabled = enabled && isStandalone

  useEffect(() => {
    if (!isEnabled || !containerRef.current) return

    const container = containerRef.current
    let touchStartY = 0
    let isTouchActive = false

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if scrolled to top
      if (container.scrollTop > 0) return
      
      touchStartY = e.touches[0].clientY
      isTouchActive = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchActive || container.scrollTop > 0) return

      const currentTouchY = e.touches[0].clientY
      
      const deltaY = currentTouchY - touchStartY
      
      if (deltaY > 0) {
        e.preventDefault()
        const distance = Math.min(deltaY * 0.5, maxPullDistance)
        setPullDistance(distance)
        setIsPulling(distance > 20)
        
        // Haptic feedback at threshold
        if (distance >= threshold && pullDistance < threshold) {
          enableVibration([100])
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!isTouchActive) return
      
      isTouchActive = false
      setIsPulling(false)
      
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        enableVibration([200, 100, 200])
        
        try {
          await onRefresh()
          toast({
            title: "Refreshed!",
            description: "Content has been updated.",
          })
        } catch (error) {
          toast({
            title: "Refresh Failed",
            description: "Could not refresh content. Please try again.",
            variant: "destructive"
          })
        } finally {
          setIsRefreshing(false)
        }
      }
      
      setPullDistance(0)
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isEnabled, threshold, maxPullDistance, pullDistance, isRefreshing, onRefresh, enableVibration])

  const pullProgress = Math.min(pullDistance / threshold, 1)
  const iconRotation = pullProgress * 360
  const shouldTrigger = pullDistance >= threshold

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-auto"
      style={{
        transform: isEnabled ? `translateY(${Math.min(pullDistance * 0.3, 40)}px)` : undefined,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to refresh indicator */}
      {isEnabled && (pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm border-b"
          style={{
            height: `${Math.max(pullDistance * 0.8, 60)}px`,
            opacity: Math.max(pullProgress, 0.3)
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={`transition-all duration-200 ${
              shouldTrigger ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              <RefreshCw 
                className={`h-6 w-6 transition-transform duration-200 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                style={{
                  transform: isRefreshing ? undefined : `rotate(${iconRotation}deg)`
                }}
              />
            </div>
            <span className={`text-xs font-medium transition-colors duration-200 ${
              shouldTrigger ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {isRefreshing 
                ? 'Refreshing...' 
                : shouldTrigger 
                ? 'Release to refresh' 
                : 'Pull to refresh'
              }
            </span>
          </div>
          
          {/* Progress indicator */}
          <div className="w-8 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-200 ${
                shouldTrigger ? 'bg-green-600' : 'bg-gray-400'
              }`}
              style={{ width: `${pullProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={isEnabled && (pullDistance > 0 || isRefreshing) ? 'mt-16' : ''}>
        {children}
      </div>
    </div>
  )
}