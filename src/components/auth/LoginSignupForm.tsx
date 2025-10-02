/**
 * Login/Signup Form Component for Fresh Grocery Tanzania
 * 
 * Provides a unified authentication experience supporting both email and phone number
 * with OTP verification via email or SMS
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, Loader2, User } from 'lucide-react';
import { parsePhoneNumber } from 'libphonenumber-js';

type AuthMethod = 'email' | 'phone';
type AuthStep = 'identifier' | 'otp' | 'signup';

interface LoginSignupFormProps {
  onAuthSuccess?: () => void;
}

const LoginSignupForm: React.FC<LoginSignupFormProps> = ({ onAuthSuccess }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { sendOTP, sendSMSOTP, verifyOTP, isLoading } = useAuthStore();
  
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [authStep, setAuthStep] = useState<AuthStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateIdentifier = (value: string): boolean => {
    if (authMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    } else {
      // For phone numbers, we'll do basic validation
      try {
        const phoneNumber = parsePhoneNumber(value, 'TZ');
        return phoneNumber.isValid();
      } catch {
        // Fallback validation for Tanzania phone numbers
        const phoneRegex = /^(\+?255|0)[67][0-9]{8}$/;
        return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
      }
    }
  };

  const handleSendOTP = async () => {
    setError('');
    
    if (!identifier.trim()) {
      setError(authMethod === 'email' ? t('emailRequired') : t('phoneRequired'));
      return;
    }
    
    if (!validateIdentifier(identifier)) {
      setError(authMethod === 'email' ? t('enterEmailAddress') : t('enterPhoneNumber'));
      return;
    }

    try {
      if (authMethod === 'email') {
        await sendOTP(identifier);
        toast({
          title: t('verificationCodeSent'),
          description: `${t('checkEmailSMSForCode')} ${identifier}`,
        });
      } else {
        await sendSMSOTP(identifier);
        toast({
          title: t('verificationCodeSent'),
          description: `${t('checkEmailSMSForCode')} ${identifier}`,
        });
      }
      
      setAuthStep('otp');
      setCountdown(60); // 60 second cooldown for resend
    } catch (err: any) {
      setError(err.message || t('failedToSendOTP'));
      toast({
        title: t('loginFailed'),
        description: err.message || t('failedToSendOTP'),
        variant: 'destructive',
      });
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    
    if (!otp.trim()) {
      setError(t('codeRequired'));
      return;
    }
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError(t('enter6DigitCode'));
      return;
    }

    try {
      const user = await verifyOTP(identifier, otp);
      
      toast({
        title: t('welcomeToFresh'),
        description: t('successfullyLoggedIn'),
      });
      
      // Call success callback or navigate to home
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || t('invalidCode'));
      toast({
        title: t('loginFailed'),
        description: err.message || t('incorrectVerificationCode'),
        variant: 'destructive',
      });
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      if (authMethod === 'email') {
        await sendOTP(identifier);
      } else {
        await sendSMSOTP(identifier);
      }
      
      setCountdown(60);
      toast({
        title: t('verificationCodeSent'),
        description: t('checkEmailSMSForCode'),
      });
    } catch (err: any) {
      setError(err.message || t('failedToSendOTP'));
      toast({
        title: t('loginFailed'),
        description: err.message || t('failedToSendOTP'),
        variant: 'destructive',
      });
    }
  };

  const handleBackToIdentifier = () => {
    setAuthStep('identifier');
    setOtp('');
    setError('');
  };

  const renderIdentifierStep = () => (
    <div className="space-y-4">
      <RadioGroup 
        value={authMethod} 
        onValueChange={(value) => setAuthMethod(value as AuthMethod)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="email" id="email" />
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {t('email')}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="phone" id="phone" />
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {t('phone')}
          </Label>
        </div>
      </RadioGroup>

      <div className="space-y-2">
        <Label htmlFor="identifier">
          {authMethod === 'email' ? t('emailAddress') : t('phoneNumber')}
        </Label>
        <div className="relative">
          <Input
            id="identifier"
            type={authMethod === 'email' ? 'email' : 'tel'}
            placeholder={
              authMethod === 'email' 
                ? t('emailOrPhonePlaceholder') 
                : t('phoneNumberPlaceholderSw')
            }
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {authMethod === 'email' ? (
              <Mail className="h-4 w-4 text-gray-400" />
            ) : (
              <Phone className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSendOTP} 
        disabled={isLoading || !identifier.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('sending')}
          </>
        ) : (
          t('sendOTP')
        )}
      </Button>
    </div>
  );

  const renderOTPStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('verificationCodeSentTo')} {identifier}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('forTestingUseCode')} <span className="font-mono font-bold">123456</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp">{t('verificationCodeLogin')}</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={t('enter6DigitCode')}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          disabled={isLoading}
          maxLength={6}
          className="text-center text-2xl tracking-widest"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={handleBackToIdentifier}
          disabled={isLoading}
          className="flex-1"
        >
          {t('back')}
        </Button>
        <Button 
          onClick={handleVerifyOTP} 
          disabled={isLoading || otp.length !== 6}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('verifying')}
            </>
          ) : (
            t('verifyAndLogin')
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        <Button
          variant="link"
          onClick={handleResendOTP}
          disabled={isLoading || countdown > 0}
          className="p-0 h-auto"
        >
          {countdown > 0 
            ? `${t('resendIn')} ${countdown}s` 
            : t('resendOTP')}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="h-6 w-6" />
          {t('welcomeBack')}
        </CardTitle>
        <CardDescription>
          {authStep === 'identifier' 
            ? t('signInToContinueShopping') 
            : t('enter6DigitCode')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authStep === 'identifier' ? renderIdentifierStep() : renderOTPStep()}
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <p className="text-xs text-muted-foreground text-center">
          {t('byContinuingYouAgree')}
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginSignupForm;