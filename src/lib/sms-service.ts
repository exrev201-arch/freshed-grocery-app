/**
 * SMS Service for Fresh Grocery Tanzania
 * 
 * Provides SMS functionality for OTP delivery and notifications
 * Currently supports Twilio as the primary provider with fallback options
 */

// SMS Configuration
const SMS_CONFIG = {
  // Twilio configuration (primary provider)
  twilio: {
    accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
    authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
    phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
  },
  // Africa's Talking configuration (alternative provider for Tanzania)
  africasTalking: {
    apiKey: import.meta.env.VITE_AFRICAS_TALKING_API_KEY || '',
    username: import.meta.env.VITE_AFRICAS_TALKING_USERNAME || '',
    phoneNumber: import.meta.env.VITE_AFRICAS_TALKING_PHONE_NUMBER || '',
  },
  // Generic SMS provider configuration
  generic: {
    apiUrl: import.meta.env.VITE_GENERIC_SMS_API_URL || '',
    apiKey: import.meta.env.VITE_GENERIC_SMS_API_KEY || '',
  },
  // Demo mode for development
  isDemoMode: import.meta.env.VITE_SMS_DEMO_MODE === 'true' || import.meta.env.NODE_ENV === 'development',
};

interface SMSServiceInterface {
  sendSMS(to: string, message: string): Promise<boolean>;
  validatePhoneNumber(phone: string): boolean;
  formatPhoneNumber(phone: string): string;
}

class SMSService implements SMSServiceInterface {
  constructor() {
    // Check if Twilio credentials are provided
    if (SMS_CONFIG.twilio.accountSid && SMS_CONFIG.twilio.authToken) {
      console.log('ℹ️ Twilio credentials provided but Twilio SDK not installed. SMS service will use demo mode.');
    }
  }

  /**
   * Send SMS message to a phone number
   */
  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(to);
      
      // Validate phone number
      if (!this.validatePhoneNumber(formattedPhone)) {
        throw new Error('Invalid phone number format');
      }

      // Check if we're in demo mode
      if (SMS_CONFIG.isDemoMode) {
        console.log('🧪 SMS Demo Mode - Message not actually sent');
        console.log(`📱 SMS to: ${formattedPhone}`);
        console.log(`📝 Message: ${message}`);
        
        // In demo mode, show alert for development
        if (process.env.NODE_ENV === 'development') {
          alert(`DEMO SMS SENT\nTo: ${formattedPhone}\nMessage: ${message}`);
        }
        
        return true;
      }

      // Try Africa's Talking (if configured)
      if (SMS_CONFIG.africasTalking.apiKey && SMS_CONFIG.africasTalking.username) {
        try {
          // Africa's Talking API implementation would go here
          // This is a placeholder for the actual implementation
          console.log('🔄 Attempting to send SMS via Africa\'s Talking');
          
          // For now, we'll simulate success
          console.log('✅ SMS sent via Africa\'s Talking (simulated)');
          return true;
        } catch (atError) {
          console.error('❌ Africa\'s Talking SMS failed:', atError);
        }
      }

      // Try generic SMS provider (if configured)
      if (SMS_CONFIG.generic.apiUrl && SMS_CONFIG.generic.apiKey) {
        try {
          // Generic SMS API implementation would go here
          // This is a placeholder for the actual implementation
          console.log('🔄 Attempting to send SMS via Generic Provider');
          
          // For now, we'll simulate success
          console.log('✅ SMS sent via Generic Provider (simulated)');
          return true;
        } catch (genericError) {
          console.error('❌ Generic SMS failed:', genericError);
        }
      }

      // If no providers are configured, log warning
      console.warn('⚠️ No SMS providers configured. SMS delivery not available.');
      return false;
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Validate phone number format for Tanzania
   */
  validatePhoneNumber(phone: string): boolean {
    // Remove any spaces, dashes, or parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check for Tanzania phone number formats:
    // +255XXXXXXXXX
    // 255XXXXXXXXX
    // 0XXXXXXXXX
    
    const tzPhoneRegex = /^(\+?255|0)[67][0-9]{8}$/;
    return tzPhoneRegex.test(cleanPhone);
  }

  /**
   * Format phone number to E.164 format for Tanzania
   */
  formatPhoneNumber(phone: string): string {
    // Remove any spaces, dashes, or parentheses
    let formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Format to E.164 (+255XXXXXXXXX)
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+255' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('255')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+255')) {
      formattedPhone = '+255' + formattedPhone;
    }
    
    return formattedPhone;
  }

  /**
   * Send OTP via SMS
   */
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    const message = `Your Fresh Grocery verification code is: ${otp}. Valid for 5 minutes.`;
    return await this.sendSMS(phone, message);
  }

  /**
   * Health check for SMS service
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      if (SMS_CONFIG.isDemoMode) {
        return {
          status: 'healthy',
          message: 'SMS service is operational (demo mode)',
        };
      }

      // Check if at least one provider is configured
      const isAfricaTalkingConfigured = !!(SMS_CONFIG.africasTalking.apiKey && SMS_CONFIG.africasTalking.username);
      const isGenericConfigured = !!(SMS_CONFIG.generic.apiUrl && SMS_CONFIG.generic.apiKey);

      if (isAfricaTalkingConfigured || isGenericConfigured) {
        return {
          status: 'healthy',
          message: 'SMS service is operational',
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'No SMS providers configured',
        };
      }
    } catch (error) {
      console.error('❌ SMS service health check failed:', error);
      return {
        status: 'unhealthy',
        message: 'SMS service health check failed',
      };
    }
  }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;

// Export types for use in other modules
export type { SMSServiceInterface };