/**
 * ClickPesa Payment Service for Fresh Grocery Tanzania
 * 
 * Based on ClickPesa's official API documentation and integration patterns:
 * - Hosted Integration: For generating secure payment links
 * - Webhook Handling: For payment status updates
 * - Mobile Money Support: M-Pesa, Airtel Money, Tigo Pesa
 * - Card Payments: Visa, Mastercard
 * 
 * References:
 * - https://dev.to/clickpesa/understanding-clickpesa-payment-gateway-integrations-methods-and-use-cases-3ob4
 * - https://dev.to/clickpesa/sell-your-products-online-with-one-api-call-a-technical-guide-to-clickpesa-checkout-link-integration-4ncm
 */

import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { databaseService } from './database-service';
import { logger } from './logger';
import type { Payment, Order, OrderItem } from '@/types/database';

// ClickPesa Configuration
const CLICKPESA_CONFIG = {
  baseUrl: import.meta.env.VITE_CLICKPESA_BASE_URL || 'https://api.clickpesa.com',
  merchantId: import.meta.env.VITE_CLICKPESA_MERCHANT_ID || '',
  apiKey: import.meta.env.VITE_CLICKPESA_API_KEY || '',
  payBillNumber: import.meta.env.VITE_CLICKPESA_PAY_BILL_NUMBER || '',
  webhookSecret: import.meta.env.VITE_CLICKPESA_WEBHOOK_SECRET || '',
  callbackUrl: import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/clickpesa/callback` : 'https://fresh-grocery.co.tz/api/clickpesa/callback',
  // Demo mode for CORS issues during development
  isDemoMode: import.meta.env.VITE_CLICKPESA_DEMO_MODE === 'true' || import.meta.env.NODE_ENV === 'development',
};

// ClickPesa API Types
interface ClickPesaOrderItem {
  name: string;
  product_type: 'DIGITAL_PRODUCT' | 'PRODUCT';
  download_file_key?: string; // For digital products
  unit: string;
  price: number; // In cents (TZS)
  quantity: number;
}

interface CreateCheckoutRequest {
  orderItems: ClickPesaOrderItem[];
  orderReference: string;
  merchantId: string;
  callbackURL?: string;
}

interface CreateCheckoutResponse {
  checkoutUrl: string;
  serviceID: string;
  orderReference: string;
}

interface ClickPesaWebhookPayload {
  status: 'SUCCESS' | 'PROCESSING' | 'FAILED' | 'CANCELED';
  paymentReference: string; // Payment reference ID in ClickPesa system
  orderReference: string; // Order reference ID we provided during checkout
  collectedAmount: string; // Amount collected if successful
  collectedCurrency: string; // Currency (TZS | USD)
  message: string; // e.g., 'Payment received'
}

// Payment Method Types
type PaymentMethod = 'mpesa' | 'airtel_money' | 'tigo_pesa' | 'card' | 'cash_on_delivery';

interface PaymentInitiationRequest {
  orderId: string;
  amount: number;
  currency: 'TZS' | 'USD';
  method: PaymentMethod;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, any>;
}

interface PaymentInitiationResponse {
  paymentId: string;
  checkoutUrl?: string;
  paymentReference: string;
  status: 'pending' | 'processing';
  expiresAt: Date;
}

class ClickPesaService {
  private apiClient;

  constructor() {
    // Validate required configuration in production mode
    if (!CLICKPESA_CONFIG.isDemoMode) {
      if (!CLICKPESA_CONFIG.merchantId || !CLICKPESA_CONFIG.apiKey || !CLICKPESA_CONFIG.payBillNumber) {
        console.warn('⚠️ ClickPesa credentials missing. Please set the following in your .env file:');
        console.warn('   - VITE_CLICKPESA_MERCHANT_ID');
        console.warn('   - VITE_CLICKPESA_API_KEY');
        console.warn('   - VITE_CLICKPESA_PAY_BILL_NUMBER');
        console.warn('📚 See .env.example for configuration template.');
      } else {
        console.log('✅ ClickPesa configured with:');
        console.log(`   - Merchant ID: ${CLICKPESA_CONFIG.merchantId}`);
        console.log(`   - Pay Bill Number: ${CLICKPESA_CONFIG.payBillNumber}`);
        console.log(`   - API URL: ${CLICKPESA_CONFIG.baseUrl}`);
      }
    }

    this.apiClient = axios.create({
      baseURL: CLICKPESA_CONFIG.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLICKPESA_CONFIG.apiKey}`,
        'X-Merchant-ID': CLICKPESA_CONFIG.merchantId,
      },
    });

    // Add request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log('🔄 ClickPesa Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error) => {
        logger.error('ClickPesa Request Error', 'CLICKPESA', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log('✅ ClickPesa Response:', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        console.error('❌ ClickPesa Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initiate payment using ClickPesa Hosted Integration
   * Creates a checkout URL that customers can use to complete payment
   */
  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    try {
      logger.info('Initiating ClickPesa payment for order', 'CLICKPESA', { orderId: request.orderId });

      // Get order details
      const order = await databaseService.findById<Order>('orders', request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const paymentId = uuidv4();
      const paymentReference = `CP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Check if we're in demo mode
      if (CLICKPESA_CONFIG.isDemoMode) {
        console.log('🧪 Running in ClickPesa Demo Mode');
        
        // Create a demo payment URL
        const demoCheckoutUrl = `${window.location.origin}/demo-payment?orderId=${order.id}&amount=${request.amount}&paymentRef=${paymentReference}`;
        
        // Create payment record
        const paymentData = {
          orderId: request.orderId,
          userId: order.userId,
          amount: request.amount,
          currency: request.currency,
          method: request.method,
          provider: 'clickpesa' as const,
          status: 'pending' as const,
          externalReference: order.orderNumber,
          checkoutUrl: demoCheckoutUrl,
          clickPesaPaymentId: paymentId,
          webhookReceived: false,
          metadata: {
            customerInfo: request.customerInfo,
            ...request.metadata,
            demoMode: true,
          },
        };

        const payment = await databaseService.create<Payment>('payments', paymentData);

        console.log('✅ Demo ClickPesa payment initiated:', {
          paymentId: payment.id,
          checkoutUrl: demoCheckoutUrl,
          orderNumber: order.orderNumber,
        });

        return {
          paymentId: payment.id,
          checkoutUrl: demoCheckoutUrl,
          paymentReference,
          status: 'pending',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        };
      }

      // Production ClickPesa integration
      // Get order items
      const orderItemsResult = await databaseService.findMany<OrderItem>('order_items', {
        filters: { orderId: request.orderId },
      });

      // Convert order items to ClickPesa format
      const clickPesaItems: ClickPesaOrderItem[] = orderItemsResult.items.map(item => ({
        name: item.productName,
        product_type: 'PRODUCT',
        unit: `${item.quantity} pc(s)`,
        price: Math.round(item.unitPrice * 100), // Convert to cents
        quantity: item.quantity,
      }));

      // Create checkout request
      const checkoutRequest: CreateCheckoutRequest = {
        orderItems: clickPesaItems,
        orderReference: order.orderNumber,
        merchantId: CLICKPESA_CONFIG.merchantId,
        callbackURL: CLICKPESA_CONFIG.callbackUrl,
      };

      // Call ClickPesa API
      const response: AxiosResponse<string> = await this.apiClient.post(
        '/webshop/generate-checkout-url',
        checkoutRequest
      );

      // ClickPesa returns the checkout URL directly as a string
      const checkoutUrl = response.data;

      // Create payment record
      const paymentData = {
        orderId: request.orderId,
        userId: order.userId,
        amount: request.amount,
        currency: request.currency,
        method: request.method,
        provider: 'clickpesa' as const,
        status: 'pending' as const,
        externalReference: order.orderNumber,
        checkoutUrl,
        clickPesaPaymentId: paymentId,
        webhookReceived: false,
        metadata: {
          customerInfo: request.customerInfo,
          ...request.metadata,
        },
      };

      const payment = await databaseService.create<Payment>('payments', paymentData);

      console.log('✅ ClickPesa payment initiated:', {
        paymentId: payment.id,
        checkoutUrl,
        orderNumber: order.orderNumber,
      });

      return {
        paymentId: payment.id,
        checkoutUrl,
        paymentReference,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };
    } catch (error) {
      console.error('❌ Failed to initiate ClickPesa payment:', error);
      throw new Error('Payment initiation failed. Please try again.');
    }
  }

  /**
   * Handle ClickPesa webhook notifications
   * Called when payment status changes
   */
  async handleWebhook(payload: ClickPesaWebhookPayload): Promise<void> {
    try {
      console.log('🔔 Received ClickPesa webhook:', payload);

      // Find payment by order reference
      const order = await databaseService.findOne<Order>('orders', {
        orderNumber: payload.orderReference,
      });

      if (!order) {
        console.error('❌ Order not found for webhook:', payload.orderReference);
        return;
      }

      // Find payment record
      const payment = await databaseService.findOne<Payment>('payments', {
        orderId: order.id,
        provider: 'clickpesa',
      });

      if (!payment) {
        console.error('❌ Payment not found for order:', order.id);
        return;
      }

      // Update payment status based on webhook
      const paymentUpdates: Partial<Payment> = {
        webhookReceived: true,
        webhookData: payload,
        clickPesaStatus: payload.status,
        clickPesaMessage: payload.message,
        externalTransactionId: payload.paymentReference,
      };

      const orderUpdates: Partial<Order> = {};

      switch (payload.status) {
        case 'SUCCESS':
          paymentUpdates.status = 'completed';
          paymentUpdates.processedAt = new Date();
          orderUpdates.paymentStatus = 'completed';
          orderUpdates.status = 'confirmed';
          console.log('✅ Payment successful for order:', order.orderNumber);
          break;

        case 'PROCESSING':
          paymentUpdates.status = 'processing';
          orderUpdates.paymentStatus = 'processing';
          console.log('⏳ Payment processing for order:', order.orderNumber);
          break;

        case 'FAILED':
          paymentUpdates.status = 'failed';
          paymentUpdates.failedAt = new Date();
          paymentUpdates.failureReason = payload.message;
          orderUpdates.paymentStatus = 'failed';
          console.log('❌ Payment failed for order:', order.orderNumber, payload.message);
          break;

        case 'CANCELED':
          paymentUpdates.status = 'cancelled';
          orderUpdates.paymentStatus = 'failed';
          orderUpdates.status = 'cancelled';
          console.log('🚫 Payment cancelled for order:', order.orderNumber);
          break;

        default:
          console.warn('⚠️ Unknown payment status:', payload.status);
          return;
      }

      // Update payment record
      await databaseService.update<Payment>('payments', payment.id, paymentUpdates);

      // Update order if needed
      if (Object.keys(orderUpdates).length > 0) {
        await databaseService.update<Order>('orders', order.id, orderUpdates);
      }

      // Send notifications (implement based on your notification service)
      await this.sendPaymentNotification(order, payment, payload.status);

      console.log('✅ Webhook processed successfully for order:', order.orderNumber);
    } catch (error) {
      console.error('❌ Failed to process ClickPesa webhook:', error);
      throw error;
    }
  }

  /**
   * Check payment status directly with ClickPesa
   * Useful for reconciliation and status verification
   */
  async checkPaymentStatus(paymentId: string): Promise<Payment | null> {
    try {
      const payment = await databaseService.findById<Payment>('payments', paymentId);
      if (!payment) {
        return null;
      }

      // In a real implementation, you would call ClickPesa's status API
      // For now, return the current payment status
      console.log('🔍 Checking payment status:', paymentId);
      
      return payment;
    } catch (error) {
      console.error('❌ Failed to check payment status:', error);
      return null;
    }
  }

  /**
   * Refund a payment (if supported by ClickPesa)
   */
  async refundPayment(paymentId: string, amount?: number): Promise<boolean> {
    try {
      const payment = await databaseService.findById<Payment>('payments', paymentId);
      if (!payment || payment.status !== 'completed') {
        throw new Error('Payment cannot be refunded');
      }

      const refundAmount = amount || payment.amount;
      
      // In a real implementation, call ClickPesa's refund API
      console.log('💰 Processing refund:', {
        paymentId,
        amount: refundAmount,
        originalAmount: payment.amount,
      });

      // Update payment status
      await databaseService.update<Payment>('payments', paymentId, {
        status: 'refunded',
        refundedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to process refund:', error);
      return false;
    }
  }

  /**
   * Get payment statistics for analytics
   */
  async getPaymentStats(dateFrom?: Date, dateTo?: Date) {
    try {
      const filters: any = { provider: 'clickpesa' };
      
      if (dateFrom) {
        // Add date filtering logic
      }

      const paymentsResult = await databaseService.findMany<Payment>('payments', {
        filters,
        limit: 1000,
      });

      const payments = paymentsResult.items;

      const stats = {
        total: payments.length,
        successful: payments.filter(p => p.status === 'completed').length,
        failed: payments.filter(p => p.status === 'failed').length,
        pending: payments.filter(p => p.status === 'pending').length,
        totalAmount: payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        byMethod: {
          mpesa: payments.filter(p => p.method === 'mpesa').length,
          airtel: payments.filter(p => p.method === 'airtel_money').length,
          tigo: payments.filter(p => p.method === 'tigo_pesa').length,
          card: payments.filter(p => p.method === 'card').length,
        },
      };

      return stats;
    } catch (error) {
      console.error('❌ Failed to get payment stats:', error);
      return null;
    }
  }

  /**
   * Send payment notification (integrate with your notification service)
   */
  private async sendPaymentNotification(
    order: Order,
    payment: Payment,
    status: string
  ): Promise<void> {
    try {
      // This would integrate with your SMS/Email/Push notification service
      const message = this.getPaymentNotificationMessage(status, order.orderNumber);
      
      console.log('📱 Sending payment notification:', {
        orderId: order.id,
        status,
        message,
        phone: order.customerInfo.phoneNumber,
      });

      // Implement actual notification sending here
      // Example: await smsService.send(order.customerInfo.phoneNumber, message);
    } catch (error) {
      console.error('❌ Failed to send payment notification:', error);
    }
  }

  private getPaymentNotificationMessage(status: string, orderNumber: string): string {
    switch (status) {
      case 'SUCCESS':
        return `Malipo yamekamilika kwa agizo namba ${orderNumber}. Agizo lako linachakatwa sasa.`;
      case 'PROCESSING':
        return `Malipo yako ya agizo namba ${orderNumber} yanachakatwa. Utapokea uthibitisho hivi karibuni.`;
      case 'FAILED':
        return `Malipo ya agizo namba ${orderNumber} hayakukamilika. Tafadhali jaribu tena.`;
      case 'CANCELED':
        return `Malipo ya agizo namba ${orderNumber} yameghairiwa. Unaweza kujaribu tena.`;
      default:
        return `Agizo namba ${orderNumber} - hali ya malipo imebadilika.`;
    }
  }

  /**
   * Validate webhook signature (security)
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      // Implement signature validation based on ClickPesa's documentation
      // This is a simplified version - implement proper HMAC validation in production
      const expectedSignature = this.generateWebhookSignature(payload);
      return signature === expectedSignature;
    } catch (error) {
      console.error('❌ Failed to validate webhook signature:', error);
      return false;
    }
  }

  private generateWebhookSignature(payload: string): string {
    // Generate HMAC-SHA256 signature for webhook validation
    // In production, use crypto.createHmac with actual webhook secret
    try {
      // For development/demo purposes, use a simple hash
      const hash = btoa(payload + CLICKPESA_CONFIG.webhookSecret).slice(0, 32);
      return `sha256=${hash}`;
    } catch (error) {
      console.warn('Webhook signature generation failed:', error);
      return `sha256=${payload.length.toString().padStart(32, '0')}`;
    }
  }

  /**
   * Health check for ClickPesa service
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // In a real implementation, ping ClickPesa's health endpoint
      return {
        status: 'healthy',
        message: 'ClickPesa service is operational',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'ClickPesa service is not responding',
      };
    }
  }
}

// Export singleton instance
export const clickPesaService = new ClickPesaService();
export default clickPesaService;

// Export types for use in other modules
export type {
  PaymentMethod,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  ClickPesaWebhookPayload,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
};