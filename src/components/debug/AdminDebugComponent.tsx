/**
 * Admin Debug Component
 * A test component to help with admin login and permissions
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminStore } from '@/store/admin-store';
import { adminService } from '@/lib/admin-service';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserCheck, Settings, LogOut, Database } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function AdminDebugComponent() {
    const [email, setEmail] = useState('admin@fresh.co.tz');
    const [isLoading, setIsLoading] = useState(false);
    const { adminUser, isAdminAuthenticated, adminLogin, adminLogout, hasPermission } = useAdminStore();
    const { toast } = useToast();
    const { t } = useLanguage();

    const handleAdminLogin = async () => {
        setIsLoading(true);
        try {
            // Try to find admin user by email
            const adminUserData = await adminService.getAdminUserByEmail(email);
            
            if (adminUserData) {
                // Update last login
                await adminService.updateLastLogin(adminUserData._id, adminUserData._uid);
                
                // Login to admin store
                adminLogin(adminUserData);
                
                toast({
                    title: t('adminLoginSuccessful'),
                    description: `${t('welcome')} ${adminUserData.name}!`,
                });
            } else {
                toast({
                    title: t('adminNotFound'),
                    description: t('creatingInitialAdmin'),
                    variant: "destructive",
                });
                
                // Try to create initial admin
                await createInitialAdmin();
            }
        } catch (error) {
            console.error('Admin login error:', error);
            toast({
                title: t('loginFailed'),
                description: t('failedToLoginAsAdmin'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const createInitialAdmin = async () => {
        try {
            // Create initial admin user
            const newAdmin = await adminService.createAdminUser({
                email: 'admin@fresh.co.tz',
                name: 'Fresh Admin',
                role: 'ADMIN',
            });
            
            adminLogin(newAdmin);
            
            toast({
                title: t('adminCreatedLoggedIn'),
                description: t('initialAdminCreated'),
            });
        } catch (error) {
            console.error('Error creating admin:', error);
            toast({
                title: t('failedToCreateAdmin'),
                description: t('couldNotCreateInitialAdmin'),
                variant: "destructive",
            });
        }
    };

    const testPermissions = () => {
        const permissions = ['read', 'write', 'delete', 'admin'] as const;
        console.log(t('adminPermissionsTest'));
        permissions.forEach(permission => {
            const hasAccess = hasPermission(permission);
            console.log(`${permission}: ${hasAccess ? `✅ ${t('allowed')}` : `❌ ${t('denied')}`}`);
        });
        
        toast({
            title: t('permissionTestComplete'),
            description: t('checkConsoleForResults'),
        });
    };

    const goToAdminDashboard = () => {
        window.location.href = '/admin';
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <Card className="w-80 shadow-lg">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4" />
                        {t('adminDebugPanel')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Admin Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm">{t('adminStatus')}:</span>
                        <Badge variant={isAdminAuthenticated ? "default" : "secondary"}>
                            {isAdminAuthenticated ? (
                                <><UserCheck className="h-3 w-3 mr-1" /> {t('adminLoggedIn')}</>
                            ) : (
                                <><Shield className="h-3 w-3 mr-1" /> {t('notAdmin')}</>
                            )}
                        </Badge>
                    </div>

                    {/* Admin Info */}
                    {adminUser && (
                        <div className="p-2 bg-muted rounded text-xs">
                            <div><strong>{t('name')}:</strong> {adminUser.name}</div>
                            <div><strong>{t('email')}:</strong> {adminUser.email}</div>
                            <div><strong>{t('role')}:</strong> {adminUser.role}</div>
                            <div><strong>{t('status')}:</strong> {adminUser.is_active}</div>
                        </div>
                    )}

                    {/* Login Form */}
                    {!isAdminAuthenticated && (
                        <div className="space-y-2">
                            <div>
                                <Label htmlFor="admin-email" className="text-xs">{t('adminEmail')}</Label>
                                <Input
                                    id="admin-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@fresh.co.tz"
                                    className="text-xs"
                                />
                            </div>
                            <Button 
                                size="sm" 
                                onClick={handleAdminLogin}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? t('loggingIn') : t('loginAsAdmin')}
                            </Button>
                        </div>
                    )}

                    {/* Admin Actions */}
                    {isAdminAuthenticated && (
                        <div className="grid grid-cols-2 gap-2">
                            <Button 
                                size="sm" 
                                onClick={goToAdminDashboard}
                                className="text-xs"
                            >
                                <Settings className="h-3 w-3 mr-1" />
                                {t('dashboard')}
                            </Button>
                            
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={testPermissions}
                                className="text-xs"
                            >
                                {t('testPerms')}
                            </Button>
                            
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={adminLogout}
                                className="col-span-2 text-xs"
                            >
                                <LogOut className="h-3 w-3 mr-1" />
                                {t('logoutAdmin')}
                            </Button>
                        </div>
                    )}

                    {/* Default Credentials */}
                    <div className="p-2 bg-blue-50 rounded text-xs">
                        <div className="font-medium mb-1">{t('defaultAdmin')}:</div>
                        <div><strong>{t('email')}:</strong> admin@fresh.co.tz</div>
                        <div><strong>{t('role')}:</strong> admin ({t('fullAccess')})</div>
                    </div>

                    {/* Instructions */}
                    <div className="text-xs text-muted-foreground">
                        💡 {t('adminUsesSeparateAuth')}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}