import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminStore } from '@/store/admin-store';
import { adminService } from '@/lib/admin-service';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('admin@fresh.co.tz');
    const [password, setPassword] = useState('admin123');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { adminUser, isAdminAuthenticated, adminLogin } = useAdminStore();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Redirect if already logged in
    useEffect(() => {
        if (isAdminAuthenticated && adminUser) {
            navigate('/admin');
        }
    }, [isAdminAuthenticated, adminUser, navigate]);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // For demo purposes, we'll use a simple email-based login
            // In production, you'd want proper password authentication
            
            let adminUserData;
            
            try {
                // Try to find existing admin user by email
                adminUserData = await adminService.getAdminUserByEmail(email);
            } catch (error) {
                console.log('Admin user not found, creating initial admin...');
            }
            
            if (!adminUserData) {
                // Create initial admin user if doesn't exist
                adminUserData = await adminService.createAdminUser({
                    email: email,
                    name: 'Fresh Admin',
                    role: 'ADMIN',
                });
                
                toast({
                    title: t('adminAccountCreated'),
                    description: t('adminAccountCreatedDescription'),
                });
            }
            
            // Update last login
            await adminService.updateLastLogin(adminUserData._id, adminUserData._uid);
            
            // Login to admin store
            adminLogin(adminUserData);
            
            toast({
                title: t('loginSuccessful'),
                description: `${t('welcomeBack')} ${adminUserData.name}!`,
            });
            
            navigate('/admin');
            
        } catch (error: any) {
            console.error('Admin login error:', error);
            toast({
                title: t('loginFailed'),
                description: error.message || t('invalidCredentials'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/30 to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Home Button */}
                <div className="mb-6">
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('backToFresh')}
                    </Link>
                </div>

                <Card className="shadow-2xl border-0">
                    <CardHeader className="text-center pb-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-10 h-10 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{t('adminPortal')}</CardTitle>
                        <CardDescription className="text-base">
                            {t('signInToAccessAdminDashboard')}
                        </CardDescription>
                        
                        {/* Security Warning */}
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                                ⚠️ <strong>{t('authorizedPersonnelOnly')}</strong><br/>
                                {t('restrictedAreaWarning')}
                            </p>
                        </div>
                    </CardHeader>
                    
                    <CardContent>
                        <form onSubmit={handleAdminLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('emailAddress')}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@fresh.co.tz"
                                        className="pl-10"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="password">{t('password')}</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('enterYourPassword')}
                                        className="pr-10"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {t('signingIn')}
                                    </>
                                ) : (
                                    t('signIn')
                                )}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">{t('demoCredentials')}</h4>
                            <div className="text-xs text-blue-700 space-y-1">
                                <div><strong>{t('email')}:</strong> admin@fresh.co.tz</div>
                                <div><strong>{t('password')}:</strong> admin123</div>
                                <div className="text-blue-600 mt-2">
                                    💡 {t('demoCredentialsNote')}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                {t('protectedAdminArea')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminLoginPage;