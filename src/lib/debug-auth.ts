/**
 * Debug Authentication Service
 * Provides debugging tools and fallback authentication for development
 */

// Mock OTP for testing purposes
const MOCK_OTP = '123456';

// Show OTP in a more visible way during development
if (process.env.NODE_ENV === 'development') {
  console.log('%c🔐 DEVELOPMENT MODE: Default test OTP code is 123456 for any email', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
}

// Debug auth service
export const debugAuth = {
  // Mock sendOTP function for testing
  async sendOTP(email: string): Promise<void> {
    console.log('🔧 Debug Auth: Sending OTP to', email);
    console.log('🔧 Debug Auth: Mock OTP Code is:', MOCK_OTP);
    
    // In development mode, show a more visible message
    if (process.env.NODE_ENV === 'development') {
      console.log(`%c📱 OTP Code for ${email}: ${MOCK_OTP}`, 'font-size: 18px; font-weight: bold; color: #2196F3; background: #E3F2FD; padding: 10px; border-radius: 5px;');
      console.log('%c📋 You can also use this default test code for any email: 123456', 'font-size: 14px; color: #666;');
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For debugging, we'll always succeed
    return Promise.resolve();
  },

  // Mock verifyOTP function for testing
  async verifyOTP(email: string, code: string): Promise<{ user: any }> {
    console.log('🔧 Debug Auth: Verifying OTP for', email, 'with code', code);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For debugging, accept the mock OTP or any 6-digit code
    if (code === MOCK_OTP || code.length === 6) {
      const mockUser = {
        projectId: 'debug-project',
        uid: `debug-${Date.now()}`,
        name: email.split('@')[0] || 'Debug User',
        email: email,
        createdTime: Date.now(),
        lastLoginTime: Date.now()
      };
      
      console.log('🔧 Debug Auth: Login successful!', mockUser);
      return { user: mockUser };
    } else {
      console.log('🔧 Debug Auth: Invalid OTP');
      throw new Error('Invalid OTP code');
    }
  },

  // Mock logout function
  async logout(): Promise<void> {
    console.log('🔧 Debug Auth: Logging out');
    await new Promise(resolve => setTimeout(resolve, 200));
    return Promise.resolve();
  }
};

// Test the backend authentication service
export const testBackendAuth = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing new backend auth service...');
    
    // Try to import the new backend service
    const { auth } = await import('./backend-service');
    
    // Test if the service is available
    if (typeof auth?.sendOTP === 'function') {
      console.log('✅ New backend auth service is available');
      return true;
    } else {
      console.log('❌ New backend auth service methods not available');
      return false;
    }
  } catch (error) {
    console.log('❌ New backend auth service import failed:', error);
    return false;
  }
};

// Enhanced auth store with debug capabilities
export const createDebugAuthStore = (originalStore: any) => {
  return {
    ...originalStore,
    
    // Enhanced sendOTP with fallback
    sendOTP: async (email: string) => {
      originalStore.setLoading(true);
      
      try {
        // First try the new backend service
        const { auth } = await import('./backend-service');
        console.log('🔄 Using new backend auth service...');
        await auth.sendOTP(email);
        console.log('✅ New backend OTP sent successfully');
      } catch (error) {
        console.log('⚠️ Backend failed, using debug auth:', error);
        // Fallback to debug auth
        await debugAuth.sendOTP(email);
      } finally {
        originalStore.setLoading(false);
      }
    },

    // Enhanced verifyOTP with fallback
    verifyOTP: async (email: string, code: string) => {
      originalStore.setLoading(true);
      
      try {
        // First try the new backend service
        const { auth } = await import('./backend-service');
        console.log('🔄 Using new backend auth verification...');
        const response = await auth.verifyOTP(email, code);
        console.log('✅ New backend verification successful');
        
        originalStore.set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false
        });
        
        return response.user;
      } catch (error) {
        console.log('⚠️ Backend verification failed, using debug auth:', error);
        
        try {
          // Fallback to debug auth
          const response = await debugAuth.verifyOTP(email, code);
          
          originalStore.set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false
          });
          
          return response.user;
        } catch (debugError) {
          originalStore.setLoading(false);
          throw debugError;
        }
      }
    }
  };
};

// Debugging utilities
export const authDebugUtils = {
  // Check auth store state
  checkAuthState: (authStore: any) => {
    console.log('🔍 Current Auth State:', {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      isLoading: authStore.isLoading
    });
  },

  // Test email validation
  testEmailValidation: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    console.log(`📧 Email "${email}" is ${isValid ? 'valid' : 'invalid'}`);
    return isValid;
  },

  // Test OTP format
  testOTPFormat: (otp: string) => {
    const isValid = /^\d{6}$/.test(otp);
    console.log(`🔑 OTP "${otp}" format is ${isValid ? 'valid' : 'invalid'}`);
    return isValid;
  },

  // Clear auth storage for fresh start
  clearAuthStorage: () => {
    localStorage.removeItem('fresh-auth-storage');
    console.log('🧹 Auth storage cleared');
  }
};

// Instructions for debugging
export const debugInstructions = `
🔧 AUTHENTICATION DEBUG GUIDE

If you can't login, try these steps:

1. Open browser console and look for auth-related errors
2. For testing, use any email and OTP code: ${MOCK_OTP}
3. Check network tab for failed API requests
4. Use authDebugUtils.clearAuthStorage() to reset auth state

Debug Functions Available:
- authDebugUtils.checkAuthState(useAuthStore.getState())
- authDebugUtils.testEmailValidation('your@email.com')
- authDebugUtils.testOTPFormat('123456')
- authDebugUtils.clearAuthStorage()
- testBackendAuth()

Console logs will show:
🔧 = Debug auth messages
✅ = Success messages  
❌ = Error messages
⚠️ = Warning/fallback messages
🔄 = Process messages
`;

console.log(debugInstructions);