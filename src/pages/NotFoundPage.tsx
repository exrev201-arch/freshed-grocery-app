import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                    <div className="text-6xl font-bold text-gray-400 mb-2">404</div>
                    <CardTitle className="text-xl text-gray-800">Ukurasa Haupatikani</CardTitle>
                    <p className="text-gray-600">Page Not Found</p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-gray-600">
                        Ukurasa unaoutafuta haupatikani au umehamishwa.
                    </p>
                    <p className="text-sm text-gray-500">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button 
                            onClick={() => navigate(-1)} 
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Rudi Nyuma
                        </Button>
                        <Button 
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Home className="h-4 w-4" />
                            Rudi Mwanzoni
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default NotFoundPage 