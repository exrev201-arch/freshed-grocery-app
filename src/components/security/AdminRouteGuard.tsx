import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminStore } from '@/store/admin-store';
import { useAuthStore } from '@/store/auth-store';
import UnauthorizedAccess from './UnauthorizedAccess';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface AdminRouteGuardProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ 
    children, 
    requireAdmin = true 
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdminAuthenticated, adminUser, checkSession } = useAdminStore();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        // Log access attempts for security monitoring
        console.log(`Admin route access attempt:`, {
            path: location.pathname,
            userAuthenticated: isAuthenticated,
            adminAuthenticated: isAdminAuthenticated,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });

        // Additional security checks
        if (requireAdmin) {
            // Check if admin session is valid
            if (isAdminAuthenticated && !checkSession()) {
                console.warn('Invalid admin session detected, redirecting to login');
                navigate('/admin/login');
                return;
            }

            // Prevent regular users from accessing admin areas
            if (isAuthenticated && !isAdminAuthenticated) {
                console.warn('Regular user attempted to access admin area');
                // Could redirect to unauthorized page or home
            }
        }
    }, [location.pathname, isAuthenticated, isAdminAuthenticated, requireAdmin, checkSession, navigate]);

    // Loading state while checking authentication
    if (requireAdmin && isAdminAuthenticated === undefined) {
        return <LoadingSpinner fullScreen text="Verifying access..." />;
    }

    // Block regular users from admin areas
    if (requireAdmin && isAuthenticated && !isAdminAuthenticated) {
        return (
            <UnauthorizedAccess 
                type="admin-only"
                message="This area is restricted to Fresh administrative personnel only. Regular customer accounts cannot access admin features."
            />
        );
    }

    // Admin login page should be accessible
    if (location.pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Other admin routes require authentication
    if (requireAdmin && !isAdminAuthenticated) {
        return (
            <UnauthorizedAccess 
                type="unauthorized"
                message="You must be logged in as an administrator to access this area."
            />
        );
    }

    return <>{children}</>;
};

export default AdminRouteGuard;