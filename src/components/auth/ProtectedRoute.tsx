import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { LoginModal } from './LoginModal';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuthStore();
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Show login modal automatically if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-primary" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Login Required
                        </h1>

                        <p className="text-gray-600 mb-6">
                            Please log in to access this feature and start shopping for fresh groceries.
                        </p>

                        <Button
                            onClick={() => setShowLoginModal(true)}
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Login to Continue
                        </Button>
                    </div>
                </div>

                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                />
            </>
        );
    }

    return <>{children}</>;
}