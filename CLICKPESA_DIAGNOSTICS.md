# ClickPesa Integration Diagnostics Guide

This document explains how to diagnose and troubleshoot ClickPesa payment integration issues in the Freshed Grocery application.

## Available Diagnostic Tools

### 1. Admin Dashboard Integration Panel
Access the ClickPesa tools directly from the admin dashboard:
1. Navigate to `/admin`
2. Click on the "ClickPesa" tab
3. Use the "Run Diagnostics" button to check service health
4. Use the "Test Payment" button to initiate test payments

### 2. Dedicated Test Page
Access the comprehensive test page at `/clickpesa-test` which includes:
- Service health checking
- Manual payment initiation testing
- Payment statistics viewing
- Troubleshooting guide

### 3. Browser Console Utilities
Several utility functions are available in the browser console for advanced debugging:

```javascript
// Check ClickPesa service health
testClickPesaHealth()

// Test payment initiation
testPaymentInitiation({
  orderId: 'test123',
  amount: 5000,
  phone: '+255712345678',
  method: 'airtel_money',
  name: 'Test User',
  email: 'test@example.com'
})

// Test phone number formatting
testPhoneNumberFormatting('+255 712 345 678')

// Get payment statistics
getPaymentStats()
```

## Common Issues and Solutions

### 1. USSD Payment Prompts Not Received
**Possible Causes:**
- Network connectivity issues with ClickPesa's API
- Incorrect phone number formatting
- Delays in USSD prompt delivery (can take up to 2 minutes)
- Issues with ClickPesa's USSD-PUSH service

**Solutions:**
1. Verify phone number format (+255XXXXXXXXX)
2. Check network connectivity
3. Wait up to 2 minutes for delivery
4. Try a different phone number
5. Check ClickPesa dashboard for outages

### 2. Service Appears Unhealthy
**Possible Causes:**
- ClickPesa API downtime
- Incorrect API credentials
- Network connectivity issues
- Firewall/proxy blocking requests

**Solutions:**
1. Check ClickPesa dashboard for outages
2. Verify API credentials in .env file
3. Test with different network connection
4. Contact ClickPesa support

### 3. Orders Not Appearing in Profile
**Possible Causes:**
- User ID mismatch in order records
- Timing issues in data retrieval
- Caching problems

**Solutions:**
1. Verify user ID is correctly stored with orders
2. Refresh the page or wait for data to sync
3. Clear browser cache and try again

## Testing Different Payment Methods

### Airtel Money
- Phone format: +2556XXXXXXXX or +2557XXXXXXXX
- Works in production mode

### M-Pesa
- Requires activation by ClickPesa support
- Contact support@clickpesa.com to enable

### Tigo Pesa
- Should work out of the box
- Phone format: +2556XXXXXXXX or +2557XXXXXXXX

### Card Payments
- Requires KYC completion in ClickPesa dashboard
- Currently in development/testing phase

## Environment Configuration

Ensure your `.env` file has the correct ClickPesa configuration:

```env
VITE_CLICKPESA_API_KEY=your_actual_api_key
VITE_CLICKPESA_MERCHANT_ID=your_merchant_id
VITE_CLICKPESA_PAY_BILL_NUMBER=your_pay_bill_number
VITE_CLICKPESA_BASE_URL=https://api.clickpesa.com
VITE_CLICKPESA_WEBHOOK_SECRET=your_webhook_secret
VITE_CLICKPESA_DEMO_MODE=false
```

## Monitoring and Logging

All ClickPesa operations are logged to the browser console with detailed information:
- Request and response data
- Error messages and stack traces
- Payment status updates
- Webhook processing

Check the browser's developer console (F12) for detailed logs during payment processing.

## Contact Support

If issues persist:
1. Check the ClickPesa developer documentation: https://dev.to/clickpesa
2. Contact ClickPesa support: support@clickpesa.com
3. Provide detailed logs from the browser console
4. Include order IDs and payment references when reporting issues