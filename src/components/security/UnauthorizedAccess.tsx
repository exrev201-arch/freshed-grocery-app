import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

interface UnauthorizedAccessProps {
    type?: 'unauthorized' | 'forbidden' | 'admin-only';
    message?: string;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ 
    type = 'unauthorized',
    message 
}) => {
    const navigate = useNavigate();

    // Log unauthorized access attempts (in production, send to monitoring service)
    useEffect(() => {
        console.warn(`Unauthorized access attempt to admin area from: ${window.location.href}`);
        // In production: Send to security monitoring service
    }, []);

    const getContent = () => {
        switch (type) {
            case 'admin-only':
                return {
                    title: 'Admin Access Only',
                    description: 'This area is restricted to administrative personnel only.',
                    icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
                    bgColor: 'bg-red-100'
                };
            case 'forbidden':
                return {
                    title: 'Access Forbidden',
                    description: 'You do not have permission to access this resource.',
                    icon: <AlertTriangle className="w-8 h-8 text-orange-600" />,
                    bgColor: 'bg-orange-100'
                };
            default:
                return {
                    title: 'Unauthorized Access',
                    description: 'You are not authorized to view this page.',
                    icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
                    bgColor: 'bg-red-100'
                };
        }
    };

    const content = getContent();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-lg">
                <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${content.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        {content.icon}
                    </div>
                    <CardTitle className="text-red-600">{content.title}</CardTitle>
                    <CardDescription className="text-base">
                        {message || content.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-sm">
                        <p className="text-gray-700 mb-2">
                            <strong>Need admin access?</strong>
                        </p>
                        <p className="text-gray-600">
                            Contact your system administrator or Fresh support team for assistance.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                            onClick={() => navigate(-1)} 
                            variant="outline" 
                            className="flex-1"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                        <Button 
                            onClick={() => navigate('/')} 
                            className="flex-1"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Home
                        </Button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-4">
                        This access attempt has been logged for security purposes.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default UnauthorizedAccess;