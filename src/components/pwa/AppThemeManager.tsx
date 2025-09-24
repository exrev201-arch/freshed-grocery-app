import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Smartphone,
  Eye,
  Vibrate,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useEnhancedPWA } from '@/hooks/use-enhanced-pwa'
import { toast } from '@/hooks/use-toast'

interface AppTheme {
  mode: 'light' | 'dark' | 'system'
  colorScheme: 'green' | 'blue' | 'purple' | 'orange'
  fontSize: number
  reducedMotion: boolean
  highContrast: boolean
  hapticFeedback: boolean
  soundEffects: boolean
}

const COLOR_SCHEMES = {
  green: {
    name: 'Fresh Green',
    primary: '#16a34a',
    secondary: '#dcfce7',
    accent: '#15803d'
  },
  blue: {
    name: 'Ocean Blue',
    primary: '#2563eb',
    secondary: '#dbeafe',
    accent: '#1d4ed8'
  },
  purple: {
    name: 'Royal Purple',
    primary: '#9333ea',
    secondary: '#f3e8ff',
    accent: '#7c3aed'
  },
  orange: {
    name: 'Vibrant Orange',
    primary: '#ea580c',
    secondary: '#fed7aa',
    accent: '#c2410c'
  }
}

export default function AppThemeManager() {
  const [showThemeDialog, setShowThemeDialog] = useState(false)
  const [theme, setTheme] = useState<AppTheme>({
    mode: 'system',
    colorScheme: 'green',
    fontSize: 16,
    reducedMotion: false,
    highContrast: false,
    hapticFeedback: true,
    soundEffects: false
  })
  
  const { isStandalone, enableVibration } = useEnhancedPWA()

  // Load saved theme preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('fresh-grocery-theme')
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme)
        setTheme({ ...theme, ...parsedTheme })
      } catch (error) {
        console.warn('Failed to parse saved theme:', error)
      }
    }
  }, [])

  // Apply theme changes
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('fresh-grocery-theme', JSON.stringify(theme))
  }, [theme])

  const applyTheme = (newTheme: AppTheme) => {
    const root = document.documentElement
    
    // Apply color scheme
    const colors = COLOR_SCHEMES[newTheme.colorScheme]
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-foreground', '#ffffff')
    root.style.setProperty('--secondary', colors.secondary)
    root.style.setProperty('--accent', colors.accent)
    
    // Apply dark/light mode
    if (newTheme.mode === 'dark') {
      root.classList.add('dark')
    } else if (newTheme.mode === 'light') {
      root.classList.remove('dark')
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    
    // Apply font size
    root.style.setProperty('--base-font-size', `${newTheme.fontSize}px`)
    
    // Apply accessibility settings
    if (newTheme.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
      root.classList.add('reduce-motion')
    } else {
      root.style.removeProperty('--animation-duration')
      root.classList.remove('reduce-motion')
    }
    
    if (newTheme.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }

  const updateTheme = (updates: Partial<AppTheme>) => {
    const newTheme = { ...theme, ...updates }
    setTheme(newTheme)
    
    if (theme.hapticFeedback) {
      enableVibration([50])
    }
    
    toast({
      title: "Theme Updated",
      description: "Your app appearance has been customized.",
      duration: 2000
    })
  }

  const resetTheme = () => {
    const defaultTheme: AppTheme = {
      mode: 'system',
      colorScheme: 'green',
      fontSize: 16,
      reducedMotion: false,
      highContrast: false,
      hapticFeedback: true,
      soundEffects: false
    }
    setTheme(defaultTheme)
    enableVibration([100, 50, 100])
    toast({
      title: "Theme Reset",
      description: "All theme settings have been restored to defaults."
    })
  }

  // Only show theme manager in standalone mode
  if (!isStandalone) {
    return null
  }

  return (
    <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border shadow-sm"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            App Theme & Accessibility
          </DialogTitle>
          <DialogDescription>
            Customize your Fresh Grocery app appearance and accessibility settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Mode */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Appearance Mode</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={theme.mode === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateTheme({ mode: value as AppTheme['mode'] })}
                    className="flex flex-col gap-1 h-auto p-3"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Color Scheme */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                  <Button
                    key={key}
                    variant={theme.colorScheme === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateTheme({ colorScheme: key as AppTheme['colorScheme'] })}
                    className="flex items-center gap-2 justify-start"
                  >
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: scheme.primary }}
                    />
                    <span className="text-xs">{scheme.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Font Size */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Font Size
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Size: {theme.fontSize}px</span>
                  <span className="font-medium" style={{ fontSize: `${theme.fontSize}px` }}>
                    Sample Text
                  </span>
                </div>
                <Slider
                  value={[theme.fontSize]}
                  onValueChange={([value]) => updateTheme({ fontSize: value })}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Reduced Motion</p>
                  <p className="text-xs text-muted-foreground">Minimize animations</p>
                </div>
                <Switch
                  checked={theme.reducedMotion}
                  onCheckedChange={(checked) => updateTheme({ reducedMotion: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">High Contrast</p>
                  <p className="text-xs text-muted-foreground">Enhanced visibility</p>
                </div>
                <Switch
                  checked={theme.highContrast}
                  onCheckedChange={(checked) => updateTheme({ highContrast: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* App Feedback */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                App Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vibrate className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Haptic Feedback</p>
                    <p className="text-xs text-muted-foreground">Touch vibrations</p>
                  </div>
                </div>
                <Switch
                  checked={theme.hapticFeedback}
                  onCheckedChange={(checked) => updateTheme({ hapticFeedback: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme.soundEffects ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <div>
                    <p className="text-sm font-medium">Sound Effects</p>
                    <p className="text-xs text-muted-foreground">Audio feedback</p>
                  </div>
                </div>
                <Switch
                  checked={theme.soundEffects}
                  onCheckedChange={(checked) => updateTheme({ soundEffects: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Button
            onClick={resetTheme}
            variant="outline"
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}