import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { debugAuth, authDebugUtils } from '../lib/debug-auth';
import { logger } from '../lib/logger';

interface User {
    projectId: string;
    uid: string;
    name: string;
    email: string;
    phone?: string;
    createdTime: number;
    lastLoginTime: number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    sendOTP: (identifier: string) => Promise<void>;
    sendSMSOTP: (phone: string) => Promise<void>;
    verifyOTP: (identifier: string, code: string) => Promise<User>;
    logout: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            sendOTP: async (identifier: string) => {
                set({ isLoading: true });
                logger.info('Starting OTP send process', 'AUTH', { identifier });
                
                try {
                    // Validate identifier format first
                    const isEmail = identifier.includes('@');
                    if (isEmail && !authDebugUtils.testEmailValidation(identifier)) {
                        throw new Error('Invalid email format');
                    }
                    
                    const isPhone = /^[\+]?[0-9\s\-\(\)]+$/.test(identifier);
                    if (isPhone && identifier.length < 9) {
                        throw new Error('Invalid phone number format');
                    }

                    // Try the new backend service first
                    try {
                        const { auth } = await import('../lib/backend-service');
                        logger.info('Using new backend auth service', 'AUTH');
                        await auth.sendOTP(identifier);
                        logger.info('New backend OTP sent successfully', 'AUTH');
                    } catch (backendError) {
                        logger.warn('New backend failed, using debug auth', 'AUTH', backendError);
                        // Fallback to debug auth
                        await debugAuth.sendOTP(identifier);
                    }
                } catch (error) {
                    logger.error('OTP send failed', 'AUTH', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            sendSMSOTP: async (phone: string) => {
                set({ isLoading: true });
                logger.info('Starting SMS OTP send process', 'AUTH', { phone });
                
                try {
                    // Validate phone format first
                    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
                    if (!phoneRegex.test(phone) || phone.length < 9) {
                        throw new Error('Invalid phone number format');
                    }

                    // Try the new backend service first
                    try {
                        const { auth } = await import('../lib/backend-service');
                        logger.info('Using new backend auth service for SMS', 'AUTH');
                        // Check if the auth service has sendSMSOTP method
                        if (typeof (auth as any).sendSMSOTP === 'function') {
                            await (auth as any).sendSMSOTP(phone);
                        } else {
                            // Fallback to regular sendOTP for phone
                            await auth.sendOTP(phone);
                        }
                        logger.info('New backend SMS OTP sent successfully', 'AUTH');
                    } catch (backendError) {
                        logger.warn('New backend failed, using debug auth for SMS', 'AUTH', backendError);
                        // Fallback to debug auth
                        await debugAuth.sendOTP(phone);
                    }
                } catch (error) {
                    logger.error('SMS OTP send failed', 'AUTH', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            verifyOTP: async (identifier: string, code: string) => {
                set({ isLoading: true });
                console.log('🔄 Starting OTP verification for:', identifier, 'with code:', code);
                
                try {
                    // Validate OTP format first
                    if (!authDebugUtils.testOTPFormat(code)) {
                        throw new Error('Invalid OTP format - must be 6 digits');
                    }

                    let response;
                    
                    // Try the new backend service first
                    try {
                        const { auth } = await import('../lib/backend-service');
                        console.log('🔄 Using new backend auth service...');
                        response = await auth.verifyOTP(identifier, code);
                        console.log('✅ New backend verification successful');
                    } catch (backendError) {
                        console.log('⚠️ New backend verification failed, using debug auth:', backendError);
                        // Fallback to debug auth
                        response = await debugAuth.verifyOTP(identifier, code);
                    }
                    
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    
                    console.log('✅ User authenticated successfully:', response.user);
                    return response.user;
                } catch (error) {
                    console.log('❌ OTP verification failed:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                console.log('🔄 Starting logout process...');
                
                try {
                    // Try the new backend service first
                    try {
                        const { auth } = await import('../lib/backend-service');
                        await auth.logout();
                        console.log('✅ New backend logout successful');
                    } catch (backendError) {
                        console.log('⚠️ New backend logout failed, using debug auth:', backendError);
                        // Fallback to debug auth
                        await debugAuth.logout();
                    }
                    
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    
                    console.log('✅ User logged out successfully');
                } catch (error) {
                    console.log('❌ Logout failed:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            }
        }),
        {
            name: 'fresh-auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);