# SMS Service Setup Guide

This guide explains how to set up SMS functionality for OTP delivery in the Fresh Grocery Tanzania application.

## Overview

The application now supports sending OTP codes via SMS in addition to email. This provides users with more flexibility in how they receive verification codes.

## Supported SMS Providers

1. **Twilio** (Recommended)
2. **Africa's Talking** (Alternative for African markets)
3. **Generic SMS Provider** (Custom integration)

## Setup Instructions

### 1. Twilio Setup (Recommended)

1. Sign up for a Twilio account at https://www.twilio.com/
2. Purchase a phone number with SMS capabilities
3. Get your Account SID and Auth Token from the Twilio Console
4. Add the following environment variables to your `.env` file:

```env
VITE_TWILIO_ACCOUNT_SID=your_account_sid_here
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_PHONE_NUMBER=+255your_twilio_number_here
```

### 2. Africa's Talking Setup (Alternative)

1. Sign up for an Africa's Talking account at https://africastalking.com/
2. Create a new application
3. Get your API Key and Username
4. Add the following environment variables to your `.env` file:

```env
VITE_AFRICAS_TALKING_API_KEY=your_api_key_here
VITE_AFRICAS_TALKING_USERNAME=your_username_here
VITE_AFRICAS_TALKING_PHONE_NUMBER=+255your_sender_number_here
```

### 3. Generic SMS Provider Setup

If you're using a different SMS provider, you can configure it using:

```env
VITE_GENERIC_SMS_API_URL=your_sms_api_endpoint_here
VITE_GENERIC_SMS_API_KEY=your_api_key_here
```

You'll need to implement the actual integration in the `sms-service.ts` file.

## Environment Variables

Add the following to your `.env` file:

```env
# SMS Configuration
VITE_SMS_DEMO_MODE=false

# Twilio (Primary)
VITE_TWILIO_ACCOUNT_SID=
VITE_TWILIO_AUTH_TOKEN=
VITE_TWILIO_PHONE_NUMBER=

# Africa's Talking (Alternative)
VITE_AFRICAS_TALKING_API_KEY=
VITE_AFRICAS_TALKING_USERNAME=
VITE_AFRICAS_TALKING_PHONE_NUMBER=

# Generic Provider (Custom)
VITE_GENERIC_SMS_API_URL=
VITE_GENERIC_SMS_API_KEY=
```

## Testing in Development

1. Set `VITE_SMS_DEMO_MODE=true` in your `.env` file
2. When you send an SMS OTP, it will be displayed in the browser console and as an alert
3. You can use the default test code `123456` for any phone number

## Implementation Details

### Authentication Flow

1. User enters their phone number
2. System sends OTP via SMS using the configured provider
3. User receives SMS with 6-digit code
4. User enters code in the app
5. System verifies code and authenticates user

### Phone Number Validation

The system validates Tanzanian phone numbers in the following formats:
- +255XXXXXXXXX
- 255XXXXXXXXX
- 0XXXXXXXXX

Where X is a digit and the second digit is 6 or 7 (indicating mobile networks).

### Error Handling

The system includes comprehensive error handling:
- Network failures
- Invalid phone numbers
- Provider-specific errors
- Fallback mechanisms

## Usage in Components

To send an SMS OTP:

```typescript
import { useAuthStore } from '@/store/auth-store';

const { sendSMSOTP } = useAuthStore();

// Send OTP to phone number
await sendSMSOTP('+255712345678');
```

## Customization

You can customize the SMS message template in `sms-service.ts`:

```typescript
const message = `Your Fresh Grocery verification code is: ${otp}. Valid for 5 minutes.`;
```

## Troubleshooting

### No SMS Received

1. Check that `VITE_SMS_DEMO_MODE` is set to `false`
2. Verify your provider credentials are correct
3. Ensure your phone number is in the correct format
4. Check the browser console for error messages

### Provider Not Working

1. Verify API credentials
2. Check that your account has sufficient balance
3. Ensure your sender number is properly configured
4. Check provider-specific documentation

### Development Testing

In development mode:
- SMS messages are displayed in the console
- An alert is shown with the message content
- You can use `123456` as the test OTP code

## Security Considerations

1. Never commit API keys to version control
2. Use environment variables for sensitive data
3. Rotate API keys periodically
4. Monitor SMS usage for unusual activity
5. Implement rate limiting to prevent abuse

## Cost Considerations

SMS messaging typically incurs costs:
- Twilio: ~$0.0075 per message to Tanzania
- Africa's Talking: Competitive rates for African countries
- Local providers: Check local pricing

Set up usage alerts to monitor costs.

## Support

For issues with SMS setup:
1. Check provider documentation
2. Verify credentials and configuration
3. Test with provider's API directly
4. Contact provider support