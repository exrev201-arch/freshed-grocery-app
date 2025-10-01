import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { debugAuth, authDebugUtils } from '../lib/debug-auth';
import { logger } from '../lib/logger';

interface User {
    projectId: string;
    uid: string;
    name: string;
    email: string;
    createdTime: number;
    lastLoginTime: number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    sendOTP: (email: string) => Promise<void>;
    verifyOTP: (email: string, code: string) => Promise<User>;
    logout: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            sendOTP: async (email: string) => {
                set({ isLoading: true });
                logger.info('Starting OTP send process', 'AUTH', { email });
                
                try {
                    // Validate email format first
                    if (!authDebugUtils.testEmailValidation(email)) {
                        throw new Error('Invalid email format');
                    }

                    // Try the new backend service first
                    try {
                        const { auth } = await import('../lib/backend-service');
                        logger.info('Using new backend auth service', 'AUTH');
                        await auth.sendOTP(email);
                        logger.info('New backend OTP sent successfully', 'AUTH');
                    } catch (backendError) {
                        logger.warn('New backend failed, using debug auth', 'AUTH', backendError);
                        // Fallback to debug auth
                        await debugAuth.sendOTP(email);
                    }
                } catch (error) {
                    logger.error('OTP send failed', 'AUTH', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            verifyOTP: async (email: string, code: string) => {
                set({ isLoading: true });
                console.log('🔄 Starting OTP verification for:', email, 'with code:', code);
                
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
                        response = await auth.verifyOTP(email, code);
                        console.log('✅ New backend verification successful');
                    } catch (backendError) {
                        console.log('⚠️ New backend verification failed, using debug auth:', backendError);
                        // Fallback to debug auth
                        response = await debugAuth.verifyOTP(email, code);
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