import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

function NotFoundPage() {
    const navigate = useNavigate()
    const { t } = useLanguage()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                    <div className="text-6xl font-bold text-gray-400 mb-2">404</div>
                    <CardTitle className="text-xl text-gray-800">{t('pageNotFoundTitle')}</CardTitle>
                    <p className="text-gray-600">{t('pageNotFoundDescription')}</p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-gray-600">
                        {t('pageNotFoundMessage')}
                    </p>
                    <p className="text-sm text-gray-500">
                        {t('pageNotFoundExplanation')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button 
                            onClick={() => navigate(-1)} 
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('goBack')}
                        </Button>
                        <Button 
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Home className="h-4 w-4" />
                            {t('returnHome')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default NotFoundPage