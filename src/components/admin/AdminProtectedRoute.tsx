import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/admin-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, AlertTriangle } from 'lucide-react';

interface AdminProtectedRouteProps {
    children: ReactNode;
    requiredPermission?: 'read' | 'write' | 'delete' | 'admin';
    fallback?: ReactNode;
}

export function AdminProtectedRoute({ 
    children, 
    requiredPermission = 'read',
    fallback 
}: AdminProtectedRouteProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { 
        isAdminAuthenticated, 
        adminUser, 
        hasPermission, 
        checkSession, 
        updateLastActivity 
    } = useAdminStore();

    useEffect(() => {
        // Check authentication
        if (!isAdminAuthenticated) {
            toast({
                title: "Admin Authentication Required",
                description: "Please log in as admin to access this area.",
                variant: "destructive",
            });
            navigate('/admin/login');
            return;
        }

        // Check session validity
        if (!checkSession()) {
            toast({
                title: "Admin Session Expired",
                description: "Your session has expired. Please log in again.",
                variant: "destructive",
            });
            navigate('/admin/login');
            return;
        }

        // Update last activity
        updateLastActivity();
    }, [isAdminAuthenticated, checkSession, updateLastActivity, navigate, toast]);

    // Not authenticated
    if (!isAdminAuthenticated) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-red-600">Admin Access Required</CardTitle>
                        <CardDescription>
                            You need to be logged in as an administrator to access this area.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <Button onClick={() => navigate('/admin/login')} className="w-full">
                            Admin Login
                        </Button>
                        <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Insufficient permissions
    if (!hasPermission(requiredPermission)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                        </div>
                        <CardTitle className="text-orange-600">Insufficient Permissions</CardTitle>
                        <CardDescription>
                            You don't have the required {requiredPermission} permissions to access this area.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <p><strong>Logged in as:</strong> {adminUser?.name}</p>
                            <p><strong>Role:</strong> {adminUser?.role}</p>
                            <p><strong>Required:</strong> {requiredPermission} permission</p>
                        </div>
                        <Button onClick={() => navigate('/admin')} variant="outline" className="w-full">
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}

export default AdminProtectedRoute;