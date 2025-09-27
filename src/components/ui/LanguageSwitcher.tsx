import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'sw' : 'en'
    console.log('Toggling language from', language, 'to', newLanguage)
    setLanguage(newLanguage)
  }

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={toggleLanguage}
      className="relative flex items-center gap-2"
    >
      <Languages className="h-5 w-5" />
      <span className="hidden sm:inline">
        {language === 'en' ? 'Swahili' : 'English'}
      </span>
      <span className="sr-only">Switch language</span>
    </Button>
  )
}

export function MobileLanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'sw' : 'en'
    console.log('Toggling language from', language, 'to', newLanguage)
    setLanguage(newLanguage)
  }

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={toggleLanguage}
      className="flex flex-col items-center space-y-1"
    >
      <Languages className="h-5 w-5" />
      <span className="text-xs">
        {language === 'en' ? 'Swahili' : 'English'}
      </span>
    </Button>
  )
}