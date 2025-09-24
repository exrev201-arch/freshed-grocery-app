/**
 * Login Debug Component
 * A test component to help debug login issues
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { LoginModal } from '@/components/auth/LoginModal';
import { authDebugUtils } from '@/lib/debug-auth';
import { AlertCircle, CheckCircle, User, LogOut, TestTube } from 'lucide-react';

export function LoginDebugComponent() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { user, isAuthenticated, isLoading, logout } = useAuthStore();

    const handleClearStorage = () => {
        authDebugUtils.clearAuthStorage();
        window.location.reload();
    };

    const handleCheckState = () => {
        authDebugUtils.checkAuthState(useAuthStore.getState());
    };

    const testEmail = 'test@fresh.co.tz';
    const testOTP = '123456';

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-80 shadow-lg">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <TestTube className="h-4 w-4" />
                        Login Debug Panel
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Auth Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge variant={isAuthenticated ? "default" : "secondary"}>
                            {isAuthenticated ? (
                                <><CheckCircle className="h-3 w-3 mr-1" /> Logged In</>
                            ) : (
                                <><AlertCircle className="h-3 w-3 mr-1" /> Not Logged In</>
                            )}
                        </Badge>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="p-2 bg-muted rounded text-xs">
                            <div><strong>User:</strong> {user.name}</div>
                            <div><strong>Email:</strong> {user.email}</div>
                            <div><strong>UID:</strong> {user.uid ? user.uid.substring(0, 8) + '...' : 'N/A'}</div>
                        </div>
                    )}

                    {/* Loading Status */}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            Loading...
                        </div>
                    )}

                    {/* Test Instructions */}
                    <div className="p-2 bg-blue-50 rounded text-xs">
                        <div className="font-medium mb-1">Test Credentials:</div>
                        <div><strong>Email:</strong> {testEmail}</div>
                        <div><strong>OTP:</strong> {testOTP}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        {!isAuthenticated ? (
                            <Button 
                                size="sm" 
                                onClick={() => setShowLoginModal(true)}
                                className="col-span-2"
                            >
                                <User className="h-3 w-3 mr-1" />
                                Test Login
                            </Button>
                        ) : (
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={logout}
                                className="col-span-2"
                            >
                                <LogOut className="h-3 w-3 mr-1" />
                                Logout
                            </Button>
                        )}
                        
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleCheckState}
                        >
                            Check State
                        </Button>
                        
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleClearStorage}
                        >
                            Clear Storage
                        </Button>
                    </div>

                    {/* Console Instructions */}
                    <div className="text-xs text-muted-foreground">
                        💡 Open browser console to see debug logs
                    </div>
                </CardContent>
            </Card>

            <LoginModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)} 
            />
        </div>
    );
}