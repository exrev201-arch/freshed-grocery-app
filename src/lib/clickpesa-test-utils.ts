/**
 * ClickPesa Test Utilities
 * 
 * This module provides utility functions for testing ClickPesa integration
 * directly from the browser console or test pages.
 */

import { clickPesaService } from './clickpesa-service';
import { table } from './backend-service';

// Make services available globally for debugging
(window as any).clickPesaService = clickPesaService;
(window as any).table = table;

/**
 * Test ClickPesa service health
 */
export async function testClickPesaHealth(): Promise<void> {
  console.log('🔍 Testing ClickPesa service health...');
  try {
    const status = await clickPesaService.healthCheck();
    console.log('✅ Health check result:', status);
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

/**
 * Test payment initiation with mock data
 */
export async function testPaymentInitiation(options: {
  orderId?: string;
  amount?: number;
  phone?: string;
  method?: 'mpesa' | 'airtel_money' | 'tigo_pesa' | 'card' | 'cash_on_delivery';
  name?: string;
  email?: string;
}): Promise<void> {
  const {
    orderId = `test_order_${Date.now()}`,
    amount = 1000,
    phone = '+255712345678',
    method = 'airtel_money',
    name = 'Test User',
    email = 'test@example.com'
  } = options;

  console.log('🔍 Testing payment initiation...', { orderId, amount, phone, method });

  try {
    // Create a mock order for testing
    const mockOrder = {
      _id: orderId,
      _uid: 'test_uid',
      orderNumber: `TEST${Date.now()}`,
      userId: 'test_user',
      total_amount: amount,
      order_id: orderId,
    };

    // Mock the table service to return our test order
    const originalGetItems = table.getItems;
    table.getItems = async (tableId: string, queryOptions: any) => {
      if (tableId === 'orders' && queryOptions.query?._id === orderId) {
        return {
          items: [mockOrder],
          total: 1,
          hasMore: false
        };
      }
      return await originalGetItems(tableId, queryOptions);
    };

    // Run the payment initiation
    const paymentRequest = {
      orderId,
      amount,
      currency: 'TZS' as const,
      method,
      customerInfo: {
        name,
        email,
        phone,
      },
    };

    console.log('🔍 Initiating test payment with request:', paymentRequest);
    const response = await clickPesaService.initiatePayment(paymentRequest);
    console.log('✅ Test payment response:', response);

    // Restore original getItems method
    table.getItems = originalGetItems;
  } catch (error) {
    console.error('❌ Test payment failed:', error);
  }
}

/**
 * Test phone number formatting
 */
export function testPhoneNumberFormatting(phone: string): string | null {
  console.log('🔍 Testing phone number formatting:', phone);
  
  // Format phone number for ClickPesa API
  let formattedPhoneNumber = phone;
  
  // Remove any spaces, dashes, or parentheses
  formattedPhoneNumber = formattedPhoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Ensure it starts with +255 or 255
  if (formattedPhoneNumber.startsWith('0')) {
    formattedPhoneNumber = '+255' + formattedPhoneNumber.substring(1);
  } else if (formattedPhoneNumber.startsWith('255')) {
    formattedPhoneNumber = '+' + formattedPhoneNumber;
  } else if (!formattedPhoneNumber.startsWith('+255')) {
    formattedPhoneNumber = '+255' + formattedPhoneNumber;
  }
  
  // Validate the formatted phone number for Tanzanian mobile networks
  const phoneRegex = /^\+255[67][0-9]{8}$/;
  if (!phoneRegex.test(formattedPhoneNumber)) {
    console.error('❌ Invalid phone number format');
    return null;
  }
  
  console.log('✅ Formatted phone number:', formattedPhoneNumber);
  return formattedPhoneNumber;
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(): Promise<void> {
  console.log('🔍 Getting payment statistics...');
  try {
    const stats = await clickPesaService.getPaymentStats();
    console.log('✅ Payment statistics:', stats);
  } catch (error) {
    console.error('❌ Failed to get payment statistics:', error);
  }
}

// Make functions available globally
(window as any).testClickPesaHealth = testClickPesaHealth;
(window as any).testPaymentInitiation = testPaymentInitiation;
(window as any).testPhoneNumberFormatting = testPhoneNumberFormatting;
(window as any).getPaymentStats = getPaymentStats;

console.log('✅ ClickPesa test utilities loaded. Available functions:');
console.log('- testClickPesaHealth()');
console.log('- testPaymentInitiation(options)');
console.log('- testPhoneNumberFormatting(phone)');
console.log('- getPaymentStats()');

export default {
  testClickPesaHealth,
  testPaymentInitiation,
  testPhoneNumberFormatting,
  getPaymentStats
};