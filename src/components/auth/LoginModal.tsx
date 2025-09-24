import { useState } from 'react';
import { X, Shield, ArrowLeft, User, UserPlus, Eye, EyeOff, Phone, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [step, setStep] = useState<'auth' | 'otp'>('auth');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loginIdentifier, setLoginIdentifier] = useState(''); // email or phone
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOTP] = useState('');
    const [activeTab, setActiveTab] = useState('login');
    const { sendOTP, verifyOTP, isLoading } = useAuthStore();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginIdentifier.trim()) {
            toast({
                title: "Email/Phone Required",
                description: "Please enter your email address or phone number.",
                variant: "destructive",
            });
            return;
        }

        if (!password.trim()) {
            toast({
                title: "Password Required",
                description: "Please enter your password.",
                variant: "destructive",
            });
            return;
        }

        try {
            // For demo purposes, simulate login with OTP flow
            // In production, this would validate password against backend
            await sendOTP(loginIdentifier);
            setStep('otp');
            toast({
                title: "Verification Code Sent!",
                description: "Check your email/SMS for the verification code.",
            });
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: "Login Failed",
                description: "Invalid credentials. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({
                title: "Name Required",
                description: "Please enter your full name.",
                variant: "destructive",
            });
            return;
        }

        if (!email.trim()) {
            toast({
                title: "Email Required",
                description: "Please enter your email address.",
                variant: "destructive",
            });
            return;
        }

        if (!phone.trim()) {
            toast({
                title: "Phone Required",
                description: "Please enter your phone number.",
                variant: "destructive",
            });
            return;
        }

        if (!password.trim()) {
            toast({
                title: "Password Required",
                description: "Please enter your password.",
                variant: "destructive",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Passwords Don't Match",
                description: "Please make sure both passwords match.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Password Too Short",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        try {
            // For demo purposes, simulate signup with OTP verification
            await sendOTP(email);
            setStep('otp');
            toast({
                title: "Account Created!",
                description: "Please verify your email to complete registration.",
            });
        } catch (error) {
            console.error('Signup error:', error);
            toast({
                title: "Signup Failed",
                description: "Failed to create account. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) {
            toast({
                title: "Code Required",
                description: "Please enter the verification code.",
                variant: "destructive",
            });
            return;
        }

        try {
            const identifier = activeTab === 'login' ? loginIdentifier : email;
            await verifyOTP(identifier, otp);
            toast({
                title: "Welcome to Fresh!",
                description: activeTab === 'login' 
                    ? "You've successfully logged in."
                    : "Your account has been created successfully!",
            });
            onClose();
            // Reset form
            setStep('auth');
            setEmail('');
            setOTP('');
        } catch (error) {
            console.error('OTP verification error:', error);
            toast({
                title: "Invalid Code",
                description: "The verification code is incorrect. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleBack = () => {
        setStep('auth');
        setOTP('');
    };

    const handleClose = () => {
        onClose();
        // Reset form after a short delay to avoid jarring transitions
        setTimeout(() => {
            setStep('auth');
            setEmail('');
            setPhone('');
            setPassword('');
            setConfirmPassword('');
            setName('');
            setLoginIdentifier('');
            setOTP('');
            setActiveTab('login');
            setShowPassword(false);
            setShowConfirmPassword(false);
        }, 200);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        {step === 'auth' ? (
                            activeTab === 'login' ? (
                                <User className="w-8 h-8 text-primary" />
                            ) : (
                                <UserPlus className="w-8 h-8 text-primary" />
                            )
                        ) : (
                            <Shield className="w-8 h-8 text-primary" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {step === 'auth' 
                            ? (activeTab === 'login' ? 'Welcome Back' : 'Join Fresh Today')
                            : 'Enter Verification Code'
                        }
                    </h2>
                    <p className="text-gray-600">
                        {step === 'auth'
                            ? (activeTab === 'login' 
                                ? 'Sign in to continue shopping for fresh groceries'
                                : 'Create your account and start shopping for fresh groceries'
                              )
                            : `We sent a 6-digit code to ${activeTab === 'login' ? loginIdentifier : email}. For testing, you can use: 123456`
                        }
                    </p>
                </div>

                {step === 'auth' ? (
                    <div key="auth">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="login" className="mt-4">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <Label htmlFor="login-identifier">Email or Phone Number</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                id="login-identifier"
                                                type="text"
                                                value={loginIdentifier}
                                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                                placeholder="your@email.com or +255 XXX XXX XXX"
                                                className="mt-1 pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="login-password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="login-password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="mt-1 pr-10"
                                                required
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
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Signing In...' : 'Sign In'}
                                    </Button>
                                </form>
                            </TabsContent>
                            
                            <TabsContent value="signup" className="mt-4">
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div>
                                        <Label htmlFor="signup-name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your full name"
                                                className="mt-1 pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="signup-email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="mt-1 pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="signup-phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                id="signup-phone"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+255 XXX XXX XXX"
                                                className="mt-1 pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="signup-password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="signup-password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Create a password"
                                                className="mt-1 pr-10"
                                                required
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
                                    
                                    <div>
                                        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="signup-confirm-password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm your password"
                                                className="mt-1 pr-10"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div key="otp">
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <Label htmlFor="otp">Verification Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOTP(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="mt-1 text-center text-lg tracking-widest"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Login'}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBack}
                                className="w-full"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Email
                            </Button>
                        </form>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 text-center">
                        By continuing, you agree to Fresh&apos;s terms of service and privacy policy.
                    </p>
                </div>
            </div>
        </div>
    );
}