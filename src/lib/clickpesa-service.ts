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
import { table } from './backend-service';
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

// Add new interfaces for USSD-PUSH API
interface UssdPushPreviewRequest {
  mobile_number: string;
  amount: number;
  order_reference: string;
  currency?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  merchant_id?: string;
}

interface UssdPushPreviewResponse {
  status: boolean;
  message: string;
  data?: {
    transaction_id: string;
    charge: number;
    currency: string;
  };
}

interface UssdPushInitiateRequest {
  mobile_number: string;
  amount: number;
  order_reference: string;
  currency?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  transaction_id: string; // From preview response
  merchant_id?: string;
}

interface UssdPushInitiateResponse {
  status: boolean;
  message: string;
  data?: {
    payment_reference: string;
    transaction_id: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  };
}

interface PaymentQueryRequest {
  order_reference: string;
}

interface PaymentQueryResponse {
  status: boolean;
  message: string;
  data?: {
    payment_reference: string;
    order_reference: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    mobile_number: string;
    transaction_date: string;
  };
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
      },
    });

    // For browser environments, avoid CORS issues by not setting X-Merchant-ID header
    // Merchant ID will be passed in request body where supported
    // Only set header in non-browser environments
    this.apiClient.interceptors.request.use(
      (config) => {
        if (typeof window === 'undefined') {
          config.headers['X-Merchant-ID'] = CLICKPESA_CONFIG.merchantId;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log('🔄 ClickPesa Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: config.headers,
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
   * Initiate payment using ClickPesa Mobile Money Payment API (USSD-PUSH)
   * Creates a payment request that sends USSD prompt to customer's phone
   */
  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    try {
      logger.info('Initiating ClickPesa payment for order', 'CLICKPESA', { orderId: request.orderId });

      // Get order details - using backend service to match order creation
      console.log('🔍 Looking for order with ID:', request.orderId);
      
      // Use the same approach as order creation - search by _id
      const orderResult = await table.getItems('orders', {
        query: { _id: request.orderId },
        limit: 1
      });
      
      console.log('🔍 Order search result:', orderResult);
      
      if (!orderResult.items || orderResult.items.length === 0) {
        throw new Error(`Order not found with ID: ${request.orderId}`);
      }
      
      const order = orderResult.items[0] as unknown as Order;
      console.log('✅ Found order by _id:', order);

      const paymentId = uuidv4();
      const paymentReference = `CP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Check if we're in demo mode
      if (CLICKPESA_CONFIG.isDemoMode) {
        console.log('🧪 Running in ClickPesa Demo Mode');
        
        // Create a demo payment URL
        const demoCheckoutUrl = `${window.location.origin}/demo-payment?orderId=${(order as any)._id || order.id}&amount=${request.amount}&paymentRef=${paymentReference}`;
        
        // Create payment record
        const paymentData = {
          orderId: request.orderId,
          userId: order.userId, // Use userId for consistency
          amount: request.amount,
          currency: request.currency,
          method: request.method,
          provider: 'clickpesa',
          status: 'pending',
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

        const paymentItem = await table.addItem('payments', paymentData);
        const payment = {
          id: paymentItem._id,
          ...paymentItem
        } as unknown as Payment;

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

      // For Mobile Money methods, use USSD-PUSH API
      if (['mpesa', 'airtel_money', 'tigo_pesa'].includes(request.method)) {
        // Validate phone number
        if (!request.customerInfo.phone) {
          throw new Error('Phone number is required for mobile money payments');
        }
        
        // Format phone number for ClickPesa API
        let formattedPhoneNumber = request.customerInfo.phone;
        
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
          throw new Error('Invalid phone number format. Please use format: +255 7XX XXX XXX or +255 6XX XXX XXX');
        }
        
        console.log('🔍 Original phone number:', request.customerInfo.phone);
        console.log('🔍 Formatted phone number:', formattedPhoneNumber);
        
        // Step 1: Preview USSD-PUSH request
        const previewRequest: UssdPushPreviewRequest = {
          mobile_number: formattedPhoneNumber,
          amount: request.amount,
          order_reference: order.orderNumber,
          currency: request.currency,
          first_name: request.customerInfo.name.split(' ')[0],
          last_name: request.customerInfo.name.split(' ').slice(1).join(' '),
          email: request.customerInfo.email,
          // Include merchant ID in request body if needed
          merchant_id: CLICKPESA_CONFIG.merchantId
        };

        console.log('🔍 Sending preview request to ClickPesa:', previewRequest);
        const previewResponse = await this.previewUssdPush(previewRequest);
        console.log('✅ Preview response from ClickPesa:', previewResponse);

        if (!previewResponse.status) {
          throw new Error(previewResponse.message || 'Failed to preview USSD-PUSH request');
        }

        // Step 2: Initiate USSD-PUSH request
        const initiateRequest: UssdPushInitiateRequest = {
          ...previewRequest,
          transaction_id: previewResponse.data?.transaction_id || ''
        };

        console.log('🔍 Sending initiate request to ClickPesa:', initiateRequest);
        const initiateResponse = await this.initiateUssdPush(initiateRequest);
        console.log('✅ Initiate response from ClickPesa:', initiateResponse);

        if (!initiateResponse.status) {
          throw new Error(initiateResponse.message || 'Failed to initiate USSD-PUSH request');
        }

        // Create payment record
        const paymentData = {
          orderId: request.orderId,
          userId: order.userId, // Use userId for consistency
          amount: request.amount,
          currency: request.currency,
          method: request.method,
          provider: 'clickpesa',
          status: 'pending',
          externalReference: order.orderNumber,
          externalTransactionId: initiateResponse.data?.payment_reference,
          clickPesaPaymentId: paymentId,
          webhookReceived: false,
          metadata: {
            customerInfo: request.customerInfo,
            transactionId: initiateResponse.data?.transaction_id,
            ...request.metadata,
          },
        };

        console.log('🔍 Creating payment record:', paymentData);
        const paymentItem = await table.addItem('payments', paymentData);
        const payment = {
          id: paymentItem._id,
          ...paymentItem
        } as unknown as Payment;
        console.log('✅ Payment record created:', payment);

        console.log('✅ ClickPesa USSD-PUSH payment initiated:', {
          paymentId: payment.id,
          paymentReference: initiateResponse.data?.payment_reference,
          orderNumber: order.orderNumber,
        });

        return {
          paymentId: payment.id,
          paymentReference: initiateResponse.data?.payment_reference || '',
          status: 'pending',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        };
      }

      // For card payments, fallback to hosted checkout
      // Get order items
      const orderItemsResult = await table.getItems('order_items', {
        query: { orderId: request.orderId },
        limit: 100
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

      console.log('🔍 Sending checkout request to ClickPesa:', checkoutRequest);
      // Call ClickPesa API
      const response: AxiosResponse<string> = await this.apiClient.post(
        '/webshop/generate-checkout-url',
        checkoutRequest
      );
      console.log('✅ Checkout response from ClickPesa:', response);

      // ClickPesa returns the checkout URL directly as a string
      const checkoutUrl = response.data;

      // Create payment record
      const paymentData = {
        orderId: request.orderId,
        userId: order.userId, // Use userId for consistency
        amount: request.amount,
        currency: request.currency,
        method: request.method,
        provider: 'clickpesa',
        status: 'pending',
        externalReference: order.orderNumber,
        checkoutUrl,
        clickPesaPaymentId: paymentId,
        webhookReceived: false,
        metadata: {
          customerInfo: request.customerInfo,
          ...request.metadata,
        },
      };

      console.log('🔍 Creating payment record:', paymentData);
      const paymentItem = await table.addItem('payments', paymentData);
      const payment = {
        id: paymentItem._id,
        ...paymentItem
      } as unknown as Payment;
      console.log('✅ Payment record created:', payment);

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
    } catch (error: any) {
      console.error('❌ Failed to initiate ClickPesa payment:', error);
      
      // Provide more specific error messages based on the error type
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection to payment provider timed out. Please check your internet connection and try again.');
      } else if (error.message && error.message.includes('network')) {
        throw new Error('Unable to connect to payment provider. Please check your internet connection and try again.');
      } else if (error.message && error.message.includes('preview')) {
        throw new Error('Unable to initialize payment. Please verify your phone number is correct and try again.');
      } else {
        throw new Error(error.message || 'Payment initiation failed. Please try again.');
      }
    }
  }

  /**
   * Handle ClickPesa webhook notifications
   * Called when payment status changes
   */
  async handleWebhook(payload: ClickPesaWebhookPayload): Promise<void> {
    try {
      console.log('🔔 Received ClickPesa webhook:', payload);

      // Find order by orderNumber (which is the custom order ID we created)
      console.log('🔍 Looking for order with orderNumber:', payload.orderReference);
      const orderResult = await table.getItems('orders', {
        query: { orderNumber: payload.orderReference },
        limit: 1
      });
      
      console.log('🔍 Order search result for webhook:', orderResult);
      
      if (!orderResult.items || orderResult.items.length === 0) {
        console.error('❌ Order not found for webhook:', payload.orderReference);
        return;
      }
      
      const order = orderResult.items[0] as unknown as Order;

      // Find payment record by orderId and provider
      console.log('🔍 Looking for payment with orderId:', (order as any)._id || order.id);
      const paymentResult = await table.getItems('payments', {
        query: { orderId: (order as any)._id || order.id, provider: 'clickpesa' },
        limit: 1
      });
      
      console.log('🔍 Payment search result:', paymentResult);
      
      if (!paymentResult.items || paymentResult.items.length === 0) {
        console.error('❌ Payment not found for order:', (order as any)._id || order.id);
        return;
      }
      
      const payment = paymentResult.items[0] as unknown as Payment & { _id: string };

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

      // Update payment record using backend service
      await table.updateItem('payments', {
        _id: payment._id,
        _uid: payment.userId,
        ...paymentUpdates
      });

      // Update order if needed using backend service
      if (Object.keys(orderUpdates).length > 0) {
        await table.updateItem('orders', {
          _id: (order as any)._id || order.id,
          _uid: order.userId,
          userId: order.userId,
          ...orderUpdates
        });
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
   * Preview USSD-PUSH request to validate payment details
   * Step 1 of ClickPesa Mobile Money Payment API
   */
  async previewUssdPush(request: UssdPushPreviewRequest): Promise<UssdPushPreviewResponse> {
    try {
      logger.info('Previewing ClickPesa USSD-PUSH request', 'CLICKPESA', request);

      // Check if we're in demo mode
      if (CLICKPESA_CONFIG.isDemoMode) {
        console.log('🧪 Running in ClickPesa Demo Mode - Preview');
        
        // Simulate successful preview
        return {
          status: true,
          message: 'Preview successful',
          data: {
            transaction_id: `txn_${Date.now()}`,
            charge: 0,
            currency: request.currency || 'TZS'
          }
        };
      }

      // Production ClickPesa integration
      const response: AxiosResponse<UssdPushPreviewResponse> = await this.apiClient.post(
        '/collection/ussd-push/preview',
        request
      );

      console.log('✅ ClickPesa USSD-PUSH preview:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to preview ClickPesa USSD-PUSH:', error);
      
      // Handle CORS/network errors specifically
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Unable to connect to payment provider. This may be due to network restrictions. Please try again or contact support.');
      }
      
      // Handle other API errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to preview USSD-PUSH request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Initiate USSD-PUSH request to send payment prompt to customer
   * Step 2 of ClickPesa Mobile Money Payment API
   */
  async initiateUssdPush(request: UssdPushInitiateRequest): Promise<UssdPushInitiateResponse> {
    try {
      logger.info('Initiating ClickPesa USSD-PUSH request', 'CLICKPESA', request);

      // Check if we're in demo mode
      if (CLICKPESA_CONFIG.isDemoMode) {
        console.log('🧪 Running in ClickPesa Demo Mode - Initiate');
        
        // Simulate successful initiation
        return {
          status: true,
          message: 'USSD-PUSH initiated successfully',
          data: {
            payment_reference: `pay_${Date.now()}`,
            transaction_id: request.transaction_id,
            status: 'PENDING'
          }
        };
      }

      // Production ClickPesa integration
      const response: AxiosResponse<UssdPushInitiateResponse> = await this.apiClient.post(
        '/collection/ussd-push/initiate',
        request
      );

      console.log('✅ ClickPesa USSD-PUSH initiated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to initiate ClickPesa USSD-PUSH:', error);
      
      // Handle CORS/network errors specifically
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Unable to connect to payment provider. This may be due to network restrictions. Please try again or contact support.');
      }
      
      // Handle other API errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate USSD-PUSH request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Query payment status
   * Step 3 of ClickPesa Mobile Money Payment API
   */
  async queryPaymentStatus(request: PaymentQueryRequest): Promise<PaymentQueryResponse> {
    try {
      logger.info('Querying ClickPesa payment status', 'CLICKPESA', request);

      // Check if we're in demo mode
      if (CLICKPESA_CONFIG.isDemoMode) {
        console.log('🧪 Running in ClickPesa Demo Mode - Query Status');
        
        // Simulate successful query
        return {
          status: true,
          message: 'Payment status retrieved',
          data: {
            payment_reference: `pay_${Date.now()}`,
            order_reference: request.order_reference,
            amount: 1000,
            currency: 'TZS',
            status: 'SUCCESS',
            mobile_number: '+255XXXXXXXXX',
            transaction_date: new Date().toISOString()
          }
        };
      }

      // Production ClickPesa integration
      const response: AxiosResponse<PaymentQueryResponse> = await this.apiClient.get(
        `/collection/payments/query?order_reference=${request.order_reference}`
      );

      console.log('✅ ClickPesa payment status:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to query ClickPesa payment status:', error);
      throw new Error(error.response?.data?.message || 'Failed to query payment status');
    }
  }

  /**
   * Check payment status directly with ClickPesa
   * Useful for reconciliation and status verification
   */
  async checkPaymentStatus(paymentId: string): Promise<Payment | null> {
    try {
      // Use backend service instead of databaseService for consistency
      const paymentResult = await table.getItems('payments', {
        query: { _id: paymentId },
        limit: 1
      });
      
      const payment = paymentResult.items?.[0] as unknown as Payment;
      if (!payment) {
        return null;
      }

      // For demo mode, return the current payment status
      if (CLICKPESA_CONFIG.isDemoMode) {
        console.log('🔍 Checking payment status (demo mode):', paymentId);
        return payment;
      }

      // Query payment status from ClickPesa
      const queryRequest: PaymentQueryRequest = {
        order_reference: payment.externalReference || ''
      };

      const queryResponse = await this.queryPaymentStatus(queryRequest);

      if (!queryResponse.status) {
        console.error('❌ Failed to query payment status:', queryResponse.message);
        return payment; // Return existing payment data
      }

      // Update payment status based on ClickPesa response
      const paymentUpdates: Partial<Payment> = {
        clickPesaStatus: queryResponse.data?.status,
        externalTransactionId: queryResponse.data?.payment_reference,
      };

      const orderUpdates: Partial<Order> = {};

      switch (queryResponse.data?.status) {
        case 'SUCCESS':
          paymentUpdates.status = 'completed';
          paymentUpdates.processedAt = new Date();
          orderUpdates.paymentStatus = 'completed';
          orderUpdates.status = 'confirmed';
          console.log('✅ Payment successful for order:', payment.externalReference);
          break;

        case 'PROCESSING':
          paymentUpdates.status = 'processing';
          orderUpdates.paymentStatus = 'processing';
          console.log('⏳ Payment processing for order:', payment.externalReference);
          break;

        case 'FAILED':
          paymentUpdates.status = 'failed';
          paymentUpdates.failedAt = new Date();
          paymentUpdates.failureReason = 'Payment failed';
          orderUpdates.paymentStatus = 'failed';
          console.log('❌ Payment failed for order:', payment.externalReference);
          break;

        case 'CANCELLED':
          paymentUpdates.status = 'cancelled';
          orderUpdates.paymentStatus = 'failed';
          orderUpdates.status = 'cancelled';
          console.log('🚫 Payment cancelled for order:', payment.externalReference);
          break;

        default:
          console.log('ℹ️ Payment status unchanged for order:', payment.externalReference);
          return payment;
      }

      // Update payment record using backend service
      await table.updateItem('payments', {
        _id: (payment as any)._id || (payment as any).id,
        _uid: payment.userId,
        ...paymentUpdates
      });

      // Update order if needed
      if (Object.keys(orderUpdates).length > 0 && payment.orderId) {
        await table.updateItem('orders', {
          _id: payment.orderId,
          _uid: payment.userId,
          userId: (payment as any).userId,
          ...orderUpdates
        });
      }

      // Return updated payment by fetching it again
      const updatedPaymentResult = await table.getItems('payments', {
        query: { _id: paymentId },
        limit: 1
      });
      
      return updatedPaymentResult.items?.[0] as unknown as Payment;
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
      // Use backend service instead of databaseService for consistency
      const paymentResult = await table.getItems('payments', {
        query: { _id: paymentId },
        limit: 1
      });
      
      const payment = paymentResult.items?.[0] as unknown as Payment;
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

      // Update payment status using backend service
      await table.updateItem('payments', {
        _id: (payment as any)._id || (payment as any).id,
        _uid: payment.userId,
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
      // Use backend service instead of databaseService for consistency
      const paymentsResult = await table.getItems('payments', {
        query: { provider: 'clickpesa' },
        limit: 1000,
      });

      const payments = paymentsResult.items as unknown as Payment[];

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
        orderId: (order as any)._id || order.id,
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
      // In demo mode, return simulated health status
      if (CLICKPESA_CONFIG.isDemoMode) {
        return {
          status: 'healthy',
          message: 'ClickPesa service is operational (demo mode)',
        };
      }

      // Make a real API call to check ClickPesa's health
      // We'll use the collections health endpoint if available
      const response = await this.apiClient.get('/health', {
        timeout: 10000 // 10 second timeout for health check
      });

      // If we get a successful response, the service is healthy
      if (response.status === 200) {
        return {
          status: 'healthy',
          message: 'ClickPesa service is operational',
        };
      } else {
        return {
          status: 'unhealthy',
          message: `ClickPesa service returned status ${response.status}`,
        };
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.code === 'ECONNABORTED') {
        return {
          status: 'unhealthy',
          message: 'ClickPesa service timeout - connection too slow',
        };
      } else if (error.response) {
        // The request was made and the server responded with a status code
        return {
          status: 'unhealthy',
          message: `ClickPesa service error: ${error.response.status} - ${error.response.statusText}`,
        };
      } else if (error.request) {
        // The request was made but no response was received
        return {
          status: 'unhealthy',
          message: 'ClickPesa service unreachable - network error',
        };
      } else {
        // Something happened in setting up the request
        return {
          status: 'unhealthy',
          message: `ClickPesa service configuration error: ${error.message}`,
        };
      }
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